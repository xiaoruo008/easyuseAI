import { NextRequest, NextResponse } from "next/server";
import { getTask, updateTask } from "@/lib/db";
import { generateImage } from "@/lib/image";
import type { ImageTaskInput } from "@/lib/image";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const task = await getTask(id);
  if (!task) return NextResponse.json({ error: "任务不存在" }, { status: 404 });
  return NextResponse.json(task);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "无效请求" }, { status: 400 });

  const { deliveryStatus, retry, customerFeedback, isCaseCandidate } = body as {
    deliveryStatus?: string;
    retry?: boolean;
    customerFeedback?: string | null;
    isCaseCandidate?: boolean;
  };

  // ── 重试逻辑 ───────────────────────────────────────────
  if (retry === true) {
    const task = await getTask(id);
    if (!task) return NextResponse.json({ error: "任务不存在" }, { status: 404 });

    const inputData = task.inputData as Record<string, unknown>;
    const actionId = inputData.action as string;
    const isImageTask = ["product_photo", "model_photo", "background_swap"].includes(actionId);

    if (isImageTask) {
      const imageInput: ImageTaskInput = {
        type: inputData.type as ImageTaskInput["type"],
        prompt: (inputData.prompt as string) ?? "",
        referenceImageUrl: inputData.referenceImageUrl as string | undefined,
        style: (inputData.style as ImageTaskInput["style"]) ?? "commercial",
        aspectRatio: (inputData.aspectRatio as ImageTaskInput["aspectRatio"]) ?? "1:1",
      };

      // 更新状态为 doing
      await updateTask(id, { status: "doing", errorMessage: null });

      let output;
      try {
        output = await generateImage(imageInput);
        await updateTask(id, {
          status: "done",
          outputData: {
            imageUrl: output.imageUrl,
            thumbnailUrl: output.thumbnailUrl,
            provider: output.provider,
            model: output.model,
            generatedAt: output.generatedAt,
          },
          errorMessage: null,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "重试失败";
        await updateTask(id, {
          status: "failed",
          outputData: null,
          errorMessage: msg,
        });
        return NextResponse.json({ success: false, error: msg }, { status: 200 });
      }

      const updated = await getTask(id);
      return NextResponse.json({ success: true, task: updated });
    }

    return NextResponse.json({ error: "暂仅支持图片任务重试" }, { status: 400 });
  }

  // ── 更新交付状态 ─────────────────────────────────────
  if (deliveryStatus) {
    const task = await updateTask(id, { deliveryStatus });
    return NextResponse.json({ success: true, task });
  }

  // ── 更新客户反馈 / 案例标记 ─────────────────────────
  const patch: Record<string, unknown> = {};
  if (customerFeedback !== undefined) patch.customerFeedback = customerFeedback;
  if (isCaseCandidate !== undefined) patch.isCaseCandidate = isCaseCandidate;
  if (Object.keys(patch).length > 0) {
    const task = await updateTask(id, patch as Parameters<typeof updateTask>[1]);
    return NextResponse.json({ success: true, task });
  }

  return NextResponse.json({ error: "未指定操作" }, { status: 400 });
}
