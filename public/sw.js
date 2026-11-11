const C="nekocal-v2";
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(["./","index.html","manifest.webmanifest","icon.svg","icon-192.png","icon-512.png","icon-180.png"])));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);
 if(u.origin===location.origin&&(r.mode==="navigate"||u.pathname.endsWith("index.html"))){e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put(r,cp));return res}).catch(()=>caches.match(r).then(m=>m||caches.match("index.html"))));return}
 e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok&&(u.origin===location.origin||u.host.includes("fonts.")))caches.open(C).then(c=>c.put(r,res.clone()));return res})))});
