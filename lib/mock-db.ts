// lib/mock-db.ts
// 客户数据层：Lead / Diagnosis / Task / Conversation
// 与 prisma/schema.prisma 保持对齐（未来连数据库时只需改连接字符串）

export type TaskStatus = "new" | "doing" | "done" | "failed";
export type DeliveryStatus = "generated" | "sent" | "confirmed" | "redo";
export type TaskType = "内容生成" | "图片生成" | "视频脚本" | "客服话术" | "数据处理" | "咨询规划";
export type ConversationRole = "user" | "ai" | "human";

// ─── 数据模型 ─────────────────────────────────────────────────

export interface Lead {
  id: string;
  name: string;
  contact: string;       // 手机号
  businessType: string | null; // 业务类型（对应 serviceType）
  note: string | null;
  status: "new" | "contacted" | "closed";
  diagnosisSessionId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Diagnosis {
  id: string;
  leadId: string;
  painPoint: string;     // 核心痛点（Q1答案中文）
  goal: string;          // 目标（Q4答案中文）
  currentMethod: string;  // 现有方法（Q3答案中文）
  budget: string;         // 预算（Q5答案中文）
  resultType: string;    // traffic / customer / efficiency / unclear
  sessionId: string;      // 对应 DiagnosisSession
  createdAt: Date;
}

export interface Task {
  id: string;
  leadId: string;
  taskType: TaskType;
  status: TaskStatus;
  deliveryStatus: DeliveryStatus;
  inputData: Record<string, unknown>;
  outputData: Record<string, unknown> | null;
  errorMessage: string | null;
  customerFeedback: string | null;
  isCaseCandidate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  leadId: string;
  message: string;
  role: ConversationRole;
  createdAt: Date;
}

// ─── 内存存储 ────────────────────────────────────────────────

const globalStore = globalThis as unknown as {
  __db:
    | {
        leads: Map<string, Lead>;
        diagnoses: Map<string, Diagnosis>;
        tasks: Map<string, Task>;
        conversations: Map<string, Conversation>;
        sessions: Map<string, unknown>;
        recommendations: Map<string, unknown>;
      }
    | undefined;
};

function store() {
  if (!globalStore.__db) {
    globalStore.__db = {
      leads: new Map(),
      diagnoses: new Map(),
      tasks: new Map(),
      conversations: new Map(),
      sessions: new Map(),
      recommendations: new Map(),
    };
  }
  return globalStore.__db;
}

function cuid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ─── DiagnosisSession（兼容层）──────────────────────────────

export interface MockDiagnosisSession {
  id: string;
  step: number;
  answers: Record<string, string>;
  completed: boolean;
  resultType: string | null;
  confidence: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export function createSession(): MockDiagnosisSession {
  const now = new Date();
  const s: MockDiagnosisSession = {
    id: cuid(), step: 1, answers: {}, completed: false,
    resultType: null, confidence: null, createdAt: now, updatedAt: now,
  };
  store().sessions.set(s.id, s);
  return s;
}

export function getSession(id: string): MockDiagnosisSession | null {
  return (store().sessions.get(id) as MockDiagnosisSession | undefined) ?? null;
}

export function updateSession(
  id: string,
  patch: Partial<Pick<MockDiagnosisSession, "step" | "answers" | "completed" | "resultType" | "confidence">>
): MockDiagnosisSession | null {
  const s = getSession(id);
  if (!s) return null;
  const updated = { ...s, ...patch, updatedAt: new Date() };
  store().sessions.set(id, updated);
  return updated;
}

export function getRecommendationBySession(sessionId: string): unknown | null {
  for (const r of store().recommendations.values()) {
    const rec = r as { sessionId?: string };
    if (rec.sessionId === sessionId) return r;
  }
  return null;
}

// ─── Lead ────────────────────────────────────────────────────

export function createLead(data: Omit<Lead, "id" | "createdAt" | "updatedAt">): Lead {
  const now = new Date();
  const l: Lead = { id: cuid(), ...data, createdAt: now, updatedAt: now };
  store().leads.set(l.id, l);
  return l;
}

export function getLead(id: string): Lead | null {
  return store().leads.get(id) ?? null;
}

export function getAllLeads(): Lead[] {
  return Array.from(store().leads.values()).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}

export function updateLead(id: string, patch: Partial<Lead>): Lead | null {
  const l = store().leads.get(id);
  if (!l) return null;
  const updated = { ...l, ...patch, updatedAt: new Date() };
  store().leads.set(id, updated);
  return updated;
}

// ─── Diagnosis ────────────────────────────────────────────────

export function createDiagnosis(
  data: Omit<Diagnosis, "id" | "createdAt">
): Diagnosis {
  const d: Diagnosis = { id: cuid(), ...data, createdAt: new Date() };
  store().diagnoses.set(d.id, d);
  return d;
}

export function getDiagnosisByLead(leadId: string): Diagnosis | null {
  for (const d of store().diagnoses.values()) {
    if (d.leadId === leadId) return d;
  }
  return null;
}

// ─── Task ───────────────────────────────────────────────────

export function createTask(data: Omit<Task, "id" | "createdAt" | "updatedAt">): Task {
  const now = new Date();
  const t: Task = {
    id: cuid(),
    ...data,
    deliveryStatus: data.deliveryStatus ?? "generated",
    errorMessage: data.errorMessage ?? null,
    customerFeedback: data.customerFeedback ?? null,
    isCaseCandidate: data.isCaseCandidate ?? false,
    createdAt: now,
    updatedAt: now,
  };
  store().tasks.set(t.id, t);
  return t;
}

export function updateTask(id: string, patch: Partial<Task>): Task | null {
  const t = store().tasks.get(id);
  if (!t) return null;
  const updated = { ...t, ...patch, updatedAt: new Date() };
  store().tasks.set(id, updated);
  return updated;
}

export function getTasksByLead(leadId: string): Task[] {
  return Array.from(store().tasks.values())
    .filter((t) => t.leadId === leadId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

// ─── Conversation ─────────────────────────────────────────────

export function createConversation(
  data: Omit<Conversation, "id" | "createdAt">
): Conversation {
  const c: Conversation = { id: cuid(), ...data, createdAt: new Date() };
  store().conversations.set(c.id, c);
  return c;
}

export function getConversationsByLead(leadId: string): Conversation[] {
  return Array.from(store().conversations.values())
    .filter((c) => c.leadId === leadId)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}
