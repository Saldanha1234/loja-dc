/**
 * LÓGICA DO CARRINHO - ALPHA STORE
 * ARQUIVO TOTALMENTE COMPLETO - DESIGN IGUAL À IMAGEM (BOTÕES QUADRADOS)
 * Desenvolvido para: Guilherme David Oliveira Giuliani Ribeiro
 * CUIDADO RIGOROSO COM ROTAS E INTEGRAÇÃO GLOBAL
 */

// 1. INICIALIZAÇÃO DO ESTADO GLOBAL
if (!window.cart) {
    window.cart = [];
}

// 2. ADICIONAR AO CARRINHO
// Esta função é chamada pelo web.js e processa a inclusão no array global
window.addToCart = function(productId) {
    if (typeof window.allProducts === 'undefined' || window.allProducts.length === 0) {
        console.error("[Erro Alpha] A lista global de produtos não foi carregada pelo web.js.");
        return;
    }

    const product = window.allProducts.find(p => p.id === productId);
    
    if (product) {
        const existingItem = window.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            // Injeta o produto completo para garantir consistência de imagem e nome
            window.cart.push({
                ...product,
                quantity: 1
            });
        }
        
        window.updateCart(); 
        window.openCart();   
    } else {
        console.warn(`[Alpha Store] Produto com ID ${productId} não encontrado.`);
    }
}

// 3. ATUALIZAR INTERFACE (Renderização Completa)
window.updateCart = function() {
    const cartContent = document.getElementById('cartContent');
    const totalElement = document.getElementById('cartTotal');
    
    if (!cartContent) return;

    if (window.cart.length === 0) {
        cartContent.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:200px; color:#444;">
                <i class="fa-solid fa-cart-shopping" style="font-size:3rem; margin-bottom:15px;"></i>
                <p>Seu carrinho está vazio</p>
            </div>`;
        if (totalElement) totalElement.innerText = "R$ 0,00";
        return;
    }

    let total = 0;
    cartContent.innerHTML = window.cart.map((item, index) => {
        total += item.price * item.quantity;
        return `
            <div class="cart-item" style="display:flex; align-items:center; gap:15px; background:#111; padding:15px; border-radius:12px; margin-bottom:15px; border:1px solid #1a1a1a;">
                <img src="${item.image_url}" alt="${item.name}" style="width:60px; height:60px; object-fit:contain; background:#000; border-radius:8px; padding:5px;">
                
                <div style="flex:1;">
                    <h4 style="color:#fff; font-size:0.9rem; margin-bottom:5px;">${item.name}</h4>
                    <p style="color:var(--accent-color); font-weight:700; font-size:1rem;">R$ ${item.price.toFixed(2).replace('.', ',')}</p>
                </div>

                <div class="quantity-controls" style="display:flex; align-items:center; background:#000; border-radius:8px; border:1px solid #222; overflow:hidden;">
                    <button onclick="changeQty(${index}, -1)" style="width:30px; height:30px; background:transparent; border:none; color:#fff; cursor:pointer;">-</button>
                    <span style="width:30px; text-align:center; color:#fff; font-weight:700; font-size:0.9rem;">${item.quantity}</span>
                    <button onclick="changeQty(${index}, 1)" style="width:30px; height:30px; background:transparent; border:none; color:#fff; cursor:pointer;">+</button>
                </div>

                <button class="remove-btn" onclick="removeFromCart(${index})">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
    }).join('');

    if (totalElement) {
        totalElement.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }
}

// 4. CONTROLE DE QUANTIDADE E REMOÇÃO
window.changeQty = function(index, delta) {
    if (window.cart[index]) {
        window.cart[index].quantity += delta;
        if (window.cart[index].quantity <= 0) {
            window.removeFromCart(index);
        } else {
            window.updateCart();
        }
    }
}

window.removeFromCart = function(index) {
    window.cart.splice(index, 1);
    window.updateCart();
}

// 5. FINALIZAÇÃO DE COMPRA (Gestão de Rotas)
window.finalizePurchase = async function() {
    if (window.cart.length === 0) {
        alert("O seu carrinho está vazio!");
        return;
    }

    // Salva o estado atual para persistência no checkout
    localStorage.setItem('alpha_cart', JSON.stringify(window.cart));

    // Valida se existe uma função de integração 'checkout' no escopo global
    if (typeof window.checkout === "function") {
        await window.checkout(); 
    } else {
        // Rota padrão absoluta para evitar erros de pasta
        window.location.href = '/checkout.html';
    }
}

// 6. INTERFACE - CONTROLE DE ABERTURA (LADO ESQUERDO)
window.openCart = function() {
    const overlay = document.getElementById('cartOverlay');
    const innerModal = document.getElementById('cartModal');
    
    if(overlay) {
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'flex-start'; 
        
        // Timeout para disparar a animação de transform do CSS
        setTimeout(() => {
            if(innerModal) innerModal.classList.add('active');
        }, 10);
    }
}

window.closeCart = function() {
    const overlay = document.getElementById('cartOverlay');
    const innerModal = document.getElementById('cartModal');
    
    if(innerModal) {
        innerModal.classList.remove('active');
    }

    // Espera o tempo da transição do CSS (0.4s) antes de ocultar o overlay
    setTimeout(() => {
        if(overlay) {
            overlay.style.display = 'none';
        }
    }, 400);
}