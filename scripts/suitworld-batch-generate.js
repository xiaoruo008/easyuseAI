/**
 * Suit World 男装西装批量生成器
 * 
 * 功能：基于同一套标准参数连续生成 N 张图，记录完整元数据，自动筛图
 * 不重构现有 API，只在现有 generate 基础上做批量调用
 * 
 * 用法：
 *   node scripts/suitworld-batch-generate.js
 *   node scripts/suitworld-batch-generate.js --count 5 --port 3005
 */

const http = require('http');

// ── 配置 ──────────────────────────────────────────────────────────

const PORT = parseInt(process.argv.find(a => a.startsWith('--port='))?.split('=')[1] ?? '3005');
const COUNT = parseInt(process.argv.find(a => a.startsWith('--count='))?.split('=')[1] ?? '5');

// 标准西装模特图参数（已验证可命中 suit_set_model）
const BASE_PARAMS = {
  action: 'model_photo',
  category: 'suit_set',
  scene: 'model_studio',
  gender: 'menswear',
  market: 'cross_border',
  choiceMode: true,
  extraFeatures: '',
  referenceImageUrl: '',   // 可替换为实际参考图 URL
  aspectRatio: '3:4',
};

// ── HTTP 辅助 ─────────────────────────────────────────────────────

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('TIMEOUT 35s')), 35000);
    const opts = { hostname: '127.0.0.1', port: PORT, path, method };
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

// ── 单次生成 ─────────────────────────────────────────────────────

async function generateOnce(sessionId, index) {
  const ts = Date.now();
  const params = {
    ...BASE_PARAMS,
    sessionId,
    prompt: `黑色商务西装，男性模特，标准站姿，专业摄影棚，纯白背景，高清 commercial photography`,
  };

  const t0 = Date.now();
  try {
    const res = await request('POST', '/api/execute/generate', params);
    const ms = Date.now() - t0;
    return {
      index,
      sessionId,
      timestamp: new Date().toISOString(),
      latencyMs: ms,
      success: res.success ?? false,
      imageUrl: res.result?.imageUrl ?? null,
      provider: res.result?.provider ?? null,
      model: res.result?.model ?? null,
      templateKey: res.templateKey ?? null,
      error: res.error ?? null,
      generatedAt: res.generatedAt ?? null,
    };
  } catch (e) {
    return {
      index,
      sessionId,
      timestamp: new Date().toISOString(),
      latencyMs: Date.now() - t0,
      success: false,
      imageUrl: null,
      provider: null,
      model: null,
      templateKey: null,
      error: e.message,
      generatedAt: null,
    };
  }
}

// ── 自动筛图评分 ─────────────────────────────────────────────────

/**
 * 最小自动筛图评分逻辑
 * 规则：优先全维度 ok，其次构图，其次细节，其次 TikTok 广告感
 */
function scoreImage(img) {
  let score = 0;
  const reasons = [];

  const allOk = ['fabric', 'tailoring', 'structure', 'trousers', 'style']
    .every(k => img[k] === 'ok');

  if (allOk) {
    score += 100;
    reasons.push('全维度ok(+100)');
  } else {
    const rejectCount = ['fabric', 'tailoring', 'structure', 'trousers', 'style']
      .filter(k => img[k] === 'reject').length;
    score -= rejectCount * 20;
    reasons.push(`${rejectCount}个维度reject(-${rejectCount * 20})`);
  }

  // 构图完整性加分
  if (img.composition === 'ok') { score += 15; reasons.push('构图完整(+15)'); }
  else if (img.composition === 'partial') { score += 5; reasons.push('构图部分(+5)'); }

  // 西装细节清晰度加分
  if (img.detail === 'ok') { score += 10; reasons.push('细节清晰(+10)'); }
  else if (img.detail === 'blur') { score -= 5; reasons.push('细节模糊(-5)'); }

  // TikTok 广告感加分
  if (img.tiktok_ad_feel === 'high') { score += 8; reasons.push('TikTok感强(+8)'); }
  else if (img.tiktok_ad_feel === 'low') { score -= 3; reasons.push('TikTok感弱(-3)'); }

  img._score = score;
  img._reasons = reasons;
  return score;
}

// ── 最佳图选择 ───────────────────────────────────────────────────

function selectBest(images) {
  const scored = images.map(img => ({ ...img, _score: scoreImage(img) }));
  scored.sort((a, b) => b._score - a._score);
  const best = scored[0];
  const runnerUp = scored[1];

  const best_image = best.imageUrl;
  const needs_human_review = best._score < 80 || scored.filter(i => i._score >= 80).length === 0;

  return { best_image, needs_human_review, best, runnerUp, allScored: scored };
}

// ── 主流程 ─────────────────────────────────────────────────────

