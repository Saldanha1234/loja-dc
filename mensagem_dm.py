import discord

def criar_embed_compra(dados_compra):
    """
    Gera o design visual da mensagem privada (DM) que o cliente recebe
    assim que o sistema detecta o pagamento/pedido no site.
    """
    # Cores e Variáveis
    cor_alpha = 0xffce00  # Dourado Almanack Store
    nome_cliente = dados_compra.get('nome', 'Cliente')
    produto = dados_compra.get('produto', 'Produto Almanack')
    valor = dados_compra.get('valor', '0,00')
    metodo = dados_compra.get('forma_pagamento', 'Pix')
    empresa = "Almanack Store"

    # Construção do Embed
    embed = discord.Embed(
        title="✨ PAGAMENTO CONFIRMADO!",
        description=(
            f"Olá **{nome_cliente}**,\n\n"
            f"Seu pedido na **{empresa}** foi processado com sucesso. "
            "Nossa equipe já foi notificada e estamos preparando sua entrega.\n\n"
            f"**📦 Resumo do Pedido:**\n"
            f"> Produto: `{produto}`\n"
            f"> Valor Pago: `R$ {valor}`\n"
            f"> Método: `{metodo}`\n\n"
            "**Como recebo meu produto?**\n"
            "Um canal de atendimento exclusivo foi aberto para você no nosso servidor oficial. "
            "Clique no botão abaixo para ir direto para lá."
        ),
        color=cor_alpha
    )

    # Banner e Identidade Visual (Links configuráveis)
    # Recomendo usar o link direto do seu banner hospedado
    embed.set_image(url="https://i.imgur.com/vH6Z8Y9.png") 
    
    embed.set_footer(
        text=f"© {empresa} - Qualidade e Agilidade", 
        icon_url="https://i.imgur.com/your_logo.png"
    )

    return embed

def criar_view_dm(channel_url):
    """
    Cria o botão que redireciona o usuário para o canal de ticket.
    """
    view = discord.ui.View()
    botao_entrega = discord.ui.Button(
        label="IR PARA CANAL DE ENTREGA",
        url=channel_url,
        emoji="🚀",
        style=discord.ButtonStyle.link
    )
    view.add_item(botao_entrega)
    return view