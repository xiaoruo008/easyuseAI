import { NextRequest, NextResponse } from "next/server";
import { getAllLeads, updateLead } from "@/lib/db";

const Q1_LABELS: Record<string, string> = {
  A: "写了没人看",
  B: "重复回答客户问题",
  C: "手动整理数据太费时间",
  D: "想引流获客但没有好内容",
};

const Q2_LABELS: Record<string, string> = {
  A: "不到1小时",
  B: "1~5小时",
  C: "5小时以上",
  D: "每天都在处理",
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;
  const q = searchParams.get("q") ?? undefined;

  const leads = await getAllLeads({ status, q });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enriched = leads.map((lead: any) => {
    const session = lead.session as { answers?: unknown; updatedAt?: unknown } | undefined;
    const answers = session?.answers as Record<string, string> | null;
    return {
      ...lead,
      painPoint: answers ? (Q1_LABELS[answers["1"] ?? "D"] ?? "未知") : null,
      timeSpent: answers ? (Q2_LABELS[answers["2"] ?? "A"] ?? "未知") : null,
      completedAt: session?.updatedAt ?? null,
    };
  });

  return NextResponse.json(enriched);
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...patch } = body;
    if (!id) return NextResponse.json({ error: "缺少 id" }, { status: 400 });
    const lead = await updateLead(id, patch);
    return NextResponse.json(lead);
  } catch {
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}
