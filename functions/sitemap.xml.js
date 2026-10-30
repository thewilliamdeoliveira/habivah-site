import { posts, esc } from "./_db.js";
export async function onRequest({ env, request }) {
  const base = await env.ASSETS.fetch(new URL("/sitemap.xml", request.url));
  let xml = await base.text();
  const lista = await posts("select=slug,updated_at&order=publicado_em.desc&limit=500");
  const extra = lista.map((p) => `<url><loc>https://habivah.com/blog/${esc(p.slug)}</loc><lastmod>${(p.updated_at || "").slice(0, 10)}</lastmod></url>`).join("");
  xml = xml.replace("</urlset>", extra + "</urlset>");
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=600" } });
}
