#!/usr/bin/env python3
"""Gera /blog (index + artigos) e atualiza o sitemap. Rode na raiz do repo: python3 scripts/gerar_blog.py"""
import html, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WA = "https://wa.me/5511915190774?text=Ol%C3%A1!%20Quero%20conhecer%20o%20Habivah."
ARTIGOS = [
 dict(slug="crm-imobiliario-como-escolher", data="2026-10-22", cat="CRM", min=6,
  titulo="CRM imobiliário: o que é e como escolher o certo para a sua imobiliária",
  resumo="O que um CRM imobiliário precisa fazer de verdade, os erros mais comuns na escolha e um checklist simples para decidir.",
  corpo="""
<p>CRM imobiliário é o sistema onde ficam todos os seus leads, imóveis e conversas. Quando funciona bem, nenhum cliente fica sem resposta e o gerente enxerga o que cada corretor está fazendo. Quando funciona mal, vira uma planilha cara que ninguém atualiza.</p>
<h2>O que um CRM imobiliário precisa ter</h2>
<ul>
<li><b>Funil de vendas visual:</b> do primeiro contato até o contrato, com cada lead em uma etapa clara.</li>
<li><b>Entrada automática de leads:</b> site, portais, anúncios e WhatsApp caindo sozinhos no sistema, sem digitação.</li>
<li><b>Origem do lead:</b> saber se veio do Google, do Instagram ou de indicação, para investir onde dá retorno.</li>
<li><b>Distribuição entre corretores:</b> regras de quem atende quem, sem briga e sem lead esquecido.</li>
<li><b>Vínculo com os imóveis:</b> cada lead ligado aos imóveis em que demonstrou interesse.</li>
<li><b>Permissões por cargo:</b> o corretor vê os próprios leads; dados de proprietário e comissão ficam só com quem deve.</li>
</ul>
<h2>Erros comuns na hora de escolher</h2>
<ul>
<li>Escolher pelo preço e descobrir depois que cada integração é cobrada à parte.</li>
<li>Comprar um sistema genérico de vendas que não entende imóvel, proprietário e visita.</li>
<li>Não perguntar como os dados saem do sistema se você quiser trocar de ferramenta.</li>
<li>Esquecer o tempo de implantação: um CRM que ninguém consegue configurar fica parado.</li>
</ul>
<h2>Checklist rápido antes de assinar</h2>
<ol>
<li>Meus leads de site e WhatsApp entram sozinhos?</li>
<li>Consigo importar minha base atual de imóveis e contatos?</li>
<li>Cada corretor vê só o que precisa?</li>
<li>Posso exportar todos os meus dados quando quiser?</li>
<li>Alguém faz a implantação comigo, ou fico sozinho?</li>
</ol>
<p>O Habivah foi feito dentro de uma imobiliária de verdade, a IT'S HOUSES, e reúne CRM, site, blog e atendimento no mesmo lugar. Veja como funciona na <a href="/#recursos">página de recursos</a>.</p>
"""),
 dict(slug="site-para-imobiliaria-o-que-ter", data="2026-10-22", cat="Site", min=6,
  titulo="Site para imobiliária: 8 itens que não podem faltar",
  resumo="O que o visitante procura, o que o Google valoriza e o que faz o lead virar contato no site de uma imobiliária.",
  corpo="""
<p>O site é a vitrine da imobiliária aberta 24 horas. Ele precisa fazer três coisas: ser encontrado no Google, mostrar os imóveis com clareza e transformar o visitante em contato. Estes são os itens que não podem faltar.</p>
<h2>1. Busca de imóveis rápida e simples</h2>
<p>Filtros de tipo, cidade, bairro, quartos e faixa de preço, funcionando bem no celular. A maioria dos visitantes chega pelo telefone.</p>
<h2>2. Página própria para cada imóvel</h2>
<p>Fotos grandes, descrição completa, localização e um botão de contato bem visível. Cada imóvel com sua própria página pode ser encontrado separadamente no Google.</p>
<h2>3. Velocidade</h2>
<p>Site lento perde visitante antes de mostrar o primeiro imóvel. Imagens leves e hospedagem de qualidade fazem diferença.</p>
<h2>4. WhatsApp em destaque</h2>
<p>É o canal preferido do cliente brasileiro. O botão precisa estar em todas as páginas, com mensagem já preenchida citando o imóvel.</p>
<h2>5. Formulários que alimentam o CRM</h2>
<p>Todo contato do site deve cair direto no CRM, com a origem registrada. Lead que chega por e-mail e é copiado à mão acaba esquecido.</p>
<h2>6. Blog</h2>
<p>É o que traz tráfego do Google de quem ainda está pesquisando. Veja em <a href="/blog/blog-imobiliario-atrai-clientes">como um blog atrai clientes para a imobiliária</a>.</p>
<h2>7. Sua marca</h2>
<p>Logo, cores, endereço próprio. O visitante deve sentir que está na sua imobiliária, não em um portal genérico.</p>
<h2>8. Privacidade e LGPD</h2>
<p>Política de privacidade clara, aviso de cookies e consentimento nos formulários. Além de exigência legal, passa confiança.</p>
<p>No Habivah, o site já vem com tudo isso, em temas diferentes que você pode escolher. Veja exemplos ao vivo na <a href="/#exemplos">seção de exemplos</a>.</p>
"""),
 dict(slug="blog-imobiliario-atrai-clientes", data="2026-10-22", cat="Conteúdo", min=5,
  titulo="Blog imobiliário: como ele atrai clientes para a sua imobiliária",
  resumo="Por que um blog traz visitantes qualificados, que temas funcionam no mercado imobiliário e como manter a frequência sem sobrecarregar a equipe.",
  corpo="""
<p>Quem está pensando em comprar um imóvel pesquisa muito antes de falar com um corretor: bairro, financiamento, documentação, valorização. Um blog responde essas perguntas e coloca a sua imobiliária na frente dessa pessoa no momento em que ela ainda está decidindo.</p>
<h2>Por que um blog funciona</h2>
<ul>
<li><b>Tráfego gratuito do Google:</b> um artigo bem feito continua trazendo visitas por meses, sem pagar por clique.</li>
<li><b>Autoridade:</b> quem aprende com você tende a procurar você na hora de fechar.</li>
<li><b>Mais páginas no seu site:</b> cada artigo é uma nova porta de entrada.</li>
<li><b>Material para as redes:</b> cada artigo rende posts, stories e respostas para clientes.</li>
</ul>
<h2>Temas que funcionam para imobiliária</h2>
<ul>
<li>Guias de bairro e de condomínio: como é morar, serviços, perfil de moradores.</li>
<li>Passo a passo de compra, financiamento e documentação.</li>
<li>Comparativos: comprar ou alugar, casa ou apartamento, planta ou pronto.</li>
<li>Perguntas frequentes de proprietários que querem vender ou alugar.</li>
</ul>
<h2>O problema da frequência</h2>
<p>O blog só funciona com constância, e é aí que a maioria desiste: escrever dá trabalho e o dia do corretor é de atendimento. Por isso o Habivah inclui o blog como parte do sistema, com publicação automática configurável por imobiliária e visual da sua marca.</p>
<h2>Como medir o resultado</h2>
<p>Acompanhe de onde vêm os leads. Quando o CRM registra a origem de cada contato, você enxerga quais artigos trouxeram clientes e onde vale escrever mais.</p>
"""),
 dict(slug="atendimento-whatsapp-ia-imobiliaria", data="2026-10-22", cat="Atendimento", min=5,
  titulo="Atendimento no WhatsApp com IA: como responder leads na hora sem perder o toque humano",
  resumo="O papel de um atendente virtual na imobiliária, o que ele deve fazer sozinho e quando passar a conversa para um corretor.",
  corpo="""
<p>O lead que escreve no WhatsApp quer resposta agora. Se o corretor está em visita ou é fim de noite, o contato esfria e o cliente procura outra imobiliária. Um atendente virtual com IA resolve a primeira parte: responder rápido, entender o que a pessoa procura e organizar a informação para o corretor.</p>
<h2>O que o atendente virtual deve fazer</h2>
<ul>
<li>Responder na hora, a qualquer horário, em tom cordial e natural.</li>
<li>Perguntar o essencial: comprar ou alugar, região, faixa de valor, prazo.</li>
<li>Apresentar imóveis compatíveis do seu catálogo.</li>
<li>Registrar tudo no CRM, com origem e anotações da conversa.</li>
<li>Marcar visita ou chamar o corretor quando o cliente estiver pronto.</li>
</ul>
<h2>O que ele não deve fazer</h2>
<ul>
<li>Inventar informação sobre imóvel, preço ou condição de negociação.</li>
<li>Fingir ser uma pessoa quando perguntado.</li>
<li>Segurar o cliente que pediu para falar com um corretor.</li>
</ul>
<h2>Passagem para o corretor</h2>
<p>O melhor resultado vem da divisão certa: a IA cuida da triagem e o corretor entra quando há interesse real. Ele recebe a conversa e o resumo do cliente, sem precisar recomeçar do zero.</p>
<h2>Leads descartáveis</h2>
<p>Com o atendimento registrado no CRM, fica fácil separar quem tem perfil de quem não tem, por exemplo orçamento abaixo do que você atende, e concentrar o tempo da equipe nos bons contatos.</p>
<p>No Habivah, o atendente de WhatsApp é configurável por imobiliária: nome, tom de voz e regras de passagem para o corretor.</p>
"""),
 dict(slug="sistema-imobiliario-com-sua-marca-white-label", data="2026-10-22", cat="White-label", min=5,
  titulo="Sistema imobiliário com a sua marca: o que é white-label e para quem faz sentido",
  resumo="Como funciona um sistema white-label para imobiliárias, o que pode ser personalizado e quando vale mais a pena do que um sistema padrão.",
  corpo="""
<p>White-label é quando o sistema aparece com a sua marca, não com a do fornecedor. O cliente final entra no seu site, vê o seu logo, as suas cores e o seu endereço. Você usa a tecnologia pronta sem precisar desenvolver nada.</p>
<h2>O que normalmente pode ser personalizado</h2>
<ul>
<li>Logo, cores e fontes do site.</li>
<li>Domínio próprio, por exemplo <i>suaimobiliaria.com.br</i>.</li>
<li>Textos e imagens da página inicial.</li>
<li>Nome e tom de voz do atendente virtual.</li>
<li>Blog com a identidade da imobiliária.</li>
</ul>
<h2>Para quem faz sentido</h2>
<ul>
<li><b>Imobiliárias que querem site e CRM prontos</b>, sem montar uma equipe de tecnologia.</li>
<li><b>Redes e franquias</b>, que precisam de várias operações separadas com o mesmo padrão.</li>
<li><b>Empresas que querem oferecer o sistema aos próprios clientes</b> com a sua marca.</li>
</ul>
<h2>O ponto mais importante: isolamento de dados</h2>
<p>Em um sistema com várias empresas, os dados de uma nunca podem aparecer para outra. Pergunte ao fornecedor como o isolamento é feito e se você pode exportar tudo a qualquer momento.</p>
<h2>Experimente antes</h2>
<p>Veja <a href="/#exemplos">modelos de sites funcionando</a>, cada um com tema e identidade própria, e <a href="/#demo">peça uma demonstração</a> com a sua marca.</p>
"""),
 dict(slug="quanto-custa-sistema-para-imobiliaria", data="2026-10-29", cat="Preços", min=6,
  titulo="Quanto custa um sistema para imobiliária em 2026 (e o que muda sem mensalidade)",
  resumo="Os modelos de cobrança que existem no mercado, o que costuma vir escondido no preço e como comparar propostas de verdade.",
  corpo="""
<p>Quem pesquisa sistema para imobiliária encontra de tudo: mensalidade por usuário, por imóvel, por módulo, pacotes anuais e taxas de implantação. O preço da página raramente é o preço que você paga no fim do ano. Este guia mostra como comparar.</p>
<h2>Os três modelos que existem</h2>
<ul>
<li><b>Mensalidade por usuário:</b> comum em CRMs genéricos. Barato para começar, caro quando a equipe cresce — cada corretor novo é um custo fixo, use ele o sistema ou não.</li>
<li><b>Mensalidade por plano:</b> faixas de imóveis, leads ou "conversas" por mês. O risco é bater no limite no mês bom e pagar upgrade justamente quando estava vendendo.</li>
<li><b>Implantação + uso:</b> você paga uma vez pela implantação (importação, marca, domínio, treinamento) e depois só o que usa. É o modelo do Habivah: sem mensalidade, hospedagem anual e créditos para a inteligência artificial.</li>
</ul>
<h2>O que costuma vir escondido</h2>
<ul>
<li>Integração com portais, WhatsApp ou site cobrada à parte.</li>
<li>Limite de fotos, de imóveis ou de "contatos" que estoura rápido.</li>
<li>Implantação e migração de dados "sob consulta" — ou seja, você faz sozinho.</li>
<li>Fidelidade de 12 meses com multa, e exportação de dados difícil na hora de sair.</li>
<li>Atendimento por IA cobrado por mensagem (uma conversa comum tem 10 a 20 mensagens).</li>
</ul>
<h2>Como fazer a conta certa</h2>
<ol>
<li>Some 24 meses de uso, não 1: implantação + mensalidades + extras + upgrades prováveis.</li>
<li>Conte a equipe que você terá daqui a um ano, não a de hoje.</li>
<li>Pergunte o que acontece se você parar de pagar: perde os dados? perde o site? fica só lendo?</li>
<li>Peça para ver o sistema rodando em uma imobiliária de verdade, com leads reais.</li>
</ol>
<h2>Um exemplo com números</h2>
<p>Uma imobiliária com 6 corretores em um CRM de R$ 149 por usuário paga cerca de <b>R$ 21.500 em dois anos</b> só de mensalidade — sem site, sem blog, sem atendimento automático. No modelo de implantação, o mesmo período custa a implantação (R$ 5 mil ou R$ 10 mil, conforme o pacote), uma anuidade de hospedagem no segundo ano e o uso de IA, que no dia a dia fica em dezenas de reais por mês, não centenas.</p>
<p>Os valores do Habivah estão abertos na <a href="/#planos">página de planos</a>: implantação Essencial ou Completa, hospedagem anual e créditos de R$ 1 — e você liga e desliga cada automação no painel. Quer uma proposta para a sua imobiliária? <a href="https://wa.me/5511915190774?text=Ol%C3%A1!%20Quero%20uma%20proposta%20do%20Habivah." target="_blank" rel="noopener">Chame no WhatsApp</a>.</p>
"""),
 dict(slug="seguranca-dados-sistema-imobiliario", data="2026-10-30", cat="Segurança", min=6,
  titulo="Segurança de dados no sistema da imobiliária: 7 perguntas antes de contratar",
  resumo="Leads, proprietários e comissões são o patrimônio da imobiliária. O que perguntar ao fornecedor para não descobrir um problema tarde demais.",
  corpo="""
<p>Ao escolher um sistema, a conversa costuma girar em torno de recursos e preço. Mas o que fica guardado lá dentro — leads, dados de proprietários, comissões, conversas de WhatsApp — vale mais do que o sistema. E, desde a LGPD, a imobiliária responde pelo que acontece com esses dados. Estas são as perguntas que vale fazer antes de assinar.</p>
<h2>1. Os meus dados ficam separados dos de outras imobiliárias?</h2>
<p>Quase todo sistema na nuvem guarda várias empresas no mesmo lugar. Isso não é problema, desde que a separação seja garantida no próprio banco de dados, e não só na tela. Pergunte: se alguém de outra imobiliária tentar acessar um lead meu diretamente, o que impede? A resposta certa fala em regras de acesso por empresa aplicadas a todos os dados, inclusive fotos e arquivos.</p>
<h2>2. Quem da minha equipe vê o quê?</h2>
<p>Corretor não precisa ver comissão de colega nem dados pessoais do proprietário. Peça para ver os papéis disponíveis (administrador, gerente, corretor) e o que cada um enxerga. Se a resposta for "todo mundo vê tudo", o risco de vazamento interno é seu.</p>
<h2>3. As automações respeitam essa separação?</h2>
<p>Atendimento automático no WhatsApp, e-mails, follow-up e avisos no celular rodam "por trás", fora da tela. É justamente aí que separações frágeis falham. Pergunte se as automações usam a sua marca, as suas contas e só os seus contatos.</p>
<h2>4. Como funciona a LGPD na prática?</h2>
<p>Seu cliente tem direito de pedir uma cópia dos dados dele e a exclusão. O sistema deve permitir atender esses pedidos sem planilha nem gambiarra, e respeitar quem pediu para não receber e-mails.</p>
<h2>5. Tem verificação em duas etapas?</h2>
<p>Senha vaza. Com código no celular além da senha, uma senha vazada sozinha não abre o painel. Confirme se o sistema oferece e se você pode exigir para a equipe.</p>
<h2>6. Há backup e monitoramento?</h2>
<p>Pergunte com que frequência os dados são copiados, onde ficam essas cópias e quem é avisado quando algo dá erro. "Não precisa se preocupar" não é resposta.</p>
<h2>7. Se eu sair, levo os meus dados?</h2>
<p>Exportação de imóveis e leads deve ser simples e estar no painel. Desconfie de contrato que dificulta a saída: dado preso é custo escondido.</p>
<h2>Como o Habivah responde</h2>
<p>Cada imobiliária fica em um espaço próprio, com separação aplicada no banco de dados, nos arquivos e nas automações, e testes automáticos conferem essa separação a cada alteração do sistema. Os detalhes estão na página <a href="/seguranca">Segurança e privacidade</a>. Quer ver funcionando? <a href="https://wa.me/5511915190774?text=Ol%C3%A1!%20Quero%20conhecer%20o%20Habivah." target="_blank" rel="noopener">Chame no WhatsApp</a>.</p>
"""),
]

