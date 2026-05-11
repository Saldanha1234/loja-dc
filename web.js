/**
 * SISTEMA ALPHA STORE - MODAL FULL DESIGN & LISTAGEM DE PRODUTOS
 * Desenvolvido para: Guilherme David Oliveira Giuliani Ribeiro
 * STATUS: ARQUIVO COMPLETO + INTEGRAÇÃO BOT (PONTE VPS)
 * ATENÇÃO: Design de cards atualizado, animações de scroll e sistema de rotas.
 */

// ==========================================
// 1. CONFIGURAÇÕES GLOBAIS E ESTADO
// ==========================================
const API_URL = 'http://localhost:3000/api';
const BOT_GATEWAY = 'http://SEU_IP_AQUI:5000/webhook/order'; // Ponte para o bot.py na VPS
window.allProducts = []; 
window.currentCategory = 'Todos';

// ==========================================
// 2. INJEÇÃO DE CSS (DESIGN DO MODAL, CARDS E ANIMAÇÕES)
// ==========================================
const styleElement = document.createElement('style');
styleElement.innerHTML = `
    :root {
        --primary-bg: #0a0a0a;
        --secondary-bg: #111111;
        --accent-color: #ffce00;
        --border-color: #222222;
        --text-main: #ffffff;
        --text-dim: #888888;
    }

    /* Animação de Surgimento (Scroll) */
    .reveal {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .reveal.active {
        opacity: 1;
        transform: translateY(0);
    }

    /* Modal Full Screen */
    .modal-full-overlay {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: var(--primary-bg); display: none;
        z-index: 10000; overflow-y: auto; color: var(--text-main);
        font-family: 'Inter', sans-serif;
    }

    .modal-content-wrapper {
        max-width: 1200px; margin: 0 auto; padding: 40px 20px;
    }

    .modal-close-fixed {
        position: fixed; top: 20px; right: 30px; font-size: 2rem;
        color: var(--text-dim); cursor: pointer; z-index: 10001; transition: 0.3s;
    }
    .modal-close-fixed:hover { color: #fff; transform: rotate(90deg); }

    /* Layout Principal: 2 Colunas */
    .product-main-view {
        display: grid; grid-template-columns: 1.2fr 1fr; gap: 40px; margin-bottom: 60px;
    }

    .view-left .image-box {
        background: var(--secondary-bg); border-radius: 20px; border: 1px solid var(--border-color);
        padding: 60px; display: flex; justify-content: center; align-items: center; margin-bottom: 30px;
    }
    .view-left .image-box img { max-width: 300px; filter: drop-shadow(0 0 30px rgba(255, 206, 0, 0.2)); }

    .desc-section h3 { font-size: 1.2rem; text-transform: uppercase; margin-bottom: 20px; border-left: 4px solid var(--accent-color); padding-left: 15px; }
    .desc-content { color: var(--text-dim); line-height: 1.8; white-space: pre-wrap; font-size: 0.95rem; }

    .view-right .info-card {
        background: var(--secondary-bg); border-radius: 20px; border: 1px solid var(--border-color);
        padding: 30px; position: sticky; top: 40px;
    }
    .info-card h2 { font-size: 2rem; margin-bottom: 10px; }
    .price-large { font-size: 2.5rem; color: var(--accent-color); font-weight: 900; display: block; margin: 20px 0; }

    .action-buttons { display: flex; flex-direction: column; gap: 15px; margin-bottom: 30px; }
    .btn-main-buy { 
        background: var(--accent-color); color: #000; border: none; padding: 20px; 
        border-radius: 12px; font-weight: 800; font-size: 1.1rem; cursor: pointer;
        text-transform: uppercase; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 10px;
    }
    .btn-main-buy:hover { transform: scale(1.02); background: #e6b800; }
    
    .btn-outline-cart {
        background: transparent; border: 1px solid var(--border-color); color: #fff;
        padding: 15px; border-radius: 12px; cursor: pointer; transition: 0.3s;
    }
    .btn-outline-cart:hover { background: #1a1a1a; }

    .security-badges { display: flex; flex-direction: column; gap: 15px; margin-top: 30px; border-top: 1px solid var(--border-color); padding-top: 20px; }
    .badge-item { display: flex; align-items: center; gap: 15px; }
    .badge-item i { color: var(--accent-color); font-size: 1.2rem; }
    .badge-text strong { display: block; font-size: 0.9rem; color: #fff; }
    .badge-text span { font-size: 0.8rem; color: var(--text-dim); }

    /* Design do Card Conforme Vídeo */
    .product-card .p-name { color: #ffffff !important; font-weight: 800 !important; }
    .product-card .price-new { color: #ffffff !important; font-weight: 700; }
    .pix-badge { display: flex; align-items: center; gap: 5px; font-size: 0.65rem; color: #888; margin-top: 5px; }
    .pix-badge i { color: #00bfa5; }

    .related-section { margin-top: 80px; padding-top: 40px; border-top: 1px solid var(--border-color); }
    .related-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; margin-top: 20px; }

    .modal-footer {
        margin-top: 100px; padding: 40px 0; text-align: center; border-top: 1px solid var(--border-color);
    }
    .modal-footer p { color: var(--text-dim); font-size: 0.85rem; }

    .cart-notify {
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.8);
        background: rgba(0, 0, 0, 0.95); border: 1px solid var(--accent-color);
        padding: 25px 50px; border-radius: 15px; z-index: 20000;
        display: none; flex-direction: column; align-items: center; gap: 15px;
        box-shadow: 0 0 50px rgba(255, 206, 0, 0.2); transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .cart-notify.show { display: flex; transform: translate(-50%, -50%) scale(1); }
    .cart-notify i { color: var(--accent-color); font-size: 3rem; }
    .cart-notify p { color: #fff; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0; }
`;
document.head.appendChild(styleElement);

