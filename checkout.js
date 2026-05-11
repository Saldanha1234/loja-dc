/**
 * SISTEMA DE CHECKOUT - ALPHA STORE
 * Lógica de processamento de pagamento e integração (MODO TESTE ATIVO)
 */

let selectedMethod = 'pix';

document.addEventListener('DOMContentLoaded', () => {
    loadCheckoutSummary();
});

// Selecionar método de pagamento
function selectPayment(method, event) {
    selectedMethod = method;
    
    // Atualiza visualmente os cards
    document.querySelectorAll('.method-card').forEach(card => {
        card.classList.remove('active');
    });
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
}

// Carregar o resumo do que veio do carrinho
function loadCheckoutSummary() {
    const cart = JSON.parse(localStorage.getItem('alpha_cart')) || [];
    const summaryList = document.getElementById('summaryList');
    const totalDisplay = document.getElementById('checkoutTotal');
    const btnTotal = document.getElementById('btnTotal');

    if (cart.length === 0) {
        return;
    }

    let total = 0;
    summaryList.innerHTML = cart.map(item => {
        total += item.price * item.quantity;
        return `
            <div class="summary-row" style="display: flex; justify-content: space-between; margin-bottom: 10px; color: white;">
                <span>${item.quantity}x ${item.name}</span>
                <span>R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
            </div>
        `;
    }).join('');

    totalDisplay.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
    if (btnTotal) btnTotal.innerText = `PAGAR R$ ${total.toFixed(2).replace('.', ',')}`;
}

// FINALIZAR E ENVIAR DIRETO PARA O BOT (SIMULAÇÃO DE PAGAMENTO)
async function processPayment() {
    const name = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const discordId = document.getElementById('discordId').value; 
    const cart = JSON.parse(localStorage.getItem('alpha_cart')) || [];

    // 1. Validação de Campos
    if (!name || !email || !discordId) {
        alert("⚠️ Preencha todos os campos para receber seu produto!");
        return;
    }

    if (cart.length === 0) {
        alert("⚠️ Seu carrinho está vazio!");
        return;
    }

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const nomesProdutos = cart.map(item => `${item.quantity}x ${item.name}`).join(', ');

    // 2. Preparar payload para o Bot
    const payloadParaBot = {
        discord_id: discordId.trim(),
        nome: name,
        email: email,
        produto: nomesProdutos,
        valor: total.toFixed(2).replace('.', ','),
        forma_pagamento: selectedMethod.toUpperCase(),
        empresa: "Alpha Store"
    };

    const btn = document.getElementById('btnTotal');
    const originalText = btn.innerText;
    btn.innerText = "VERIFICANDO PAGAMENTO...";
    btn.disabled = true;

    try {
        // Usando 127.0.0.1 para evitar conflitos de DNS local do Windows
        const response = await fetch('http://127.0.0.1:5000/webhook/order', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payloadParaBot)
        });

        const result = await response.json();

        if (response.ok) {
            alert("✅ SUCESSO! Pagamento aprovado. Verifique seu Discord, o canal de entrega foi criado!");
            localStorage.removeItem('alpha_cart');
            window.location.href = 'index.html'; 
        } else {
            // Tratamento de erros específicos vindos do bot.py
            if (result.status === "user_not_found") {
                alert("❌ Erro: Seu ID do Discord não foi encontrado no servidor. Você já entrou lá?");
            } else {
                alert(`❌ Erro no Servidor: ${result.message || 'Erro desconhecido'}`);
            }
        }
    } catch (error) {
        console.error("Erro de conexão:", error);
        alert("❌ Erro de conexão! O bot.py está rodando no terminal?");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}