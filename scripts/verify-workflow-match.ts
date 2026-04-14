/**
 * 轻量测试脚本：验证工作流匹配是否返回 matched=true
 * 
 * 运行：npx tsx scripts/verify-workflow-match.ts
 */

import { deriveFashionFieldsFromDiagnosis } from "@/lib/diagnosis-workflow-map";
import { resolveWorkflow } from "@/lib/workflow";

const resultTypes = ["traffic", "customer", "efficiency", "unclear"] as const;

console.log("=== 工作流匹配验证 ===\n");

let allMatched = true;

for (const resultType of resultTypes) {
  const fields = deriveFashionFieldsFromDiagnosis(resultType, "");
  const workflow = resolveWorkflow(fields);

  const status = workflow.matched ? "✅" : "❌";
  console.log(`${status} ${resultType}`);
  console.log(`   fields: ${fields.market}_${fields.gender}_${fields.category}_${fields.targetImage}`);
  console.log(`   workflowKey: ${workflow.workflowKey}`);
  console.log(`   matched: ${workflow.matched}`);
  if (workflow.config) {
    console.log(`   label: ${workflow.config.label}`);
  } else {
    console.log(`   config: null ❌ 未找到工作流配置`);
    allMatched = false;
  }
  console.log();
}

if (allMatched) {
  console.log("✅ 所有工作流均匹配成功！");
  process.exit(0);
} else {
  console.log("❌ 存在未匹配的工作流！");
  process.exit(1);
}
