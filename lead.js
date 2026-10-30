/* Captura de lead antes do WhatsApp: todo link wa.me abre um formulário; só depois do cadastro salvo o visitante é levado ao WhatsApp. */
(function(){
  var ENDPOINT="https://rzsotlrmjrkslsltnntg.supabase.co/functions/v1/habivah-interesse";
  var css=".hl-ov{position:fixed;inset:0;background:rgba(11,31,58,.72);display:none;align-items:center;justify-content:center;z-index:99999;padding:16px;font-family:Inter,system-ui,sans-serif}.hl-ov.on{display:flex}.hl-box{background:#fff;color:#0B1F3A;border-radius:14px;max-width:420px;width:100%;padding:26px 24px;box-shadow:0 20px 60px rgba(0,0,0,.35);position:relative}.hl-box h3{margin:0 0 6px;font-size:21px;font-family:'Playfair Display',Georgia,serif}.hl-box p.s{margin:0 0 16px;font-size:14px;color:#4a5a70}.hl-box label{display:block;font-size:13px;font-weight:600;margin:10px 0 0}.hl-box input{width:100%;box-sizing:border-box;margin-top:4px;padding:11px 12px;border:1px solid #c9d2de;border-radius:8px;font-size:16px;font-family:inherit}.hl-box input:focus{outline:2px solid #C9A45C;border-color:#C9A45C}.hl-btn{width:100%;margin-top:16px;padding:13px;border:0;border-radius:999px;background:#C9A45C;color:#0B1F3A;font-weight:700;font-size:16px;cursor:pointer;font-family:inherit}.hl-btn:disabled{opacity:.6;cursor:wait}.hl-x{position:absolute;top:8px;right:12px;background:none;border:0;font-size:26px;line-height:1;cursor:pointer;color:#4a5a70}.hl-msg{min-height:18px;margin:10px 0 0;font-size:13px;color:#b3261e}.hl-l{font-size:12px;color:#6b7a8f;margin:8px 0 0}.hl-l a{color:inherit}.hl-hp{position:absolute;left:-9999px;opacity:0}";
  var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
  var ov=document.createElement("div");ov.className="hl-ov";ov.setAttribute("role","dialog");ov.setAttribute("aria-modal","true");ov.setAttribute("aria-labelledby","hl-t");
  ov.innerHTML='<div class="hl-box"><button type="button" class="hl-x" aria-label="Fechar">&times;</button><h3 id="hl-t">Antes de abrir o WhatsApp</h3><p class="s">Deixe seus dados e já te levamos para a conversa.</p><form novalidate><label>Seu nome<input name="nome" required autocomplete="name" placeholder="Como quer ser chamado"></label><label>WhatsApp<input name="telefone" type="tel" inputmode="tel" required autocomplete="tel" placeholder="(11) 9 9999-9999"></label><label>E-mail<input name="email" type="email" required autocomplete="email" placeholder="voce@imobiliaria.com.br"></label><label>Imobiliária (opcional)<input name="imobiliaria" autocomplete="organization" placeholder="Nome da imobiliária"></label><input class="hl-hp" name="site_url" tabindex="-1" autocomplete="off" aria-hidden="true"><button class="hl-btn" type="submit">Continuar no WhatsApp</button><p class="hl-msg" role="status" aria-live="polite"></p><p class="hl-l">Seus dados são usados só para falar com você sobre o Habivah. <a href="/privacidade">Política de privacidade</a>.</p></form></div>';
  document.body.appendChild(ov);
  var f=ov.querySelector("form"),msg=ov.querySelector(".hl-msg"),btn=ov.querySelector(".hl-btn"),target="",cta="";
  var utm={};try{new URLSearchParams(location.search).forEach(function(v,k){if(/^(utm_|gclid|fbclid)/.test(k))utm[k]=v;});}catch(e){}
  try{var saved=JSON.parse(localStorage.getItem("hl_lead")||"{}");["nome","telefone","email","imobiliaria"].forEach(function(k){if(saved[k])f.elements[k].value=saved[k];});}catch(e){}
  function open(href,label){target=href;cta=label;msg.textContent="";btn.disabled=false;ov.classList.add("on");setTimeout(function(){var i=f.elements.nome.value?f.elements.telefone:f.elements.nome;i.focus();},50);}
  function close(){ov.classList.remove("on");}
  ov.addEventListener("click",function(e){if(e.target===ov||e.target.classList.contains("hl-x"))close();});
  document.addEventListener("keydown",function(e){if(e.key==="Escape")close();});
  document.addEventListener("click",function(ev){
    var a=ev.target.closest&&ev.target.closest('a[href*="wa.me"],a[href*="api.whatsapp.com"]');
    if(!a||ev.target.closest(".hl-ov"))return;
    ev.preventDefault();ev.stopPropagation();
    open(a.href,(a.textContent||"").trim().slice(0,60));
  },true);
  f.addEventListener("submit",async function(ev){
    ev.preventDefault();
    var d=Object.fromEntries(new FormData(f).entries());
    var tel=(d.telefone||"").replace(/\D/g,"");
    if(!d.nome||d.nome.trim().length<2){msg.textContent="Informe seu nome.";return;}
    if(tel.length<10){msg.textContent="Informe seu WhatsApp com DDD.";return;}
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email||"")){msg.textContent="Informe um e-mail válido.";return;}
    btn.disabled=true;msg.style.color="#4a5a70";msg.textContent="Enviando…";
    try{
      var r=await fetch(ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.assign({},d,{utm:utm,pagina:location.pathname+location.search+(cta?" [cta: "+cta+"]":"")}))});
      var j=await r.json().catch(function(){return {};});
      if(!(r.ok&&j.ok)){msg.style.color="#b3261e";msg.textContent=j.error||"Não foi possível enviar agora. Tente de novo.";btn.disabled=false;return;}
      try{localStorage.setItem("hl_lead",JSON.stringify({nome:d.nome,telefone:d.telefone,email:d.email,imobiliaria:d.imobiliaria||""}));}catch(e){}
      if(window.fbq){fbq("track","Lead",{content_name:cta||"whatsapp",page:location.pathname});fbq("track","Contact",{content_category:"whatsapp",page:location.pathname});}
      msg.style.color="#1a7f37";msg.textContent="Pronto! Abrindo o WhatsApp…";
      setTimeout(function(){location.href=target;},350);
    }catch(e){msg.style.color="#b3261e";msg.textContent="Sem conexão agora. Tente de novo.";btn.disabled=false;}
  });
  // Formulário da página inicial: depois de salvar, também segue para o WhatsApp
  window.habivahAfterLead=function(){var a=document.querySelector('a[href*="wa.me"]');var u=a?a.href:"https://wa.me/5511915190774?text=Ol%C3%A1!%20Quero%20conhecer%20o%20Habivah.";setTimeout(function(){location.href=u;},900);};
})();
