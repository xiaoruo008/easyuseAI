const http = require('http');

function request(method, path, data) {
  return new Promise((resolve, reject) => {
    const body = data ? JSON.stringify(data) : null;
    const opts = {
      hostname: 'localhost',
      port: 3005,
      path,
      method,
      headers: {}
    };
    if (body) {
      opts.headers['Content-Type'] = 'application/json';
      opts.headers['Content-Length'] = Buffer.byteLength(body);
    }
    const req = http.request(opts, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); }
        catch { resolve(d); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  // Step 1: Create session
  const session = await request('POST', '/api/diagnosis/session', { name: 'cron-test', contact: 'test@cron.ai' });
  const sessionId = session.id;
  console.log('SESSION_ID=' + sessionId);

  // Step 2: Submit answers (domestic + womenswear + top + model_photo)
  const answers = {
    q1: 'A', // domestic
    q2: 'B', // womenswear
    q3: 'A', // top
    q4: 'C', // model_photo
    q5: 'A'  // main_white
  };
  await request('PATCH', `/api/diagnosis/session/${sessionId}`, { answers });

  // Step 3: Get result
  const result = await request('GET', `/api/diagnosis/session/${sessionId}/result?action=model_photo`);
  console.log('RESULT=' + JSON.stringify(result, null, 2));
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
