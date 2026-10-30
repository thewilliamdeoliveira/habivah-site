// habivah-blog-auto: escreve e publica sozinho um artigo por dia no blog do Habivah.
// ESCOPO DO HABIVAH (William, 30/10/2026): só TECNOLOGIA no mercado imobiliário
// (CRM, IA, automação, proptechs, portais, marketing digital, assinatura digital, dados).
// Assunto de mercado em si (juros, crédito, preços, lançamentos) é da IT'S HOUSES, não daqui.
// Dois tipos, alternados:
//  - "busca": DataForSEO → palavra fácil e procurada (volume × dificuldade), sem repetir
//  - "tendencia": pesquisa na internet (Perplexity Sonar via OpenRouter) das novidades de
//    tecnologia no mercado imobiliário na semana, com fontes reais citadas no artigo
// Depois: IA (OpenRouter) escreve → fal.ai gera a capa (Storage) → salva/publica → avisa por e-mail.
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
const slugify = (s: string) => norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
const esc = (s: unknown) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
function limpaHtml(h: string): string {
  return h.replace(/<\s*(script|style|iframe|object|embed)[\s\S]*?<\/\s*\1\s*>/gi, "").replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "").replace(/javascript:/gi, "");
}
const hojeSP = () => new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", day: "numeric", month: "long", year: "numeric" });
const MIN_VOLUME = 20, MAX_KD = 30;
const nota = (k: { volume: number; kd: number | null }) => k.volume / ((k.kd ?? 15) + 10);
const STOP = new Set(["de", "da", "do", "das", "dos", "em", "no", "na", "para", "por", "com", "como", "o", "a", "os", "as", "um", "uma", "e", "que", "qual", "quais"]);
const toks = (s: string) => new Set(norm(s).split(/[^a-z0-9]+/).filter((t) => t.length > 1 && !STOP.has(t)));
function parecida(a: string, usadas: string[], limite = 0.6): boolean {
  const ta = toks(a);
  for (const u of usadas) {
    const tu = toks(u);
    if (!ta.size || !tu.size) continue;
    let inter = 0; for (const t of ta) if (tu.has(t)) inter++;
    if (inter / (ta.size + tu.size - inter) >= limite) return true;
  }
  return false;
}
// Palavra/tema precisa ser de tecnologia (filtro de segurança do escopo).
const TEC = /(crm|sistema|software|app|aplicativo|site|plataforma|digital|online|ia\b|intelig[eê]ncia artificial|automa|chatbot|bot|whatsapp|portal|proptech|tecnolog|dados|api|tour virtual|realidade|assinatura (digital|eletr)|blockchain|tokeniza|nuvem|lgpd|marketing|tr[aá]fego|lead|funil|integra[cç]|algoritmo|metaverso|drone|3d|startup|gest[aã]o)/i;

const SEMENTES = [
  "crm imobiliário", "sistema para imobiliária", "site para imobiliária", "inteligência artificial imobiliária",
  "marketing imobiliário digital", "automação imobiliária", "chatbot para imobiliária", "portal imobiliário",
  "gestão de imobiliária", "leads imobiliários", "tour virtual imóveis", "assinatura digital contrato imobiliário",
  "tráfego pago imobiliária", "whatsapp para corretor de imóveis", "software para corretor de imóveis", "aplicativo para corretor de imóveis",
];

async function dataforseo(path: string, body: unknown) {
  const login = Deno.env.get("DATAFORSEO_LOGIN")?.trim(), pwd = Deno.env.get("DATAFORSEO_PASSWORD")?.trim();
  if (!login || !pwd) throw new Error("DataForSEO sem credenciais");
  const r = await fetch("https://api.dataforseo.com/v3" + path, {
    method: "POST", headers: { Authorization: `Basic ${btoa(`${login}:${pwd}`)}`, "Content-Type": "application/json" }, body: JSON.stringify([body]),
  });
  if (!r.ok) throw new Error(`DataForSEO HTTP ${r.status}`);
  return (await r.json())?.tasks?.[0]?.result ?? [];
}
const LOC = { location_code: 2076, language_code: "pt" };