def esc(s): return html.escape(s, quote=True)
def dpt(d):
    m = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"]
    y, mo, da = d.split("-"); return f"{int(da)} de {m[int(mo)-1]} de {y}"

LOGO = '<svg viewBox="0 0 32 32" width="%d" height="%d" aria-hidden="true"><path d="M4 15 16 5l12 10v12a1 1 0 0 1-1 1h-7v-8h-8v8H5a1 1 0 0 1-1-1z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><circle cx="16" cy="14" r="2.2" fill="#C9A45C"/></svg>'
def head(title, desc, canon, extra=""):
    return f'''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{canon}">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{canon}">
<meta property="og:image" content="https://habivah.com/og.png">
<meta name="theme-color" content="#0B1F3A">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/style.css">
<script src="/pixel.js" defer></script>
<script src="/lead.js" defer></script>
{extra}</head>
<body>
<header class="topo">
  <div class="wrap topo-in">
    <a href="/" class="marca" aria-label="Habivah — início">{LOGO % (28,28)}<span>Habivah</span></a>
    <nav class="menu" aria-label="Principal">
      <a href="/#recursos">Recursos</a>
      <a href="/#como">Como funciona</a>
      <a href="/#planos">Planos</a>
      <a href="/blog">Blog</a>
      <a href="/sobre">Sobre</a>
    </nav>
    <a class="btn btn-ouro btn-sm" href="/#demo">Agendar demonstração</a>
  </div>
</header>
'''
FOOT = f'''<footer class="rodape">
  <div class="wrap rodape-in">
    <div class="marca">{LOGO % (22,22)}<span>Habivah</span></div>
    <p>© 2026 Habivah. Sistema para imobiliárias. · <a href="/blog">Blog</a> · <a href="/termos">Termos</a> · <a href="/privacidade">Privacidade</a> · <a href="/seguranca">Segurança</a> · <a href="/sobre">Sobre</a> · <a href="/ajuda">Ajuda</a></p>
  </div>
</footer>
</body>
</html>
'''

