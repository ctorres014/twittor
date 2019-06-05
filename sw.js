// Import file
importScripts('js/sw-utils.js');

const STATIC_CACHE = 'static-v3';
const DINAMIC_CACHE = 'dynamic-v2';
const STATIC_INMUTABLE_CACHE = 'inmutable-v1';

// Va a contener todo lo necesario para la app
const APP_SHELL = [
    '/',
    'index.html',
    'css/style.css',
    'img/favicon.ico',
    'img/avatars/hulk.jpg',
    'img/avatars/ironman.jpg',
    'img/avatars/spiderman.jpg',
    'img/avatars/thor.jpg',
    'img/avatars/wolverine.jpg',
    'js/app.js'
]

// Todo lo que no se va a modificar jamas
const APP_SHELL_INMUTABLE = [
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
    'css/animate.css',
    'js/libs/jquery.js'
]

// Procedemos a la instalacion del service worker
self.addEventListener('install', e => {

    const cacheStatic = caches.open(STATIC_CACHE).then(cache => cache.addAll(APP_SHELL));
    const cacheInmutable = caches.open(STATIC_INMUTABLE_CACHE).then(cache => cache.addAll(APP_SHELL_INMUTABLE));

    e.waitUntil(Promise.all([cacheStatic, cacheInmutable]));
});



// Verificar las versiones del cache statico
// en el caso de haber diferencias de versiones se borra el cache
self.addEventListener('activate', e => {

    const respuesta = caches.keys().then(keys => {
        keys.forEach(key => {
            if (key !== STATIC_CACHE && key.includes('static')) {
                return caches.delete(key);
            }
            if (key !== DYNAMIC_CACHE && key.includes('dynamic')) {
                return caches.delete(key);
            }
        });
    });

    e.waitUntil(respuesta);

});

// Cache Network Fallback
// Sino encuentra en el cache va al network a traer la informacion
self.addEventListener('fetch', e => {

    const respuesta = caches.match(e.request).then(res => {
        if (res) {
            return res;
        } else {
            return fetch(e.request).then(newRes => {
                return actualizarCacheDinamico(DINAMIC_CACHE, e.request, newRes);
            });
        }
    });

    e.respondWith(respuesta);

})