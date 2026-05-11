const API_URL = 'http://localhost:3000/api';
let allProducts = [];
let currentImageBase64 = '';

// 1. INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    fetchOrders();
    fetchStats(); 
});

// 2. NAVEGAÇÃO ENTRE SEÇÕES
function showSection(section) {
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    const targetSection = document.getElementById(`section-${section}`);
    if (targetSection) targetSection.style.display = 'block';
    
    const activeBtn = document.getElementById(`btn-${section}`);
    if (activeBtn) activeBtn.classList.add('active');
}

// 3. BUSCAR DADOS DO SERVIDOR (ROTAS MANTIDAS)
async function fetchProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        allProducts = await response.json();
        renderProductsTable();
    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
    }
}

async function fetchOrders() {
    try {
        const response = await fetch(`${API_URL}/orders`);
        const orders = await response.json();
        renderOrdersTable(orders);
    } catch (error) {
        console.error("Erro ao carregar pedidos:", error);
    }
}

async function fetchStats() {
    try {
        const response = await fetch(`${API_URL}/stats`);
        const stats = await response.json();
        
        const statOrders = document.getElementById('statOrders');
        const statRevenue = document.getElementById('statRevenue');
        const statProducts = document.getElementById('statProducts');
        
        // Atualiza os contadores no topo do dashboard
        if (statOrders) statOrders.innerText = stats.totalOrders || 0;
        if (statRevenue) statRevenue.innerText = `R$ ${(stats.totalRevenue || 0).toFixed(2).replace('.', ',')}`;
        if (statProducts) statProducts.innerText = stats.totalProducts || 0;
    } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
    }
}

// 4. RENDERIZAR TABELA DE PRODUTOS
function renderProductsTable() {
    const tbody = document.getElementById('productTableBody');
    if (!tbody) return;

    tbody.innerHTML = allProducts.map(p => `
        <tr>
            <td><img src="${p.image_url}" class="prod-img-td" onerror="this.src='https://via.placeholder.com/50'"></td>
            <td><strong>${p.name}</strong></td>
            <td><span class="badge">${p.category}</span></td>
            <td>R$ ${p.price.toFixed(2)}</td>
            <td>
                <div class="actions" style="display:flex; gap:10px;">
                    <button class="action-btn del-i" onclick="deleteProduct(${p.id})" title="Excluir">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// 5. LÓGICA DE UPLOAD DE IMAGEM (GALERIA)
function previewImage(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentImageBase64 = e.target.result;
            const preview = document.getElementById('imagePreview');
            if (preview) {
                preview.innerHTML = `<img src="${currentImageBase64}" style="max-width: 100%; max-height: 150px; border-radius: 8px; border: 2px solid #333; margin-top:10px;">`;
            }
        }
        reader.readAsDataURL(file);
    }
}

// 6. SALVAR PRODUTO (POST) - AGORA COM TRATAMENTO DE IMAGEM DUPLO
async function saveProduct(event) {
    event.preventDefault();

    const urlField = document.getElementById('p_image_url').value;
    // Prioriza o arquivo da galeria, se não houver, usa o link da URL
    const finalImage = currentImageBase64 || urlField;

    if (!finalImage) {
        alert("Por favor, selecione uma imagem ou insira um link!");
        return;
    }

    const productData = {
        name: document.getElementById('p_name').value,
        category: document.getElementById('p_category').value,
        price: parseFloat(document.getElementById('p_price').value),
        description: document.getElementById('p_description').value,
        image_url: finalImage 
    };

    try {
        const response = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });

        if (response.ok) {
            alert("Produto enviado com sucesso!");
            closeModal();
            fetchProducts();
            fetchStats();
        } else {
            const err = await response.json();
            alert("Erro no servidor: " + err.error);
        }
    } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("Erro ao conectar com a API.");
    }
}

// 7. DELETAR PRODUTO (ROTA DELETE)
async function deleteProduct(id) {
    if (!confirm("Remover este produto permanentemente?")) return;

    try {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            fetchProducts();
            fetchStats();
        }
    } catch (error) {
        alert("Erro ao deletar.");
    }
}

// 8. RENDERIZAR TABELA DE PEDIDOS
function renderOrdersTable(orders) {
    const tbody = document.getElementById('orderTableBody');
    if (!tbody) return;

    tbody.innerHTML = orders.map(o => `
        <tr>
            <td>#${o.id}</td>
            <td>${o.customer_name}</td>
            <td><i class="fa-brands fa-discord" style="color:#5865F2;"></i> ${o.discord_id}</td>
            <td style="color:#00ff88; font-weight:700;">R$ ${o.total_value.toFixed(2)}</td>
            <td><span class="status-pill status-${o.status.toLowerCase()}">${o.status}</span></td>
            <td>
                <button class="action-btn edit-i" onclick="updateOrderStatus(${o.id}, '${o.status}')" title="Alterar Status">
                    <i class="fa-solid fa-rotate"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// 9. ATUALIZAR STATUS DO PEDIDO (ROTA PATCH)
async function updateOrderStatus(id, currentStatus) {
    let nextStatus = "Pendente";
    if (currentStatus === "Pendente") nextStatus = "Finalizado";
    else if (currentStatus === "Finalizado") nextStatus = "Cancelado";

    try {
        const response = await fetch(`${API_URL}/orders/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: nextStatus })
        });

        if (response.ok) {
            fetchOrders();
            fetchStats();
        }
    } catch (error) {
        console.error("Erro ao atualizar status:", error);
    }
}

// 10. CONTROLE DO MODAL
function openAddModal() {
    const form = document.getElementById('productForm');
    if (form) form.reset();
    
    const preview = document.getElementById('imagePreview');
    if (preview) preview.innerHTML = '';
    
    currentImageBase64 = '';
    document.getElementById('productModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('productModal').style.display = 'none';
}