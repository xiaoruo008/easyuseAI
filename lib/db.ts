// lib/db.ts — 统一数据访问层
// USE_MOCK=true/unset → 内存 mock（默认，兼顾本地和未配置数据库的生产环境）
// USE_MOCK=false → Prisma + PostgreSQL（需要自行配置数据库连接）
//
// 所有 API route 只 import 这个文件，不直接 import prisma 或 mock-db

import { prisma } from "./prisma";
import * as mock from "./mock-db";

// 默认使用 mock，确保生产环境（无数据库配置时）不崩溃
const USE_MOCK = process.env.USE_MOCK !== "false";

// ─── DiagnosisSession ─────────────────────────────────────────

export async function createSession() {
  if (USE_MOCK) return mock.createSession();
  return prisma.diagnosisSession.create({
    data: { step: 1, answers: {}, completed: false },
  });
}

export async function getSession(id: string): Promise<{
  id: string;
  step: number;
  answers: import("@prisma/client/runtime/library").JsonValue;
  completed: boolean;
  resultType: string | null;
  confidence: number | null;
  createdAt: Date;
  updatedAt: Date;
  contact?: string | null;
} | null> {
  if (USE_MOCK) return mock.getSession(id);
  return prisma.diagnosisSession.findUnique({ where: { id } });
}

export async function updateSession(
  id: string,
  data: {
    step?: number;
    answers?: Record<string, string>;
    completed?: boolean;
    resultType?: string;
    confidence?: number;
  }
) {
  if (USE_MOCK) return mock.updateSession(id, data);

  const patch: Record<string, unknown> = {};
  if (data.step !== undefined) patch.step = data.step;
  if (data.answers !== undefined) patch.answers = data.answers;
  if (data.completed !== undefined) patch.completed = data.completed;
  if (data.resultType !== undefined) patch.resultType = data.resultType;
  if (data.confidence !== undefined) patch.confidence = data.confidence;

  return prisma.diagnosisSession.update({ where: { id }, data: patch });
}

// ─── Lead ─────────────────────────────────────────────────────

export async function createLead(data: {
  name: string;
  contact: string;
  company?: string | null;
  businessType?: string | null;
  serviceType?: string | null;
  note?: string | null;
  diagnosisSessionId?: string | null;
}) {
  if (USE_MOCK) {
    return mock.createLead({
      name: data.name,
      contact: data.contact,
      company: data.company ?? null,
      serviceType: data.serviceType ?? null,
      businessType: data.businessType ?? null,
      note: data.note ?? null,
      status: "new",
      diagnosisSessionId: data.diagnosisSessionId ?? null,
    });
  }
  return prisma.lead.create({
    data: {
      name: data.name,
      contact: data.contact,
      businessType: data.businessType ?? null,
      note: data.note ?? null,
      status: "NEW",
      diagnosisSessionId: data.diagnosisSessionId ?? null,
    },
  });
}

export async function getLead(id: string) {
  if (USE_MOCK) return mock.getLead(id);
  return prisma.lead.findUnique({
    where: { id },
    include: { conversations: { orderBy: { createdAt: "asc" } } },
  });
}

export async function getAllLeads(filter?: { status?: string; q?: string }) {
  if (USE_MOCK) {
    let leads = mock.getAllLeads();
    if (filter?.status && filter.status !== "ALL") {
      leads = leads.filter((l) => l.status === filter.status);
    }
    if (filter?.q) {
      const q = filter.q.toLowerCase();
      leads = leads.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.contact.includes(q) ||
          (l.businessType ?? "").toLowerCase().includes(q)
      );
    }
    return leads;
  }

  const where: Record<string, unknown> = {};
  if (filter?.status && filter.status !== "ALL") where.status = filter.status;
  if (filter?.q) {
    where.OR = [
      { name: { contains: filter.q, mode: "insensitive" } },
      { contact: { contains: filter.q } },
      { company: { contains: filter.q, mode: "insensitive" } },
      { businessType: { contains: filter.q, mode: "insensitive" } },
    ];
  }
  return prisma.lead.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { session: { select: { answers: true, updatedAt: true } } },
  });
}

export async function updateLead(id: string, data: Record<string, unknown>) {
  if (USE_MOCK) return mock.updateLead(id, data as Partial<mock.Lead>);
  const patch: Record<string, unknown> = {};
  for (const key of ["name", "contact", "company", "businessType", "serviceType", "note", "status"]) {
    if (data[key] !== undefined) patch[key] = data[key];
  }
  return prisma.lead.update({ where: { id }, data: patch });
}

// ─── Task ─────────────────────────────────────────────────────

