-- easyuse.ai 初始迁移
-- 目标：Supabase / Neon PostgreSQL
-- 执行方式：psql $DATABASE_URL -f migration.sql
-- 或：pnpm exec prisma migrate deploy

-- LeadStatus enum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'CLOSED');

-- TaskStatus enum
CREATE TYPE "TaskStatus" AS ENUM ('NEW', 'DOING', 'DONE');

-- ConversationRole enum
CREATE TYPE "ConversationRole" AS ENUM ('user', 'ai', 'human');

-- 诊断会话
CREATE TABLE "DiagnosisSession" (
    "id" TEXT NOT NULL,
    "step" INTEGER NOT NULL DEFAULT 1,
    "answers" JSONB NOT NULL DEFAULT '{}',
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "resultType" TEXT,
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DiagnosisSession_pkey" PRIMARY KEY ("id")
);

-- 客户线索
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "businessType" TEXT,
    "note" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "diagnosisSessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- 诊断存档（submit 时写入）
CREATE TABLE "Diagnosis" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "painPoint" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "currentMethod" TEXT NOT NULL,
    "budget" TEXT NOT NULL,
    "resultType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Diagnosis_pkey" PRIMARY KEY ("id")
);

-- 执行任务
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "taskType" TEXT NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'NEW',
    "inputData" JSONB NOT NULL DEFAULT '{}',
    "outputData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- 对话存档（预留）
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "role" "ConversationRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- 外键 & 索引
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_diagnosisSessionId_fkey"
    FOREIGN KEY ("diagnosisSessionId") REFERENCES "DiagnosisSession"("id") ON DELETE SET NULL;

ALTER TABLE "Diagnosis" ADD CONSTRAINT "Diagnosis_leadId_fkey"
    FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT;

ALTER TABLE "Diagnosis" ADD CONSTRAINT "Diagnosis_sessionId_fkey"
    FOREIGN KEY ("sessionId") REFERENCES "DiagnosisSession"("id") ON DELETE RESTRICT;

ALTER TABLE "Task" ADD CONSTRAINT "Task_leadId_fkey"
    FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT;

ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_leadId_fkey"
    FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT;

CREATE INDEX "Lead_diagnosisSessionId_idx" ON "Lead"("diagnosisSessionId");
CREATE INDEX "Lead_contact_idx" ON "Lead"("contact");
CREATE INDEX "Diagnosis_leadId_idx" ON "Diagnosis"("leadId");
CREATE INDEX "Diagnosis_sessionId_idx" ON "Diagnosis"("sessionId");
CREATE INDEX "Task_leadId_idx" ON "Task"("leadId");
CREATE INDEX "Conversation_leadId_idx" ON "Conversation"("leadId");