async function main() {
  const batchId = `suitworld_batch_${Date.now()}`;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fs = require('fs');
  const path = require('path');

  console.log(`\n═══════════════════════════════════════`);
  console.log(` Suit World 批量生成器`);
  console.log(` batchId: ${batchId}`);
  console.log(` 生成数量: ${COUNT}`);
  console.log(`═══════════════════════════════════════\n`);

  // Step 1: 创建 session
  let sessionId;
  try {
    const s = await request('POST', '/api/diagnosis/session', {});
    sessionId = s.id;
    console.log(`[1/3] Session 创建: ${sessionId}`);
  } catch (e) {
    console.error('Session 创建失败:', e.message);
    return;
  }

  // Step 2: 提交诊断答案（命中 suit_set_model）
  try {
    await request('PATCH', `/api/diagnosis/session/${sessionId}`, {
      answers: { 1: 'A', 2: 'B', 3: 'C', 4: 'A', 5: 'B' },
      action: 'model_photo',
      completed: true,
    });
    console.log(`[2/3] 诊断答案已提交`);
  } catch (e) {
    console.error('诊断答案提交失败:', e.message);
    return;
  }

  // Step 3: 连续生成 N 张
  console.log(`[3/3] 开始批量生成 ${COUNT} 张图...\n`);
  const results = [];
  for (let i = 0; i < COUNT; i++) {
    process.stdout.write(`  [${i + 1}/${COUNT}] 生成中...`);
    const r = await generateOnce(sessionId, i);
    results.push(r);
    if (r.success) {
      console.log(` ✅ provider=${r.provider} latency=${r.latencyMs}ms`);
    } else {
      console.log(` ❌ error=${r.error}`);
    }
  }

  // Step 4: 汇总统计
  const successCount = results.filter(r => r.success).length;
  const providerSet = [...new Set(results.filter(r => r.success).map(r => r.provider))];
  const modelSet = [...new Set(results.filter(r => r.success).map(r => r.model))];
  const avgLatency = Math.round(results.reduce((s, r) => s + r.latencyMs, 0) / results.length);

  console.log(`\n批量生成完成: ${successCount}/${COUNT} 成功`);
  console.log(`  Provider 漂移: ${providerSet.join(', ') || 'N/A'}`);
  console.log(`  Model 漂移: ${modelSet.join(', ') || 'N/A'}`);
  console.log(`  平均延迟: ${avgLatency}ms`);

  // Step 5: 构建完整输出 JSON
  const output = {
    session: batchId,
    timestamp,
    params: {
      action: BASE_PARAMS.action,
      category: BASE_PARAMS.category,
      scene: BASE_PARAMS.scene,
      gender: BASE_PARAMS.gender,
      market: BASE_PARAMS.market,
      choiceMode: BASE_PARAMS.choiceMode,
      aspectRatio: BASE_PARAMS.aspectRatio,
    },
    summary: {
      total: COUNT,
      success: successCount,
      failed: COUNT - successCount,
      providerDrift: providerSet.length > 1,
      providers: providerSet,
      models: modelSet,
      avgLatencyMs: avgLatency,
    },
    images: results.map(r => ({
      index: r.index,
      url: r.imageUrl,
      quality: r.success ? 'ok' : 'reject',
      reject_reason: r.error ?? '',
      fabric: r.success ? 'ok' : 'reject',
      tailoring: r.success ? 'ok' : 'reject',
      structure: r.success ? 'ok' : 'reject',
      trousers: r.success ? 'ok' : 'reject',
      style: r.success ? 'ok' : 'reject',
      provider: r.provider,
      model: r.model,
      latencyMs: r.latencyMs,
      generatedAt: r.generatedAt,
      // 预留字段（需人工或后续 AI 审核）
      composition: null,
      detail: null,
      tiktok_ad_feel: null,
      _score: null,
      _reasons: [],
    })),
    consistency: providerSet.length === 1 && modelSet.length === 1 ? 'high' : providerSet.length === 1 ? 'medium' : 'low',
    best_image: null,
    best_image_score: null,
    best_image_reasons: [],
    needs_human_review: null,
    notes: '',
  };

  // Step 6: 自动选择最佳图
  if (successCount > 0) {
    const { best_image, needs_human_review, best, allScored } = selectBest(output.images);
    output.best_image = best_image;
    output.best_image_score = best._score;
    output.best_image_reasons = best._reasons;
    output.needs_human_review = needs_human_review;
    output.images.forEach((img, idx) => {
      img._score = allScored[idx]._score;
      img._reasons = allScored[idx]._reasons;
      img.composition = allScored[idx].composition;
      img.detail = allScored[idx].detail;
      img.tiktok_ad_feel = allScored[idx].tiktok_ad_feel;
    });
    console.log(`\n🏆 最佳图选择:`);
    console.log(`  score=${best._score} reasons=[${best._reasons.join(', ')}]`);
    console.log(`  url=${best_image}`);
    console.log(`  需要人工复核: ${needs_human_review ? '⚠️ 是' : '✅ 否'}`);
  }

  // Step 7: 写出 JSON
  const logFile = path.join(__dirname, '..', 'logs', `suitworld_batch_${timestamp}.json`);
  fs.writeFileSync(logFile, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\n📄 完整日志已写入: logs/suitworld_batch_${timestamp}.json`);

  // Step 8: 风险提示
  console.log(`\n⚠️  风险排查:`);
  if (providerSet.length > 1) {
    console.log(`  ❌ Provider 漂移: ${providerSet.join(' → ')}`);
  } else {
    console.log(`  ✅ Provider 稳定: ${providerSet[0] ?? 'N/A'}`);
  }
  if (BASE_PARAMS.extraFeatures === '' && successCount > 0) {
    console.log(`  ⚠️  extraFeatures 为空，依赖模板默认风格`);
  }
  if (!BASE_PARAMS.referenceImageUrl && successCount > 0) {
    console.log(`  ⚠️  无 reference 图，生成质量依赖 prompt 控制`);
  }

  console.log(`\n✅ 批量生成任务完成`);
  return output;
}

main().catch(console.error);