export async function createTask(data: {
  leadId: string;
  taskType: string;
  status: string;
  deliveryStatus?: string;
  inputData: Record<string, unknown>;
  outputData: Record<string, unknown> | null;
  // 服装视觉扩展字段（可选）
  market?: string;
  gender?: string;
  category?: string;
  targetImage?: string;
  referenceQuality?: string;
  templateKey?: string;
  promptVersion?: number;
  moderationRiskLevel?: string;
  retryStrategy?: string;
}) {
  if (USE_MOCK) {
    return mock.createTask({
      leadId: data.leadId,
      taskType: data.taskType as mock.TaskType,
      status: data.status as mock.TaskStatus,
      deliveryStatus: (data.deliveryStatus as mock.DeliveryStatus) ?? "generated",
      inputData: data.inputData,
      outputData: data.outputData,
      errorMessage: null,
      customerFeedback: null,
      isCaseCandidate: false,
    });
  }
  return prisma.task.create({
    data: {
      leadId: data.leadId,
      taskType: data.taskType,
      status: data.status === "done" ? "DONE" : data.status === "doing" ? "DOING" : data.status === "failed" ? "FAILED" : "NEW",
      deliveryStatus: (data.deliveryStatus?.toUpperCase().replace(" ", "_") as "GENERATED" | "SENT" | "CONFIRMED" | "REDO") ?? "GENERATED",
      inputData: {
        ...data.inputData,
        // 服装视觉扩展字段存入 inputData（Prisma Task schema 只有这些核心字段）
        market: data.market,
        gender: data.gender,
        category: data.category,
        targetImage: data.targetImage,
        referenceQuality: data.referenceQuality,
        templateKey: data.templateKey,
        promptVersion: data.promptVersion ?? 1,
        moderationRiskLevel: data.moderationRiskLevel,
        retryStrategy: data.retryStrategy,
      } as unknown as undefined,
      outputData: data.outputData as unknown as undefined,
    },
  });
}

export async function getTasksByLead(leadId: string) {
  if (USE_MOCK) return mock.getTasksByLead(leadId);
  return prisma.task.findMany({
    where: { leadId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTask(id: string) {
  if (USE_MOCK) {
    const tasks = mock.getTasksByLead("");
    return tasks.find((t) => t.id === id) ?? null;
  }
  return prisma.task.findUnique({ where: { id } });
}

export async function updateTask(
  id: string,
  data: {
    status?: string;
    deliveryStatus?: string;
    outputData?: Record<string, unknown> | null;
    errorMessage?: string | null;
    customerFeedback?: string | null;
    isCaseCandidate?: boolean;
    // 服装视觉扩展字段
    templateKey?: string;
    promptVersion?: number;
    moderationRiskLevel?: string;
    retryStrategy?: string;
  }
) {
  if (USE_MOCK) {
    const task = (await getTask(id)) as mock.Task | null;
    if (!task) throw new Error("Task not found");
    if (data.status !== undefined) (task as mock.Task).status = data.status as mock.TaskStatus;
    if (data.deliveryStatus !== undefined) (task as mock.Task).deliveryStatus = data.deliveryStatus as mock.DeliveryStatus;
    if (data.outputData !== undefined) (task as mock.Task).outputData = data.outputData as mock.Task["outputData"];
    if (data.errorMessage !== undefined) (task as mock.Task).errorMessage = data.errorMessage ?? null;
    if (data.customerFeedback !== undefined) (task as mock.Task).customerFeedback = data.customerFeedback ?? null;
    if (data.isCaseCandidate !== undefined) (task as mock.Task).isCaseCandidate = data.isCaseCandidate;
    return task;
  }
  const patch: Record<string, unknown> = {};
  if (data.status !== undefined) {
    patch.status =
      data.status === "done" ? "DONE" : data.status === "doing" ? "DOING" : data.status === "failed" ? "FAILED" : "NEW";
  }
  if (data.deliveryStatus !== undefined) {
    patch.deliveryStatus = data.deliveryStatus.toUpperCase().replace(" ", "_") as "GENERATED" | "SENT" | "CONFIRMED" | "REDO";
  }
  if (data.outputData !== undefined) patch.outputData = data.outputData as unknown as undefined;
  if (data.errorMessage !== undefined) patch.errorMessage = data.errorMessage;
  if (data.customerFeedback !== undefined) patch.customerFeedback = data.customerFeedback;
  if (data.isCaseCandidate !== undefined) patch.isCaseCandidate = data.isCaseCandidate;
  if (data.templateKey !== undefined) patch.templateKey = data.templateKey;
  if (data.promptVersion !== undefined) patch.promptVersion = data.promptVersion;
  if (data.moderationRiskLevel !== undefined) patch.moderationRiskLevel = data.moderationRiskLevel;
  if (data.retryStrategy !== undefined) patch.retryStrategy = data.retryStrategy;
  return prisma.task.update({ where: { id }, data: patch });
}

export async function getOrCreateLeadForSession(sessionId: string) {
  if (USE_MOCK) {
    const leads = mock.getAllLeads();
    return leads.find((l) => l.diagnosisSessionId === sessionId) ?? null;
  }
  return prisma.lead.findFirst({ where: { diagnosisSessionId: sessionId } });
}

// ─── Conversation ─────────────────────────────────────────────

export async function createConversation(data: {
  leadId: string;
  message: string;
  role: "user" | "ai" | "human";
}) {
  if (USE_MOCK) return mock.createConversation(data);
  return prisma.conversation.create({ data });
}

export async function getConversationsByLead(leadId: string) {
  if (USE_MOCK) return mock.getConversationsByLead(leadId);
  return prisma.conversation.findMany({
    where: { leadId },
    orderBy: { createdAt: "asc" },
  });
}