// ==========================================
// 3. SISTEMA DE ANIMAÇÃO NO SCROLL
// ==========================================
const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.1 });

function applyReveal() {
    document.querySelectorAll('.reveal').forEach(el => scrollObserver.observe(el));
}

// ==========================================
// 4. INTEGRAÇÃO COM O BOT (WEBHOOK PONTE)
// ==========================================
window.bridgeToDiscordBot = async function(customerData) {
    console.log("[Alpha Bridge] Iniciando conexão com a VPS...");
    const cart = JSON.parse(localStorage.getItem('alpha_cart')) || [];
    
    const payload = {
        discord_id: customerData.discordId,
        nome: customerData.nome,
        produto: cart.map(i => `${i.quantity}x ${i.name}`).join(', '),
        valor: cart.reduce((t, i) => t + (i.price * i.quantity), 0).toFixed(2),
        forma_pagamento: customerData.metodo || "Pix",
        empresa: "Alpha Store"
    };

    try {
        const response = await fetch(BOT_GATEWAY, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (response.ok) {
            console.log("[Alpha Bridge] Bot notificado com sucesso!");
        }
    } catch (e) {
        console.error("[Alpha Bridge] Falha ao conectar com o Bot na VPS:", e);
    }
};

// ==========================================
// 5. INICIALIZAÇÃO E CARREGAMENTO
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    createFullModalStructure();
    createNotifyStructure();
    fetchData();
});

function createFullModalStructure() {
    const modal = document.createElement('div');
    modal.id = 'fullProductModal';
    modal.className = 'modal-full-overlay';
    modal.innerHTML = `
        <i class="fa-solid fa-xmark modal-close-fixed" onclick="closeFullModal()"></i>
        <div class="modal-content-wrapper">
            <div class="product-main-view">
                <div class="view-left">
                    <div class="image-box" id="f-image"></div>
                    <div class="desc-section">
                        <h3>Descrição</h3>
                        <div class="desc-content" id="f-desc"></div>
                    </div>
                </div>
                <div class="view-right">
                    <div class="info-card">
                        <h2 id="f-title"></h2>
                        <span class="price-large" id="f-price"></span>
                        <div class="action-buttons">
                            <button class="btn-main-buy" id="f-btn-buy">
                                <i class="fa-solid fa-cart-shopping"></i> Adquirir agora
                            </button>
                            <button class="btn-outline-cart" id="f-btn-cart">
                                Adicionar ao carrinho
                            </button>
                        </div>
                        <div class="security-badges">
                            <div class="badge-item"><i class="fa-solid fa-bolt"></i><div class="badge-text"><strong>Entrega Imediata</strong><span>Receba seu produto automaticamente.</span></div></div>
                            <div class="badge-item"><i class="fa-solid fa-shield-halved"></i><div class="badge-text"><strong>Compra Segura</strong><span>Ambiente criptografado.</span></div></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="related-section">
                <h3>Produtos Similares</h3>
                <div class="related-grid" id="f-related"></div>
            </div>
            <div class="modal-footer"><p>Copyright © 2026 - Alpha Store.</p></div>
        </div>
    `;
    document.body.appendChild(modal);
}

function createNotifyStructure() {
    const notify = document.createElement('div');
    notify.id = 'cartNotification';
    notify.className = 'cart-notify';
    notify.innerHTML = `<i class="fa-solid fa-circle-check"></i><p>Adicionado ao Carrinho!</p>`;
    document.body.appendChild(notify);
}

