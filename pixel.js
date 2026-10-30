/* Meta Pixel Habivah (1065670096545904) + eventos de conversão */
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','1065670096545904');
fbq('track','PageView');
// Clique em qualquer botão/link de WhatsApp = Contact
document.addEventListener('click',function(ev){
  var a=ev.target.closest&&ev.target.closest('a[href*="wa.me"],a[href*="api.whatsapp.com"]');
  if(!a)return;
  var label=(a.textContent||'').trim().slice(0,60);
  fbq('track','Contact',{content_name:label,content_category:'whatsapp',page:location.pathname});
},true);
