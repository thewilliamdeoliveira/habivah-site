// Mostra no /blog os artigos criados no painel (/admin), sem precisar publicar o site de novo.
// Artigos estáticos continuam funcionando; só entra aqui o que o Pages não encontrar.
import { posts, esc, limpa, dataBR } from "../_db.js";

const HEAD_SITE = `<header class="topo">
  <div class="wrap topo-in">
    <a href="/" class="marca" aria-label="Habivah — início"><svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true"><path d="M4 15 16 5l12 10v12a1 1 0 0 1-1 1h-7v-8h-8v8H5a1 1 0 0 1-1-1z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><circle cx="16" cy="14" r="2.2" fill="#C9A45C"/></svg><span>Habivah</span></a>
    <nav class="menu" aria-label="Principal"><a href="/#recursos">Recursos</a><a href="/#como">Como funciona</a><a href="/#planos">Planos</a><a href="/blog">Blog</a><a href="/sobre">Sobre</a></nav>
    <a class="btn btn-ouro btn-sm" href="/#demo">Agendar demonstração</a>
  </div>
</header>`;
const FOOT_SITE = `<footer class="rodape"><div class="wrap rodape-in"><div class="marca"><span>Habivah</span></div><p>© 2026 Habivah. Sistema para imobiliárias. · <a href="/blog">Blog</a> · <a href="/termos">Termos</a> · <a href="/privacidade">Privacidade</a> · <a href="/seguranca">Segurança</a> · <a href="/sobre">Sobre</a> · <a href="/ajuda">Ajuda</a></p></div></footer>`;

export function card(p) {
  const img = p.capa_url ? `<a href="/blog/${esc(p.slug)}"><img src="${esc(p.capa_url)}" alt="${esc(p.capa_alt || p.titulo)}" loading="lazy" width="640" height="360" style="width:100%;height:auto;aspect-ratio:16/9;object-fit:cover;border-radius:10px;margin-bottom:12px"></a>` : "";
  return `<article class="card post">${img}<p class="kicker">${esc(p.categoria)}</p><h3><a href="/blog/${esc(p.slug)}">${esc(p.titulo)}</a></h3><p>${esc(p.resumo)}</p><p class="meta">${dataBR(p.publicado_em)} · ${Number(p.min_leitura) || 5} min de leitura</p></article>`;
}

function pagina(p) {
  const url = `https://habivah.com/blog/${p.slug}`;
  const desc = p.meta_description || p.resumo || "";
  const faq = Array.isArray(p.faq) ? p.faq.filter((f) => f && f.q && f.a) : [];
  const ld = [{
    "@context": "https://schema.org", "@type": "Article", headline: p.titulo, description: desc,
    datePublished: (p.publicado_em || "").slice(0, 10), dateModified: (p.updated_at || p.publicado_em || "").slice(0, 10),
    inLanguage: "pt-BR", mainEntityOfPage: url,
    author: { "@type": "Organization", name: "Habivah" },
    publisher: { "@type": "Organization", name: "Habivah", logo: { "@type": "ImageObject", url: "https://habivah.com/og.png" } },
    ...(p.capa_url ? { image: p.capa_url } : {}),
  }];
  if (faq.length) ld.push({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) });
  const ldJson = JSON.stringify(ld).replace(/</g, "\\u003c");
  const faqHtml = faq.length ? `<h2>Perguntas frequentes</h2>${faq.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join("")}` : "";
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.titulo)} — Habivah</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${url}">
<meta property="og:title" content="${esc(p.titulo)} — Habivah"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${esc(p.capa_url || "https://habivah.com/og.png")}">
<meta name="theme-color" content="#0B1F3A"><link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/style.css"><script src="/pixel.js" defer></script><script src="/lead.js" defer></script>
<script type="application/ld+json">${ldJson}</script></head><body>${HEAD_SITE}
<main class="pagina"><div class="wrap estreito"><p class="crumb"><a href="/">Início</a> › <a href="/blog">Blog</a></p>
<p class="kicker">${esc(p.categoria)}</p><h1>${esc(p.titulo)}</h1><p class="data">${dataBR(p.publicado_em)} · ${Number(p.min_leitura) || 5} min de leitura</p>
${p.capa_url ? `<img src="${esc(p.capa_url)}" alt="${esc(p.capa_alt || p.titulo)}" width="1280" height="720" style="width:100%;height:auto;border-radius:14px;margin:8px 0 24px">` : ""}
${limpa(p.corpo_html)}${faqHtml}
<aside class="cta-post"><h2>Quer ver o Habivah funcionando na sua imobiliária?</h2><p>CRM, site, blog e atendente de WhatsApp com a sua marca, implantados por nós.</p><p><a class="btn btn-ouro" href="/#demo">Agendar demonstração</a> <a class="btn btn-linha" href="https://wa.me/5511915190774?text=Ol%C3%A1!%20Quero%20conhecer%20o%20Habivah." target="_blank" rel="noopener">Chamar no WhatsApp</a></p></aside>
</div></main>${FOOT_SITE}</body></html>`;
}

export async function onRequest({ request, next }) {
  const path = new URL(request.url).pathname.replace(/\/+$/, "") || "/";
  if (request.method !== "GET") return next();

  // Artigo criado no painel: o banco responde primeiro (o Pages devolve a home com 200 para caminhos desconhecidos).
  if (/^\/blog\/[a-z0-9-]+$/.test(path)) {
    const slug = path.split("/")[2];
    const [p] = await posts(`slug=eq.${encodeURIComponent(slug)}&select=*&limit=1`);
    if (p) return new Response(pagina(p), { status: 200, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=300" } });
    return next();
  }

  const res = await next();
  if (path === "/blog" && res.status === 200) {
    const lista = await posts("select=slug,titulo,resumo,categoria,publicado_em,min_leitura,capa_url,capa_alt&order=publicado_em.desc&limit=100");
    if (!lista.length) return res;
    const html = lista.map(card).join("");
    return new HTMLRewriter().on(".vazio-blog", { element(e) { e.remove(); } }).on("div.grade.posts", { element(e) { e.prepend(html, { html: true }); } }).transform(res);
  }
  return res;
}
