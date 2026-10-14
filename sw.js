/* Quiz: działanie bez internetu.
   Strona: najpierw sieć (żeby nowe pytania docierały), bez sieci – zapisana kopia.
   Reszta (ikony, czcionki): z kopii, a w tle odświeżana. */
const WERSJA = "paszport-v1";
const PLIKI = ["./", "index.html", "manifest.webmanifest", "ikona-192.png", "ikona-512.png", "ikona-180.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(WERSJA).then(c => c.addAll(PLIKI)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(k => Promise.all(k.filter(n => n !== WERSJA).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  if (r.mode === "navigate") {
    e.respondWith(fetch(r).then(odp => {
      const kopia = odp.clone();
      caches.open(WERSJA).then(c => c.put("index.html", kopia));
      return odp;
    }).catch(() => caches.match("index.html")));
    return;
  }
  e.respondWith(caches.match(r).then(zapisane => {
    const zSieci = fetch(r).then(odp => {
      if (odp && (odp.ok || odp.type === "opaque")) {
        const k = odp.clone();
        caches.open(WERSJA).then(c => c.put(r, k));
      }
      return odp;
    }).catch(() => zapisane);
    return zapisane || zSieci;
  }));
});
