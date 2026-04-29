const routes = [
  { path: '/api/v1/user/signin/otp', method: 'POST' },
  { path: '/api/v1/user/otp/sign/submit', method: 'POST' },
  { path: '/api/v1/user/ctagory/fetch', method: 'POST' },
  { path: '/api/v1/user/sub/ctagory/fetch', method: 'POST' },
  { path: '/api/v1/user/query/create', method: 'POST' },
  { path: '/api/v1/user/query/fecthall', method: 'POST' },
  { path: '/api/v1/user/query/fecth/track', method: 'POST' },
  { path: '/api/v1/user/query/comments', method: 'POST' },
  { path: '/api/v1/user/profile/fetch', method: 'POST' },
  { path: '/api/v1/user/query/attachments', method: 'POST' },
  { path: '/api/v1/user/upload/attachments', method: 'POST' },
  { path: '/api/v1/user/delete/attachments', method: 'POST' },
  { path: '/api/v1/preview/12345', method: 'GET' },
  
  { path: '/api/v1/teacher/sign', method: 'POST' },
  { path: '/api/v1/teacher/ctagory/create', method: 'POST' },
  { path: '/api/v1/teacher/ctagory/update', method: 'POST' },
  { path: '/api/v1/teacher/ctagory/delete', method: 'POST' },
  { path: '/api/v1/teacher/sub/ctagory/create', method: 'POST' },
  { path: '/api/v1/teacher/sub/ctagory/update', method: 'POST' },
  { path: '/api/v1/teacher/sub/ctagory/delete', method: 'POST' },
  { path: '/api/v1/teacher/ctagory/fetch', method: 'POST' },
  { path: '/api/v1/teacher/sub/ctagory/fetch', method: 'POST' },
  { path: '/api/v1/teacher/autoforward/create', method: 'POST' },
  { path: '/api/v1/teacher/autoforward/update', method: 'POST' },
  { path: '/api/v1/teacher/autoforward/delete', method: 'POST' },
  { path: '/api/v1/teacher/autoforward/fetch', method: 'POST' }
];

const BASE_URL = 'https://drixie-backend.onrender.com';

async function testRoutes() {
  console.log("Testing endpoints...");
  let allGood = true;
  for (const route of routes) {
    try {
      const res = await fetch(BASE_URL + route.path, {
        method: route.method,
        headers: { 'Content-Type': 'application/json' }
      });
      const contentType = res.headers.get('content-type') || '';
      
      let isJson = contentType.includes('application/json');
      // For preview endpoint it might return error JSON or HTML if 404
      if (res.status === 404 && contentType.includes('text/html')) {
          console.log(`❌ FAILED: ${route.method} ${route.path} returned 404 HTML`);
          allGood = false;
      } else {
          console.log(`✅ OK: ${route.method} ${route.path} (Status: ${res.status}, Type: ${contentType})`);
      }
    } catch (e) {
      console.log(`❌ ERROR: ${route.method} ${route.path} - ${e.message}`);
      allGood = false;
    }
  }
  if(allGood) console.log("All routes verified!");
}
testRoutes();
