/**
 * 简单脚本：生成一张 MiniMax 图片并下载保存
 */
import { MiniMaxCNProvider } from "../lib/image/providers/minimax-cn";

async function main() {
  const provider = new MiniMaxCNProvider();
  
  const prompt = "A beautiful fashion model wearing elegant summer dress, professional photography, soft natural lighting, high-end boutique setting";
  
  console.log("🎨 正在生成图片...");
  console.log("Prompt:", prompt);
  
  const result = await provider.generate({
    prompt,
    type: "model_photo",
    style: "luxury",
    aspectRatio: "3:4",
  });
  
  console.log("✅ 图片生成成功！");
  console.log("完整结果:", JSON.stringify(result, null, 2));
  
  // 下载图片
  const imageUrl = result.imageUrl;
  if (imageUrl) {
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    const outputPath = "/tmp/minimax-fashion-test.png";
    require("fs").writeFileSync(outputPath, Buffer.from(buffer));
    console.log("📁 图片已保存到:", outputPath);
  }
}

main().catch(console.error);
