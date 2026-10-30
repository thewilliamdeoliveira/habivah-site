// Acesso somente-leitura (chave pública) aos posts publicados do blog.
export const SB = "https://rzsotlrmjrkslsltnntg.supabase.co";
export const KEY = "sb_publishable_smEE1n3Srugt98xxmNZ_4g_q5A_0ddN";
export async function posts(query) {
  try {
    const r = await fetch(`${SB}/rest/v1/habivah_blog_posts?status=eq.publicado&${query}`, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
    });
    return r.ok ? await r.json() : [];
  } catch { return []; }
}
export const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export function limpa(h) {
  return String(h ?? "")
    .replace(/<\s*(script|style|iframe|object|embed)[\s\S]*?<\/\s*\1\s*>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");
}
export function dataBR(iso) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" });
}
