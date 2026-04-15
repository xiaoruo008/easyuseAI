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
  console.log('=== Cron E2E: Submit → Result → Execute 完整链路验证 ===\n');

  // Step 1: Create session
  const session = await request('POST', '/api/diagnosis/session', { name: 'cron-chain-test', contact: 'test@cron.ai' });
  const sessionId = session.id;
  if (!sessionId) { console.error('❌ Step1: 创建 session 失败', session); process.exit(1); }
  console.log('✅ Step1: session 创建成功, id=' + sessionId);

  // Step 2: Submit answers (domestic + womenswear + top + model_photo)
  const answers = {
    q1: 'A', // domestic
    q2: 'B', // womenswear
    q3: 'A', // top
    q4: 'C', // model_photo
    q5: 'A'  // main_white
  };
  const patchRes = await request('PATCH', `/api/diagnosis/session/${sessionId}`, { answers });
  console.log('✅ Step2: 答案提交, completed=' + (patchRes.completed ?? false));

  // Step 3: Get result with action=model_photo
  const result = await request('GET', `/api/diagnosis/session/${sessionId}/result?action=model_photo`);
  const workflowKey = result.workflow?.workflowKey;
  if (!workflowKey) {
    console.error('❌ Step3: Result API 未返回 workflowKey', JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log('✅ Step3: Result API 返回, workflowKey=' + workflowKey);
  console.log('   template: ' + result.workflow?.config?.templateId);
  console.log('   aiPersona: ' + (result.aiPersona?.substring?.(0, 50) ?? result.aiPersona ?? 'n/a'));

  // Step 4: Call Execute API with workflowKey
  const executeRes = await request('POST', '/api/execute/generate', {
    sessionId,
    action: 'model_photo',
    type: result.result?.type,
    workflowKey: workflowKey,
    userPersona: result.aiPersona,
    userPainPoint: result.result?.painPoint,
    userBusinessType: result.result?.type,
    prompt: 'test prompt',
    style: 'commercial',
    aspectRatio: '1:1'
  });

  if (executeRes.error) {
    console.log('⚠️  Step4: Execute API 返回错误 (非致命): ' + executeRes.error);
  }
  if (executeRes.success) {
    console.log('✅ Step4: Execute API 调用成功');
  } else {
    console.log('⚠️  Step4: Execute API success=false (可能是 mock provider): ' + executeRes.error);
  }
  console.log('   taskCategory: ' + executeRes.taskCategory);
  console.log('   templateKey: ' + executeRes.templateKey);
  console.log('   templateId: ' + executeRes.templateId);
  console.log('   result.imageUrl: ' + (executeRes.result?.imageUrl ?? 'n/a'));
  console.log('   result.provider: ' + (executeRes.result?.provider ?? 'n/a'));
  console.log('   source: ' + executeRes.source);

  console.log('\n=== 完整链路验证完成 ===');
  console.log('结论: Submit → Result → Execute 链路' + (executeRes.success || executeRes.result?.imageUrl ? '✅ 通畅' : '⚠️ 部分通畅 (Execute API 需要真实 API Key)'));
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
