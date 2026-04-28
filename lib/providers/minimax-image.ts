/**
 * MiniMax Image Provider — P1 紧急禁用
 *
 * 此文件已禁用所有 MiniMax 图像生成调用。
 * 商品一致性无法保证，货不对版问题必须彻底解决。
 *
 * 当前使用的生成链路：
 * - removebg_composite：原图 → remove.bg 抠图 → fal.ai 生成背景 → Canvas 合成
 *
 * 如需重新启用 MiniMax，请先确认商品一致性保护机制已就绪。
 */

import type { ImageProvider } from "../image/provider";
import type { ImageTaskInput, ImageTaskOutput } from "../image/types";

export class MiniMaxImageProvider implements ImageProvider {
  name = "minimax";

  async generate(_input: ImageTaskInput): Promise<ImageTaskOutput> {
    // P1紧急禁用：MiniMax无法保证商品一致性，货不对版
    throw new Error(
      "[MiniMax] MiniMax图像生成已紧急禁用。请使用 removebg_composite 链路（抠图+Canvas合成）以保证商品100%保留。"
    );
  }
}