type Kw = { keyword: string; volume: number; kd: number | null };
async function candidatas(semente: string): Promise<Kw[]> {
  const lista = new Map<string, Kw>();
  try {
    const r = (await dataforseo("/dataforseo_labs/google/keyword_suggestions/live", { keyword: semente, ...LOC, limit: 100, include_seed_keyword: true }))[0] ?? {};
    for (const it of r.items ?? []) {
      const k = String(it?.keyword ?? "").trim(); const v = it?.keyword_info?.search_volume;
      if (k && typeof v === "number" && v > 0) lista.set(norm(k), { keyword: k, volume: v, kd: it?.keyword_properties?.keyword_difficulty ?? null });
    }
  } catch (e) { console.warn("[auto] suggestions", (e as Error).message); }
  try {
    const r = (await dataforseo("/dataforseo_labs/google/related_keywords/live", { keyword: semente, ...LOC, depth: 1, limit: 60 }))[0] ?? {};
    for (const it of r.items ?? []) {
      const kd = it?.keyword_data; const k = String(kd?.keyword ?? "").trim(); const v = kd?.keyword_info?.search_volume;
      if (k && typeof v === "number" && v > 0 && !lista.has(norm(k))) lista.set(norm(k), { keyword: k, volume: v, kd: kd?.keyword_properties?.keyword_difficulty ?? null });
    }
  } catch (e) { console.warn("[auto] related", (e as Error).message); }
  return [...lista.values()];
}

async function perguntasDoGoogle(kw: string): Promise<string[]> {
  const out: string[] = [];
  try {
    const s = (await dataforseo("/serp/google/organic/live/advanced", { keyword: kw, ...LOC, depth: 10 }))[0] ?? {};
    for (const it of s.items ?? []) if (it?.type === "people_also_ask") for (const q of it.items ?? []) if (q?.title) out.push(String(q.title));
  } catch (e) { console.warn("[auto] paa", (e as Error).message); }
  return out.slice(0, 6);
}

async function escolherPalavra(sementes: string[], usadas: Set<string>, usadasLista: string[]) {
  let principal: Kw | null = null, secundarias: Kw[] = [], semente = sementes[0];
  for (const s of sementes) {
    const todas = await candidatas(s);
    const livres = todas.filter((k) => !usadas.has(norm(k.keyword)) && !parecida(k.keyword, usadasLista) && TEC.test(k.keyword));
    const boas = livres.filter((k) => k.volume >= MIN_VOLUME && (k.kd == null || k.kd <= MAX_KD) && k.keyword.split(/\s+/).length >= 2)
      .sort((a, b) => nota(b) - nota(a));
    if (boas.length) {
      principal = boas[0]; semente = s;
      secundarias = livres.filter((k) => k.keyword !== boas[0].keyword).sort((a, b) => b.volume - a.volume).slice(0, 8);
      break;
    }
  }
  if (!principal) throw new Error("Nenhuma palavra fácil e procurada sobrou nas sementes testadas");
  return { principal, secundarias, perguntas: await perguntasDoGoogle(principal.keyword), semente };
}

/** Volume/dificuldade reais de uma palavra (para o artigo de tendência). */
async function medirPalavra(kw: string): Promise<Kw> {
  let volume = 0, kd: number | null = null;
  try {
    const r = await dataforseo("/keywords_data/google_ads/search_volume/live", { keywords: [kw], ...LOC });
    if (typeof r?.[0]?.search_volume === "number") volume = r[0].search_volume;
  } catch (e) { console.warn("[auto] volume", (e as Error).message); }
  try {
    const r = (await dataforseo("/dataforseo_labs/google/bulk_keyword_difficulty/live", { keywords: [kw], ...LOC }))[0] ?? {};
    const v = r.items?.[0]?.keyword_difficulty; if (typeof v === "number") kd = v;
  } catch (e) { console.warn("[auto] kd", (e as Error).message); }
  return { keyword: kw, volume, kd };
}

async function chaveOR(db: ReturnType<typeof createClient>): Promise<string> {
  let or = Deno.env.get("OPENROUTER_API_KEY")?.trim();
  if (!or) { const { data } = await db.rpc("get_ai_secret", { p_name: "OPENROUTER_API_KEY" }); or = typeof data === "string" ? data.trim() : ""; }
  if (!or) throw new Error("OPENROUTER_API_KEY não encontrada");
  return or;
}

