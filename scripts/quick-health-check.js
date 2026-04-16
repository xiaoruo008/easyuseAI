const http = require('http');

function req(method, path, data) {
  return new Promise((resolve, reject) => {
    const body = data ? JSON.stringify(data) : null;
    const opts = { hostname: '127.0.0.1', port: 3005, path, method, headers: {} };
    if (body) {
      opts.headers['Content-Type'] = 'application/json';
      opts.headers['Content-Length'] = Buffer.byteLength(body);
    }
    const r = http.request(opts, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); }
        catch { resolve(d); }
      });
    });
    r.setTimeout(15000, () => { r.destroy(); reject(new Error('timeout')); });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

async function main() {
  const t0 = Date.now();

  // Step1: create session
  const session = await req('POST', '/api/diagnosis/session', { name: 'health-check', contact: 'hc@test.ai' });
  const sid = session.id;
  console.log('Step1:', Date.now()-t0, 'ms - session:', sid ? 'OK(id='+sid+')' : 'FAIL');

  // Step2: submit answers
  const patch = await req('PATCH', '/api/diagnosis/session/'+sid, {
    answers: {1:'A',2:'A',3:'C',4:'A',5:'B'},
    action: 'model_photo',
    completed: true
  });
  console.log('Step2:', Date.now()-t0, 'ms - answers:', patch.completed ? 'OK' : 'FAIL');

  // Step3: get result
  const result = await req('GET', '/api/diagnosis/session/'+sid+'/result?action=model_photo');
  const wk = result.workflow?.workflowKey;
  console.log('Step3:', Date.now()-t0, 'ms - result:', wk ? 'OK(wk='+wk+')' : 'FAIL');
  console.log('aiPersona:', result.aiPersona ? 'present' : 'missing');

  console.log('\n总耗时:', Date.now()-t0, 'ms');
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
