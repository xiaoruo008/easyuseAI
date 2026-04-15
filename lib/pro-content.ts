// lib/pro-content.ts — /result/pro 页面的详细工作流数据
// Mock 数据，不接真实AI

import type { ResultType } from "./diagnosis";

interface ProWorkflow {
  steps: { step: number; title: string; desc: string; icon: string }[];
  sampleScripts: { title: string; content: string }[];
  headlines: string[];
  executionNotes: string[];
}

const PRO_CONTENT: Record<ResultType, ProWorkflow> = {
  image_poor: {
    steps: [
      { step: 1, title: "分析产品特征", desc: "了解你的产品定位、风格、目标用户", icon: "🔍" },
      { step: 2, title: "确定出图方案", desc: "根据你的平台和用途，选择最优的出图风格", icon: "🎯" },
      { step: 3, title: "AI工作流出图", desc: "我们用稳定的工作流跑图，不用你操心", icon: "⚡" },
      { step: 4, title: "筛选交付", desc: "多张里挑最好的一张给你，不满意重做", icon: "✅" },
    ],
    sampleScripts: [
      {
        title: "换背景效果",
        content: `原图背景杂乱 → AI换成纯白底\n适合：淘宝、京东、拼多多`,
      },
      {
        title: "模特上身效果",
        content: `上传服装平铺图 → 生成模特上身效果图\n适合：小红书种草、详情页`,
      },
    ],
    headlines: [
      "用了这个方法，我的图看起来像花了3000块请人拍的",
      "实拍太贵，AI帮我省了90%的作图成本",
    ],
    executionNotes: [
      "先从白底主图开始，效果最稳定",
      "服装类建议做模特上身图，转化率提升明显",
      "场景图适合小红书种草内容",
    ],
  },

  image_cost: {
    steps: [
      { step: 1, title: "评估产品", desc: "分析你的产品适合哪种出图方案", icon: "📋" },
      { step: 2, title: "制定出图计划", desc: "给你算一笔账，找到性价比最高的方案", icon: "💰" },
      { step: 3, title: "执行出图", desc: "稳定工作流执行，不是抽卡", icon: "🎯" },
      { step: 4, title: "交付成果", desc: "交付可用的电商主图，不满意重做", icon: "✅" },
    ],
    sampleScripts: [
      {
        title: "成本对比",
        content: `实拍：¥2000/次，平均出图10张 = ¥200/张
AI出图：¥99/5张，平均 = ¥20/张
节省 90% 成本`,
      },
    ],
    headlines: [
      "实拍一次的钱，够AI出100张图了",
      "AI出图比实拍便宜90%，但得用对方法",
    ],
    executionNotes: [
      "先出少量图测试效果，满意再批量",
      "AI图+实拍图结合使用效果最好",
      "测款阶段用AI，正式上新用实拍",
    ],
  },

  image_stability: {
    steps: [
      { step: 1, title: "诊断当前问题", desc: "分析你之前用AI出图哪里卡住了", icon: "🔍" },
      { step: 2, title: "搭建稳定工作流", desc: "用我们的内部工作流替代随机抽卡", icon: "⚙️" },
      { step: 3, title: "批量出图", desc: "一次性出多张，从中挑选可用结果", icon: "🎯" },
      { step: 4, title: "筛选交付", desc: "多张里挑最好的一张给你，不满意重做", icon: "✅" },
    ],
    sampleScripts: [
      {
        title: "稳定工作流出图示例",
        content: `白底主图 · 淘宝天猫标准
模特上身图 · 服装类适用
生活场景图 · 小红书种草
精修商品图 · 质感升级`,
      },
    ],
    headlines: [
      "不是AI不好用，是你缺一套稳定工作流",
      "别人用AI出图全靠运气，我们帮你把稳定性做到90%",
    ],
    executionNotes: [
      "用批量出图替代单次抽卡，成功率大幅提升",
      "建立你自己的常用风格模板，下次更快",
      "复杂图先出小图确认效果，满意再出大图",
    ],
  },

  image_start: {
    steps: [
      { step: 1, title: "上传产品图", desc: "随手一拍发给我们就行", icon: "📤" },
      { step: 2, title: "顾问确认需求", desc: "我们的人帮你确认想要的效果", icon: "💬" },
      { step: 3, title: "AI出图工作流", desc: "专业工作流执行，不需要你懂任何AI知识", icon: "🤖" },
      { step: 4, title: "48h内交付", desc: "收到确认后48小时内发给你", icon: "📦" },
    ],
    sampleScripts: [
      {
        title: "最简单的开始方式",
        content: `Step 1: 上传你的产品图
Step 2: 告诉我们你想要什么效果
剩下的我们来搞，48h内发给你`,
      },
    ],
    headlines: [
      "不需要懂AI，不需要学提示词，上传就能出图",
      "把你的产品图发过来，坐等收图就行",
    ],
    executionNotes: [
      "第一次建议做白底主图或换背景，效果最明显",
      "告诉顾问你的目标平台（淘宝/小红书/抖音），我们帮你选风格",
      "收到图如果不满意，顾问帮你重做",
    ],
  },
};

export default function getProContent(type: ResultType): ProWorkflow {
  return PRO_CONTENT[type] ?? PRO_CONTENT["image_start"];
}