// Só OpenRouter (decisão do William, 25/10/2026).
async function ia(db: ReturnType<typeof createClient>, sistema: string, prompt: string, modelo?: string, maxTokens = 12000): Promise<{ texto: string; citacoes: string[] }> {
  const or = await chaveOR(db);
  const model = modelo || Deno.env.get("OPENROUTER_MODEL_BLOG")?.trim() || "anthropic/claude-haiku-5.5";
  let r: Response | null = null;
  for (const espera of [0, 3000, 8000]) {
    if (espera) await new Promise((ok) => setTimeout(ok, espera));
    r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST", headers: { authorization: `Bearer ${or}`, "Content-Type": "application/json", "HTTP-Referer": "https://habivah.com", "X-Title": "Habivah" },
      body: JSON.stringify({ model, max_tokens: maxTokens, usage: { include: true }, messages: [{ role: "system", content: sistema }, { role: "user", content: prompt }] }),
    });
    if (r.ok || !(r.status === 429 || r.status >= 500)) break;
  }
  if (!r || !r.ok) throw new Error(`IA HTTP ${r?.status}: ${r ? (await r.text()).slice(0, 200) : ""}`);
  const d = await r.json();
  try {
    const u = d?.usage;
    if (u) await db.from("ia_uso").insert({ empresa_id: 1, funcao: "habivah-blog", modelo: d?.model || model, tokens_in: u.prompt_tokens ?? 0, tokens_out: u.completion_tokens ?? 0, tokens_cache: 0, custo_usd: typeof u.cost === "number" ? u.cost : 0 });
  } catch { /* medir não derruba */ }
  const citacoes: string[] = Array.isArray(d?.citations) ? d.citations.map(String) : [];
  for (const a of d?.choices?.[0]?.message?.annotations ?? []) if (a?.url_citation?.url) citacoes.push(String(a.url_citation.url));
  return { texto: d?.choices?.[0]?.message?.content ?? "", citacoes: [...new Set(citacoes)] };
}

