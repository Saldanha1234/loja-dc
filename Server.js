const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// ==========================================
// CONFIGURAÇÕES E MIDDLEWARES
// ==========================================

app.use(cors());

// Aumentando o limite para suportar o envio de imagens em Base64 da galeria
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Servindo arquivos estáticos (HTML, CSS, JS, Imagens)
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// 1. CONEXÃO COM O BANCO DE DADOS
// ==========================================

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error("❌ Erro ao abrir o banco de dados:", err.message);
    } else {
        console.log("✅ Conectado ao banco de dados SQLite.");
        createTables();
    }
});

function createTables() {
    // Tabela de Produtos
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        category TEXT NOT NULL,
        image_url TEXT,
        description TEXT
    )`);

    // Tabela de Categorias
    db.run(`CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        icon TEXT DEFAULT 'fa-star'
    )`);

    // Tabela de Pedidos
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        customer_email TEXT,
        discord_id TEXT,
        payment_method TEXT,
        items TEXT NOT NULL,
        total_value REAL NOT NULL,
        status TEXT DEFAULT 'Pendente',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
}

// ==========================================
// 2. ROTAS DE PRODUTOS (ALIMENTA O ADMIN)
// ==========================================

// Listar todos os produtos
app.get('/api/products', (req, res) => {
    db.all("SELECT * FROM products ORDER BY id DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Criar novo produto (Usado no modal do Admin)
app.post('/api/products', (req, res) => {
    const { name, price, category, image_url, description } = req.body;
    
    if (!name || !price || !category) {
        return res.status(400).json({ error: "Dados obrigatórios faltando." });
    }

    // Insere a categoria automaticamente se ela ainda não existir na tabela de categorias
    db.run(`INSERT OR IGNORE INTO categories (name) VALUES (?)`, [category]);

    const sql = `INSERT INTO products (name, price, category, image_url, description) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [name, price, category, image_url, description], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.status(201).json({ success: true, id: this.lastID });
    });
});

// Deletar produto
app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM products WHERE id = ?`, id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// ==========================================
// 3. ROTAS DE PEDIDOS E CHECKOUT
// ==========================================

// Finalizar compra (Vem da Loja/Index)
app.post('/api/finalize-checkout', (req, res) => {
    const { customer, paymentMethod, items, total } = req.body;

    const itemsString = JSON.stringify(items);
    const sql = `INSERT INTO orders (customer_name, discord_id, payment_method, items, total_value) VALUES (?, ?, ?, ?, ?)`;
    const params = [
        customer.name || 'Cliente Web', 
        customer.discordId || 'Não informado', 
        paymentMethod || 'Sistema', 
        itemsString, 
        total
    ];

    db.run(sql, params, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ success: true, orderId: this.lastID });
    });
});

// Listar pedidos no Admin
app.get('/api/orders', (req, res) => {
    db.all("SELECT * FROM orders ORDER BY created_at DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Atualizar status do pedido (Pendente -> Finalizado -> Cancelado)
app.patch('/api/orders/:id', (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    db.run(`UPDATE orders SET status = ? WHERE id = ?`, [status, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// ==========================================
// 4. ESTATÍSTICAS (PARA OS CARDS DO ADMIN)
// ==========================================

app.get('/api/stats', (req, res) => {
    const queries = {
        totalOrders: "SELECT COUNT(*) as count FROM orders",
        totalRevenue: "SELECT SUM(total_value) as revenue FROM orders WHERE status = 'Finalizado'",
        totalProducts: "SELECT COUNT(*) as count FROM products"
    };

    db.get(queries.totalOrders, (err, row1) => {
        db.get(queries.totalRevenue, (err, row2) => {
            db.get(queries.totalProducts, (err, row3) => {
                res.json({
                    totalOrders: row1 ? row1.count : 0,
                    totalRevenue: row2 ? (row2.revenue || 0) : 0,
                    totalProducts: row3 ? row3.count : 0
                });
            });
        });
    });
});

// ==========================================
// 5. INICIALIZAÇÃO
// ==========================================

app.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`🚀 ALPHA STORE - SERVIDOR RODANDO`);
    console.log(`🌐 Dashboard: http://localhost:${PORT}/admin.html`);
    console.log(`🛒 Loja: http://localhost:${PORT}/index.html`);
    console.log(`📁 Banco de Dados: SQLite (database.db)`);
    console.log(`========================================\n`);
});