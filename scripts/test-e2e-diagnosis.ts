/**
 * 最小E2E测试：五道题 → Result → 工作流路由
 * 验证完整链路是否通畅
 */
import { deriveFashionFieldsFromDiagnosis } from "@/lib/diagnosis-workflow-map";
import { resolveWorkflow } from "@/lib/workflow";
import { routeFromAction } from "@/lib/types/fashion";

console.log("=== 五道题E2E链路测试 ===\n");

// 模拟五道题提交后 Result API 的处理
const resultTypes = ["traffic", "customer", "efficiency", "unclear"] as const;

let allPassed = true;

for (const resultType of resultTypes) {
  console.log(`\n--- 诊断类型: ${resultType} ---`);
  
  // Step 1: Result API 调用 deriveFashionFieldsFromDiagnosis
  const derived = deriveFashionFieldsFromDiagnosis(resultType, "");
  console.log(`deriveFashionFieldsFromDiagnosis(${resultType}, ""):`);
  console.log(`  → market=${derived.market}, gender=${derived.gender}, category=${derived.category}, targetImage=${derived.targetImage}`);
  
  // Step 2: Result API 调用 resolveWorkflow
  const fields = { ...derived, contact: "" };
  const workflow = resolveWorkflow(fields);
  console.log(`resolveWorkflow(fields):`);
  console.log(`  → workflowKey="${workflow.workflowKey}"`);
  console.log(`  → matched=${workflow.matched}`);
  
  if (!workflow.matched) {
    console.error(`  ❌ FAIL: workflow key not in WORKFLOW_MAP`);
    allPassed = false;
  } else {
    console.log(`  ✅ PASS`);
  }
}

// 模拟 Execute API 的处理
console.log("\n\n--- Execute API 路由测试 ---");
const actions = ["product_photo", "model_photo", "background_swap", "lifestyle", "fashion_model"];

for (const action of actions) {
  const derived = deriveFashionFieldsFromDiagnosis("traffic", action);
  const route = routeFromAction(action, derived.category);
  
  if (!route) {
    console.error(`❌ ${action}: route=null (category=${derived.category})`);
    allPassed = false;
  } else {
    console.log(`✅ ${action}: templateId="${route.templateId}", key="${route.key}"`);
  }
}

console.log("\n=== 测试结果 ===");
if (allPassed) {
  console.log("✅ 所有链路测试通过");
  process.exit(0);
} else {
  console.log("❌ 存在失败项");
  process.exit(1);
}
