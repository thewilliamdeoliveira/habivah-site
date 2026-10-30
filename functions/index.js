// Home: os 3 artigos mais recentes do blog (vindos do banco) na seção #blog.
import { posts } from "./_db.js";
import { card } from "./blog/_middleware.js";
export async function onRequest({ request, next }) {
  const res = await next();
  if (request.method !== "GET" || !(res.headers.get("content-type") || "").includes("text/html")) return res;
  const lista = await posts("select=slug,titulo,resumo,categoria,publicado_em,min_leitura,capa_url,capa_alt&order=publicado_em.desc&limit=3");
  if (!lista.length) return new HTMLRewriter().on("section#blog", { element(e) { e.remove(); } }).transform(res);
  const html = lista.map(card).join("");
  return new HTMLRewriter().on("section#blog div.grade.posts", { element(e) { e.setInnerContent(html, { html: true }); } }).transform(res);
}
