// 코코 가족앱 Service Worker - Share Target 지원
const CACHE_NAME = 'coco-v2';

self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { self.clients.claim(); });

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Share Target 처리
  if (url.pathname.includes('share-target') && event.request.method === 'POST') {
    event.respondWith(handleShareTarget(event.request));
    return;
  }

  // 일반 요청은 네트워크 우선
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

async function handleShareTarget(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (file && file.size > 0) {
      // 공유받은 파일을 Cache에 임시 저장
      const cache = await caches.open('shared-media');
      await cache.put('pending-photo', new Response(file, {
        headers: { 'Content-Type': file.type, 'X-File-Name': file.name || 'photo.jpg' }
      }));
    }
  } catch(e) {
    console.error('Share target error:', e);
  }

  // 메인 앱으로 리다이렉트
  return Response.redirect('/coco-app/?shared=1', 303);
}