type Tema = { titulo: string; resumo: string; por_que_importa: string; palavra_chave: string; fatos: string[]; fontes: { titulo: string; url: string }[] };
/** Pesquisa na internet as novidades de TECNOLOGIA no mercado imobiliário da semana (com fontes). */
async function pesquisarTendencias(db: ReturnType<typeof createClient>, jaPublicados: string[]): Promise<Tema[]> {
  const sistema = `Você é pesquisador de tecnologia para o mercado imobiliário (proptech). Use busca na web e só traga fatos com fonte verificável publicada nos últimos 21 dias. Responda SOMENTE JSON válido.`;
  const prompt = `Hoje é ${hojeSP()}. Quais são as 6 novidades de TECNOLOGIA mais comentadas agora no mercado imobiliário (Brasil primeiro; mundo se for relevante para o Brasil) que interessam a donos de imobiliária e corretores?
Escopo OBRIGATÓRIO — só tecnologia aplicada ao setor: inteligência artificial e agentes de IA para imobiliárias, CRM e automação de vendas, chatbots/WhatsApp, portais e algoritmos de anúncio, marketing digital e tráfego pago, proptechs (lançamentos, rodadas de investimento, produtos), assinatura digital e cartório eletrônico, tokenização/blockchain de imóveis, tour virtual, dados e LGPD.
FORA do escopo (não traga): juros, Selic, crédito imobiliário, preços de imóveis, vendas e lançamentos de construtoras, política habitacional — a menos que o centro da notícia seja uma tecnologia.
Não repita temas destes artigos já publicados: ${jaPublicados.slice(0, 40).join(" | ") || "—"}.
Formato: {"temas":[{"titulo":"...","resumo":"2-3 frases","por_que_importa":"para a imobiliária/corretor","palavra_chave":"como as pessoas buscariam no Google, 2 a 5 palavras, ligada à tecnologia","fatos":["fato com número/data e quem divulgou"],"fontes":[{"titulo":"...","url":"https://..."}]}]}`;
  const { texto, citacoes } = await ia(db, sistema, prompt, Deno.env.get("OPENROUTER_MODEL_PESQUISA")?.trim() || "perplexity/sonar-pro", 4000);
  const m = texto.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("Pesquisa de tendências não devolveu JSON");
  const temas: Tema[] = (JSON.parse(m[0])?.temas ?? []).map((t: any) => ({
    titulo: String(t?.titulo || "").slice(0, 160), resumo: String(t?.resumo || "").slice(0, 800),
    por_que_importa: String(t?.por_que_importa || "").slice(0, 500), palavra_chave: String(t?.palavra_chave || t?.titulo || "").slice(0, 80),
    fatos: Array.isArray(t?.fatos) ? t.fatos.map(String).slice(0, 8) : [],
    fontes: (Array.isArray(t?.fontes) ? t.fontes : []).map((f: any) => ({ titulo: String(f?.titulo || f?.url || "").slice(0, 160), url: String(f?.url || "") }))
      .filter((f: any) => /^https?:\/\//.test(f.url)).slice(0, 6),
  })).filter((t: Tema) => t.titulo && TEC.test(`${t.titulo} ${t.palavra_chave} ${t.resumo}`));
  // Fonte só vale se veio da busca real (citações do Sonar) — evita link inventado.
  const host = (u: string) => { try { return new URL(u).hostname; } catch { return ""; } };
  if (citacoes.length) for (const t of temas) t.fontes = t.fontes.filter((f) => citacoes.some((c) => c.replace(/\/$/, "") === f.url.replace(/\/$/, "") || host(c) === host(f.url)));
  return temas.filter((t) => t.fontes.length > 0);
}

async function capa(db: ReturnType<typeof createClient>, prompt: string, slug: string): Promise<string | null> {
  const key = Deno.env.get("FAL_KEY")?.trim();
  if (!key) return null;
  try {
    const r = await fetch("https://fal.run/fal-ai/flux/dev", {
      method: "POST", headers: { Authorization: `Key ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, image_size: "landscape_16_9", num_inference_steps: 28, num_images: 1, enable_safety_checker: true }),
    });
    if (!r.ok) { console.warn("[auto] fal", r.status, (await r.text()).slice(0, 200)); return null; }
    const url = (await r.json())?.images?.[0]?.url;
    if (!url) return null;
    const img = await fetch(url);
    const bytes = new Uint8Array(await img.arrayBuffer());
    const tipo = img.headers.get("content-type") || "image/jpeg";
    const path = `${slug}-${Date.now()}.${tipo.includes("png") ? "png" : "jpg"}`;
    const up = await db.storage.from("habivah-blog").upload(path, bytes, { contentType: tipo, upsert: true });
    if (up.error) { console.warn("[auto] storage", up.error.message); return url; }
    return db.storage.from("habivah-blog").getPublicUrl(path).data.publicUrl;
  } catch (e) { console.warn("[auto] capa", (e as Error).message); return null; }
}

async function avisar(p: { titulo: string; slug: string; status: string; palavra: string; volume: number; kd: number | null; capa: string | null; tipo: string }) {
  const key = Deno.env.get("HABIVAH_BREVO_API_KEY")?.trim();
  if (!key) return;
  const link = `https://habivah.com/blog/${p.slug}`;
  const html = `<div style="font-family:Manrope,Arial,sans-serif;font-size:15px;color:#0B1F3A"><h2 style="margin:0 0 10px">${p.status === "publicado" ? "Novo artigo publicado" : "Novo rascunho para revisar"}</h2>
${p.capa ? `<img src="${esc(p.capa)}" alt="" style="max-width:100%;border-radius:10px">` : ""}
<p><b>${esc(p.titulo)}</b></p><p>Tipo: ${p.tipo === "tendencia" ? "novidade de tecnologia da semana" : "palavra mais buscada"} · Palavra-chave: ${esc(p.palavra)} — ${p.volume} buscas/mês, dificuldade ${p.kd ?? "?"}/100</p>
<p><a href="${p.status === "publicado" ? link : "https://habivah.com/admin"}">${p.status === "publicado" ? "Ver no site" : "Revisar no painel"}</a></p></div>`;
  await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST", headers: { "api-key": key, "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify({ sender: { name: "Habivah Blog", email: "contato@habivah.com" }, to: [{ email: "contato@habivah.com" }], subject: `Blog Habivah: ${p.titulo}`, htmlContent: html, tags: ["habivah-blog-auto"] }),
  }).catch(() => {});
}

const SISTEMA = `Você é redator de SEO sênior do Habivah (habivah.com): sistema com CRM, site, blog e atendente de WhatsApp com IA para imobiliárias e corretores no Brasil. O blog do Habivah fala SÓ de tecnologia aplicada ao mercado imobiliário (IA, CRM, automação, portais, marketing digital, proptechs, dados) — não escreva sobre juros, crédito ou preços de imóveis como tema principal. Escreva em português do Brasil, tom consultivo e prático, para donos de imobiliária e corretores. Regras: não invente estatísticas, preços, leis, nomes de empresas ou números — use só os fatos fornecidos ou fale de forma geral; não cite concorrentes do Habivah pelo nome; sem promessas de resultado. Mencione o Habivah de forma natural no máximo 2 vezes, sem parecer anúncio. Responda SOMENTE um JSON válido, sem markdown, com: titulo (até 60 caracteres, com a palavra-chave), meta_description (até 155, com a palavra-chave), resumo (1-2 frases), categoria (uma: Tecnologia, IA, CRM, Marketing, Automação, Gestão), corpo_html (HTML só com h2, h3, p, ul, ol, li, strong, a; sem h1; 1.600 a 2.200 palavras; introdução que responde a busca logo no início; termine com uma conclusão com chamada para conhecer o Habivah em <a href="/#demo">agendar uma demonstração</a>), faq (array de 5 objetos {q, a} com respostas curtas), image_prompt (em inglês: fotografia realista, moderna, ligada ao tema de tecnologia — escritório de imobiliária com telas, corretor com tablet de costas, painel de dados desfocado, fachada moderna com elementos digitais etc.; luz natural; 16:9; sem texto, sem letras, sem logotipos, sem rostos identificáveis).`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const cron = req.headers.get("x-cron-secret");
  const segredo = Deno.env.get("CRON_SECRET_HABIVAH_BLOG_AUTO") || Deno.env.get("CRON_SECRET");
  let ok = !!cron && !!segredo && cron === segredo;
  if (!ok) {
    const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    const { data: u } = await db.auth.getUser(token);
    if (u?.user) ok = !!(await db.rpc("has_role", { _user_id: u.user.id, _role: "admin" })).data;
  }
  if (!ok) return json({ ok: false, error: "Não autorizado." }, 401);

  try {
    const b = await req.json().catch(() => ({}));
    const modo = b?.modo === "rascunho" ? "rascunho" : "publicado";
    const { data: existentes } = await db.from("habivah_blog_posts").select("palavra_chave,slug,titulo,origem,status");
    const usadasLista = (existentes ?? []).map((p) => String(p.palavra_chave || "")).filter(Boolean);
    const usadas = new Set(usadasLista.map(norm));
    const nAuto = (existentes ?? []).filter((p) => p.origem === "auto" && p.status === "publicado").length;
    const jaPublicados = (existentes ?? []).map((p) => String(p.titulo || p.slug)).slice(0, 60);
    // Alterna: um dia palavra buscada, no outro novidade de tecnologia (ou o que o admin pedir).
    let tipo: "busca" | "tendencia" = b?.tipo === "tendencia" || b?.tipo === "busca" ? b.tipo : (nAuto % 2 === 1 ? "tendencia" : "busca");

    let principal: Kw, secundarias: Kw[] = [], perguntas: string[] = [], contexto = "", fontes: { titulo: string; url: string }[] = [], semente = "";
    let tema: Tema | null = null;
    if (tipo === "tendencia") {
      try {
        const temas = (await pesquisarTendencias(db, jaPublicados))
          .filter((t) => !usadas.has(norm(t.palavra_chave)) && !parecida(t.titulo, jaPublicados, 0.5) && !parecida(t.palavra_chave, usadasLista));
        tema = temas[0] ?? null;
      } catch (e) { console.warn("[auto] tendências", (e as Error).message); }
      if (!tema) tipo = "busca"; // sem tema com fonte confiável → cai na palavra buscada
    }
    if (tipo === "tendencia" && tema) {
      principal = await medirPalavra(tema.palavra_chave);
      perguntas = await perguntasDoGoogle(tema.palavra_chave);
      fontes = tema.fontes; semente = "novidades de tecnologia da semana";
      contexto = `TIPO: novidade de tecnologia no mercado imobiliário (hoje é ${hojeSP()}).
Tema: ${tema.titulo}
Resumo: ${tema.resumo}
Por que importa para imobiliárias/corretores: ${tema.por_que_importa}
Fatos verificados (use só estes números e datas, citando quem divulgou): ${tema.fatos.map((f) => `- ${f}`).join("\n")}
Fontes (cite no texto pelo nome do veículo/órgão): ${fontes.map((f) => `${f.titulo} (${f.url})`).join("; ")}
Estrutura: o que aconteceu → o que muda na prática para a imobiliária e o corretor → como aproveitar a tecnologia (ações concretas) → conclusão.`;
    } else {
      const ordem = b?.semente ? [String(b.semente)] : [0, 1, 2, 3].map((i) => SEMENTES[(nAuto + i) % SEMENTES.length]);
      const kw = await escolherPalavra(ordem, usadas, usadasLista);
      principal = kw.principal; secundarias = kw.secundarias; perguntas = kw.perguntas; semente = kw.semente;
      contexto = `TIPO: guia sobre tecnologia para imobiliárias, a partir de uma busca real do Google.`;
    }

    const prompt = `${contexto}
Palavra-chave principal: "${principal.keyword}" (${principal.volume} buscas/mês no Brasil, dificuldade ${principal.kd ?? "?"}/100).
Palavras secundárias (use de forma natural): ${secundarias.map((k) => `${k.keyword} (${k.volume})`).join("; ") || "—"}.
Perguntas reais que as pessoas fazem no Google (use no FAQ quando fizer sentido): ${perguntas.join(" | ") || "—"}.
Artigos que JÁ existem no blog — não repita o tema nem o ângulo deles: ${jaPublicados.join(" | ") || "—"}.`;
    const { texto } = await ia(db, SISTEMA, prompt);
    const m = texto.match(/\{[\s\S]*\}/);
    if (!m) throw new Error("IA não devolveu JSON");
    const a = JSON.parse(m[0]);
    const titulo = String(a.titulo || principal.keyword).slice(0, 120);
    let slug = slugify(tipo === "tendencia" ? titulo : principal.keyword) || slugify(titulo);
    if ((existentes ?? []).some((p) => p.slug === slug)) slug = `${slug}-${new Date().toISOString().slice(0, 10)}`;
    let corpo = limpaHtml(String(a.corpo_html || ""));
    if (fontes.length) corpo += `\n<h2>Fontes</h2>\n<ul>${fontes.map((f) => `<li><a href="${esc(f.url)}" target="_blank" rel="noopener nofollow">${esc(f.titulo)}</a></li>`).join("")}</ul>`;
    const palavras = corpo.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    if (palavras < 600) throw new Error(`Artigo curto demais (${palavras} palavras)`);

    const capaUrl = await capa(db, String(a.image_prompt || `Modern real estate agency office with technology screens, natural light, photorealistic, no text`), slug);
    const agora = new Date().toISOString();
    const row = {
      slug, titulo,
      resumo: String(a.resumo || "").slice(0, 300),
      meta_description: String(a.meta_description || a.resumo || "").slice(0, 160),
      categoria: String(a.categoria || "Tecnologia").slice(0, 30),
      corpo_html: corpo,
      faq: Array.isArray(a.faq) ? a.faq.slice(0, 6).map((f: any) => ({ q: String(f.q || "").slice(0, 200), a: String(f.a || "").slice(0, 700) })) : [],
      palavra_chave: principal.keyword, volume_busca: principal.volume, dificuldade: principal.kd,
      palavras_secundarias: secundarias.map((k) => k.keyword),
      min_leitura: Math.max(3, Math.round(palavras / 200)),
      capa_url: capaUrl, capa_alt: capaUrl ? `${principal.keyword} — ilustração` : null,
      origem: "auto", status: modo, publicado_em: modo === "publicado" ? agora : null, updated_at: agora,
    };
    const ins = await db.from("habivah_blog_posts").insert(row).select("id,slug,titulo,status").single();
    if (ins.error) throw new Error("Salvar: " + ins.error.message);
    await avisar({ titulo, slug, status: modo, palavra: principal.keyword, volume: principal.volume, kd: principal.kd, capa: capaUrl, tipo });
    return json({ ok: true, tipo, post: ins.data, palavra_chave: principal, palavras, capa: !!capaUrl, semente, fontes: fontes.length });
  } catch (e) {
    console.error("[habivah-blog-auto]", e);
    return json({ ok: false, error: (e as Error).message }, 500);
  }
});
