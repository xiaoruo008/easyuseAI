const http = require('http');

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('TIMEOUT')), 35000);
    const opts = { hostname: '127.0.0.1', port: 3005, path, method };
    const req = http.request(opts, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        clearTimeout(timer);
        try { resolve(JSON.parse(d)); } catch { resolve(d); }
      });
    });
    req.on('error', e => { clearTimeout(timer); reject(e); });
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

(async () => {
  try {
    // Step1: create session
    const s = await request('POST', '/api/diagnosis/session', {});
    const id = s.id;
    // Step2: submit answers — must use numeric keys to match Record<number, AnswerValue> expected by extractFields()
    // q1=A(suit_set) q2=A(domestic) q3=C(model) q4=A q5=B
    await request('PATCH', '/api/diagnosis/session/' + id, {
      answers: { 1: 'A', 2: 'A', 3: 'C', 4: 'A', 5: 'B' },
      action: 'model_photo',
      completed: true
    });
    // Step3: result
    const t0 = Date.now();
    const r = await request('GET', '/api/diagnosis/session/' + id + '/result?action=model_photo', null);
    const ms = Date.now() - t0;
    console.log('OK ms=' + ms + ' wk=' + r.workflow?.workflowKey + ' persona=' + (r.aiPersona ? 'yes' : 'null'));
  } catch (e) {
    console.error('FAIL:', e.message);
  }
})();
