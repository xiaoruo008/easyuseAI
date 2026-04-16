const http = require('http');
function req(method, path, data) {
  return new Promise((resolve, reject) => {
    const body = data ? JSON.stringify(data) : null;
    const opts = { hostname:'127.0.0.1', port:3005, path, method, headers:{} };
    if (body) { opts.headers['Content-Type']='application/json'; opts.headers['Content-Length']=Buffer.byteLength(body); }
    const r = http.request(opts, (res) => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>{ try{resolve(JSON.parse(d));}catch{resolve(d);} }); });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}
async function main() {
  // Test 1: domestic + menswear + suit_set + model
  const s1 = await req('POST', '/api/diagnosis/session', { name: 'q1', contact: 'x' });
  await req('PATCH', '/api/diagnosis/session/'+s1.id, { answers:{1:'A',2:'A',3:'C',4:'A',5:'B'}, action:'model_photo', completed:true });
  const r1 = await req('GET', '/api/diagnosis/session/'+s1.id+'/result?action=model_photo');
  console.log('Test1 (A/A/C): market='+r1.fields?.market+', gender='+r1.fields?.gender+', category='+r1.fields?.category+', targetImage='+r1.fields?.targetImage+', workflowKey='+r1.workflow?.workflowKey);

  // Test 2: cross_border + womenswear + dress + lifestyle
  const s2 = await req('POST', '/api/diagnosis/session', { name: 'q2', contact: 'x' });
  await req('PATCH', '/api/diagnosis/session/'+s2.id, { answers:{1:'C',2:'B',3:'D',4:'A',5:'B'}, action:'lifestyle', completed:true });
  const r2 = await req('GET', '/api/diagnosis/session/'+s2.id+'/result?action=lifestyle');
  console.log('Test2 (C/B/D): market='+r2.fields?.market+', gender='+r2.fields?.gender+', category='+r2.fields?.category+', targetImage='+r2.fields?.targetImage+', workflowKey='+r2.workflow?.workflowKey);

  // Test 3: domestic + womenswear + top + main_white
  const s3 = await req('POST', '/api/diagnosis/session', { name: 'q3', contact: 'x' });
  await req('PATCH', '/api/diagnosis/session/'+s3.id, { answers:{1:'B',2:'A',3:'A',4:'A',5:'B'}, action:'background_swap', completed:true });
  const r3 = await req('GET', '/api/diagnosis/session/'+s3.id+'/result?action=background_swap');
  console.log('Test3 (B/A/A): market='+r3.fields?.market+', gender='+r3.fields?.gender+', category='+r3.fields?.category+', targetImage='+r3.fields?.targetImage+', workflowKey='+r3.workflow?.workflowKey);

  // Test 4: cross_border + menswear + suit_set + hero_branded
  const s4 = await req('POST', '/api/diagnosis/session', { name: 'q4', contact: 'x' });
  await req('PATCH', '/api/diagnosis/session/'+s4.id, { answers:{1:'A',2:'B',3:'A',4:'A',5:'B'}, action:'product_photo', completed:true });
  const r4 = await req('GET', '/api/diagnosis/session/'+s4.id+'/result?action=product_photo');
  console.log('Test4 (A/B/A): market='+r4.fields?.market+', gender='+r4.fields?.gender+', category='+r4.fields?.category+', targetImage='+r4.fields?.targetImage+', workflowKey='+r4.workflow?.workflowKey);

  console.log('\nAll Result API tests complete');
}
main().catch(e=>{console.error('ERROR:',e.message);process.exit(1);});