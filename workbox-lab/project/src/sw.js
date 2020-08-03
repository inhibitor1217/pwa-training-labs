importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.4.1/workbox-sw.js');

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);

  workbox.precaching.precacheAndRoute([]);

  workbox.routing.registerRoute(
    /(.*)articles(.*)\.(?:png|gif|jpg)/,
    workbox.strategies.cacheFirst({
      cacheName: 'images-cache',
      plugins: [
        new workbox.expiration.Plugin({
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        })
      ]
    })
  );

  workbox.routing.registerRoute(
    /(.*)icon(.*)\.svg/,
    workbox.strategies.staleWhileRevalidate({
      cacheName: 'icon-cache',
      plugins: [
        new workbox.expiration.Plugin({
          maxEntries: 5,
        })
      ]
    })
  );

  const articleHandler = workbox.strategies.networkFirst({
    cacheName: 'articles-cache',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 50
      })
    ]
  });

  workbox.routing.registerRoute(/(.*)article(.*)\.html/, args => 
    articleHandler.handle(args)
      .then(response => {
        if (!response) {
          return caches.match('pages/offline.html');
        } else if (response.status == 404) {
          return caches.match('pages/404.html');
        }
        return response;
      })
  );

  const postHandler = workbox.strategies.cacheFirst({
    cacheName: 'posts-cache',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 50
      })
    ]
  });

  workbox.routing.registerRoute(/(.*)post(.*)\.html/, args =>
    postHandler.handle(args)
      .then(response => {
        if (!response) {
          return caches.match('pages/offline.html');
        } else if (response.status == 404) {
          return caches.match('pages/404.html');
        }
        return response;
      })
  );

} else {
  console.log(`Boo! Workbox didn't load 😬`);
}