async function fetchData() {
    try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error('Erro na API');
        window.allProducts = await response.json();
        renderCategories();
        renderProducts();
    } catch (error) {
        console.error("Falha ao carregar produtos:", error);
    }
}

// ==========================================
// 6. NAVEGAÇÃO E CATEGORIAS
// ==========================================
window.setCategory = function(cat) {
    window.currentCategory = cat;
    renderCategories();
    renderProducts();
};

function renderCategories() {
    const container = document.getElementById('categoryScroll');
    if (!container) return;
    const cats = ['Todos', ...new Set(window.allProducts.map(p => p.category))].sort();
    container.innerHTML = cats.map(cat => `
        <div class="cat-card-large reveal ${window.currentCategory === cat ? 'active' : ''}" onclick="setCategory('${cat}')">
            <span>${cat}</span>
        </div>
    `).join('');
    applyReveal();
}

window.renderProducts = function(filterText = '') {
    const menuElement = document.getElementById('menu');
    if (!menuElement) return;

    let filtered = window.allProducts.filter(p => {
        const matchCategory = (window.currentCategory === 'Todos' || p.category === window.currentCategory);
        return matchCategory && p.name.toLowerCase().includes(filterText.toLowerCase());
    });

    const grouped = {};
    filtered.forEach(p => {
        if (!grouped[p.category]) grouped[p.category] = [];
        grouped[p.category].push(p);
    });

    let html = '';
    for (const cat in grouped) {
        html += `
            <div class="category-block reveal">
                <h3 style="margin: 30px 0 20px; color: #fff; border-left: 4px solid var(--accent-color); padding-left: 15px;">${cat}</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px;">
                    ${grouped[cat].map(p => `
                        <div class="product-card reveal" onclick="openFullModal(${p.id})" style="background:#111; border:1px solid #222; border-radius:15px; padding:20px; cursor:pointer; transition: 0.3s;">
                            <img src="${p.image_url}" style="width:100%; height:150px; object-fit:contain; margin-bottom:15px;">
                            <h4 class="p-name">${p.name}</h4>
                            <div class="price-row" style="margin-top: 15px;">
                                <span class="price-new">R$ ${p.price.toFixed(2).replace('.', ',')}</span>
                                <div class="pix-badge"><i class="fa-brands fa-pix"></i> À vista no Pix</div>
                            </div>
                            <button class="btn-main-buy" style="width: 100%; padding: 10px; font-size: 0.8rem; margin-top: 15px;" onclick="event.stopPropagation(); openFullModal(${p.id})">
                                COMPRAR AGORA
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>`;
    }
    menuElement.innerHTML = html;
    applyReveal();
};

// ==========================================
// 7. MODAL DE PRODUTO & DISPARO PARA O CARRINHO
// ==========================================
window.openFullModal = function(productId) {
    const p = window.allProducts.find(x => x.id === productId);
    if (!p) return;

    document.getElementById('f-title').innerText = p.name;
    document.getElementById('f-price').innerText = `R$ ${p.price.toFixed(2).replace('.', ',')}`;
    document.getElementById('f-desc').innerText = p.description || 'Sem descrição.';
    document.getElementById('f-image').innerHTML = `<img src="${p.image_url}" alt="${p.name}">`;

    document.getElementById('f-btn-buy').onclick = () => {
        if (typeof window.addToCart === "function") {
            window.addToCart(p.id);
            if (typeof window.finalizePurchase === "function") window.finalizePurchase();
        }
    };

    document.getElementById('f-btn-cart').onclick = () => { 
        if (typeof window.addToCart === "function") {
            window.addToCart(p.id); 
            showCartNotification();
        }
    };

    const related = window.allProducts.filter(item => item.category === p.category && item.id !== p.id).slice(0, 4);
    document.getElementById('f-related').innerHTML = related.map(r => `
        <div class="product-card" onclick="openFullModal(${r.id})" style="background:#151515; border:1px solid #222; border-radius:12px; padding:15px; cursor:pointer; text-align:center;">
            <img src="${r.image_url}" style="width:80px; height:80px; object-fit:contain; margin-bottom:10px;">
            <h5 style="font-size:0.8rem; color:#fff;">${r.name}</h5>
            <p style="color:var(--accent-color); font-weight:700;">R$ ${r.price.toFixed(2).replace('.', ',')}</p>
        </div>`).join('');

    document.getElementById('fullProductModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
};

window.closeFullModal = function() {
    document.getElementById('fullProductModal').style.display = 'none';
    document.body.style.overflow = 'auto';
};

function showCartNotification() {
    const notify = document.getElementById('cartNotification');
    notify.classList.add('show');
    setTimeout(() => { notify.classList.remove('show'); }, 2000);
}

console.log("[Alpha Store] Sistema de interface e ponte de dados carregado.");