def cards(lista):
    return "".join(f'<article class="card post"><p class="kicker">{esc(a["cat"])}</p><h3><a href="/blog/{a["slug"]}">{esc(a["titulo"])}</a></h3><p>{esc(a["resumo"])}</p><p class="meta">{dpt(a["data"])} · {a["min"]} min de leitura</p></article>' for a in lista)

def gerar():
    os.makedirs(os.path.join(ROOT, "blog"), exist_ok=True)
    # índice
    ld = '<script type="application/ld+json">{"@context":"https://schema.org","@type":"Blog","name":"Blog Habivah","url":"https://habivah.com/blog","inLanguage":"pt-BR"}</script>\n'
    h = head("Blog Habivah — CRM, site e marketing para imobiliárias", "Guias práticos sobre CRM imobiliário, site para imobiliária, blog, atendimento no WhatsApp e sistema com a sua marca.", "https://habivah.com/blog", ld)
    h += f'<main class="pagina"><div class="wrap"><p class="kicker">Blog</p><h1>Ideias para vender mais imóveis</h1><p class="data">Guias práticos de CRM, site, conteúdo e atendimento para imobiliárias.</p><div class="grade posts">{cards(ARTIGOS)}</div></div></main>\n' + FOOT
    open(os.path.join(ROOT, "blog", "index.html"), "w", encoding="utf-8").write(h)
    # artigos
    for a in ARTIGOS:
        url = f'https://habivah.com/blog/{a["slug"]}'
        ld = ('<script type="application/ld+json">' + 
          '{"@context":"https://schema.org","@type":"Article","headline":%s,"description":%s,"datePublished":"%s","dateModified":"%s","inLanguage":"pt-BR","mainEntityOfPage":"%s","author":{"@type":"Organization","name":"Habivah"},"publisher":{"@type":"Organization","name":"Habivah","logo":{"@type":"ImageObject","url":"https://habivah.com/og.png"}}}' % (
            __import__("json").dumps(a["titulo"], ensure_ascii=False), __import__("json").dumps(a["resumo"], ensure_ascii=False), a["data"], a["data"], url)
          + '</script>\n')
        outros = [x for x in ARTIGOS if x["slug"] != a["slug"]][:2]
        h = head(a["titulo"] + " — Habivah", a["resumo"], url, ld)
        h += f'''<main class="pagina"><div class="wrap estreito">
<p class="crumb"><a href="/">Início</a> › <a href="/blog">Blog</a></p>
<p class="kicker">{esc(a["cat"])}</p>
<h1>{esc(a["titulo"])}</h1>
<p class="data">{dpt(a["data"])} · {a["min"]} min de leitura</p>
{a["corpo"].strip()}
<aside class="cta-post"><h2>Quer ver o Habivah funcionando na sua imobiliária?</h2><p>CRM, site, blog e atendente de WhatsApp com a sua marca, implantados por nós.</p><p><a class="btn btn-ouro" href="/#demo">Agendar demonstração</a> <a class="btn btn-linha" href="{WA}" target="_blank" rel="noopener">Chamar no WhatsApp</a></p></aside>
</div>
<div class="wrap"><h2 class="mais">Continue lendo</h2><div class="grade posts dois">{cards(outros)}</div></div></main>
''' + FOOT
        open(os.path.join(ROOT, "blog", a["slug"] + ".html"), "w", encoding="utf-8").write(h)
    # sitemap
    urls = ["", "sobre", "ajuda", "termos", "privacidade", "seguranca", "blog"] + ["blog/" + a["slug"] for a in ARTIGOS]
    x = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + "".join(f'<url><loc>https://habivah.com/{u}</loc></url>' for u in urls) + '</urlset>\n'
    open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8").write(x)

gerar()
print("ok:", len(ARTIGOS), "artigos")
