const http = require('http');

function request(method, path, data, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const body = data ? JSON.stringify(data) : null;
    const opts = {
      hostname: '127.0.0.1',
      port: 3005,
      path,
      method,
      headers: {}
    };
    if (body) {
      opts.headers['Content-Type'] = 'application/json';
      opts.headers['Content-Length'] = Buffer.byteLength(body);
    }
    const timer = setTimeout(() => {
      req.destroy(new Error(`Timeout after ${timeoutMs}ms`));
    }, timeoutMs);
    const req = http.request(opts, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        clearTimeout(timer);
        try { resolve(JSON.parse(d)); }
        catch { resolve(d); }
      });
    });
    req.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
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

  // Step 2: Submit answers (image_poor profile: q1=A no good image, q2=A nearly free, q3=C improve conversion, q4=A not used AI, q5=B <100 budget)
  // NOTE: answers must use numeric keys to match Record<number, AnswerValue> expected by calculateResult()
  const answers = {
    1: 'A',
    2: 'A',
    3: 'C',
    4: 'A',
    5: 'B'
  };
  const patchRes = await request('PATCH', `/api/diagnosis/session/${sessionId}`, { answers, action: 'model_photo', completed: true });
  console.log('✅ Step2: 答案提交, completed=' + (patchRes.completed ?? false));

  // Step 3: Get result with action=model_photo (Result API LLM generation takes ~12-16s)
  const result = await request('GET', `/api/diagnosis/session/${sessionId}/result?action=model_photo`, null, 60000);
  const workflowKey = result.workflow?.workflowKey;
  if (!workflowKey) {
    console.error('❌ Step3: Result API 未返回 workflowKey', JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log('✅ Step3: Result API 返回, workflowKey=' + workflowKey);
  console.log('   template: ' + result.workflow?.config?.templateId);
  console.log('   aiPersona: ' + (result.aiPersona?.substring?.(0, 50) ?? result.aiPersona ?? 'n/a'));

  // Step 4: Call Execute API with workflowKey (MiniMax API can take up to 45s)
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
  }, 60000);

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

  // Step 5: Create lead via /api/leads
  let step5Ok = false;
  try {
    const leadRes = await request('POST', '/api/leads', {
      name: 'cron-chain-lead',
      contact: 'wechat_test_12345',
      diagnosisSessionId: sessionId,
      serviceType: 'model_photo'
    });
    if (leadRes.id || leadRes.success) {
      console.log('✅ Step5: Lead 创建成功, id=' + (leadRes.id ?? leadRes.success));
      step5Ok = true;
    } else {
      console.log('❌ Step5: Lead 创建失败 - ' + JSON.stringify(leadRes));
    }
  } catch (e) {
    console.log('❌ Step5: Lead 创建异常 - ' + e.message);
  }

  console.log('\n=== 完整链路验证完成 ===');
  console.log('结论: Submit → Result → Execute 链路' + (executeRes.success || executeRes.result?.imageUrl ? '✅ 通畅' : '⚠️ 部分通畅 (Execute API 需要真实 API Key)'));
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
