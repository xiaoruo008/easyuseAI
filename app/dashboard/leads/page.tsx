"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

function CaseFeedbackButton({
  taskId,
  currentFeedback,
  onUpdate,
}: {
  taskId: string;
  currentFeedback: string | null;
  onUpdate: (feedback: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(currentFeedback ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!value.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerFeedback: value.trim() }),
      });
      if (res.ok) {
        onUpdate(value.trim());
        setOpen(false);
      }
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => { setValue(currentFeedback ?? ""); setOpen(true); }}
        className="text-xs px-2 py-1 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
      >
        记反馈
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && save()}
        placeholder="客户怎么说..."
        className="text-xs border border-gray-200 rounded-lg px-2 py-1 w-32 focus:outline-none focus:ring-1 focus:ring-gray-900"
      />
      <button
        onClick={save}
        disabled={saving || !value.trim()}
        className="text-xs px-2 py-1 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
      >
        {saving ? "..." : "存"}
      </button>
      <button
        onClick={() => setOpen(false)}
        className="text-xs px-1 py-1 text-gray-400 hover:text-gray-600 transition-colors"
      >
        ✕
      </button>
    </div>
  );
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  NEW: { label: "新线索", color: "bg-blue-100 text-blue-700" },
  CONTACTED: { label: "已联系", color: "bg-yellow-100 text-yellow-700" },
  CLOSED: { label: "已关闭", color: "bg-gray-100 text-gray-500" },
};

const TYPE_LABELS: Record<string, string> = {
  traffic: "流量获客",
  customer: "客服自动化",
  efficiency: "效率提升",
  unclear: "需求待挖掘",
};


const TASK_TYPE_LABELS: Record<string, string> = {
  "内容生成": "内容生成",
  "图片生成": "图片生成",
  "视频脚本": "视频脚本",
  "客服话术": "客服话术",
  "数据处理": "数据处理",
  "咨询规划": "咨询规划",
};

interface EnrichedLead {
  id: string;
  name: string;
  phone: string;
  company: string | null;
  serviceType: string | null;
  note: string | null;
  status: "NEW" | "CONTACTED" | "CLOSED";
  diagnosisSessionId: string | null;
  createdAt: string;
  updatedAt: string;
  painPoint: string | null;
  timeSpent: string | null;
  completedAt: string | null;
}

interface Task {
  id: string;
  leadId: string;
  taskType: string;
  status: string;
  deliveryStatus: string;
  inputData: Record<string, unknown>;
  outputData: Record<string, unknown> | null;
  errorMessage: string | null;
  customerFeedback: string | null;
  isCaseCandidate: boolean;
  createdAt: string;
  updatedAt: string;
}

const IMAGE_ACTIONS = new Set(["product_photo", "model_photo", "background_swap"]);

export default function DashboardLeadsPage() {
  const [leads, setLeads] = useState<EnrichedLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState<EnrichedLead | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (search) params.set("q", search);
      const res = await fetch(`/api/dashboard/leads?${params}`);
      if (!res.ok) throw new Error("获取线索失败");
      setLeads(await res.json());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const fetchTasks = useCallback(async (leadId: string) => {
    setTasksLoading(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/tasks`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTasks(data.tasks ?? []);
    } catch {
      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  }, []);

  const openLead = (lead: EnrichedLead) => {
    setSelectedLead(lead);
    fetchTasks(lead.id);
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdating(true);
    try {
      const res = await fetch("/api/dashboard/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("更新失败");
      await fetchLeads();
      if (selectedLead?.id === id) {
        setSelectedLead((prev) =>
          prev ? ({ ...prev, status: status as EnrichedLead["status"] }) : null
        );
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "更新失败");
    } finally {
      setUpdating(false);
    }
  };

  const retryTask = async (taskId: string) => {
    if (!confirm("确定要重试吗？")) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ retry: true }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (!data.success) {
        alert(data.error ?? "重试失败");
        return;
      }
      setTasks((prev) => prev.map((t) => t.id === taskId ? data.task : t));
    } catch {
      alert("重试失败");
    }
  };

  const isImageTask = (inputData: Record<string, unknown>) =>
    IMAGE_ACTIONS.has(inputData.action as string);

  const getImageUrl = (outputData: Record<string, unknown> | null) =>
    (outputData?.imageUrl as string) ?? null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">easyuse.ai</h1>
              <p className="text-xs text-gray-500">顾问工作台</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
              {leads.length} 条线索
            </span>
            <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">返回首页</Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-2">
            {["ALL", "NEW", "CONTACTED", "CLOSED"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-gray-900 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {s === "ALL" ? "全部" : STATUS_LABELS[s]?.label ?? s}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="搜索姓名 / 电话 / 公司..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchLeads()}
            className="flex-1 sm:max-w-xs px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        <div className="bg-white rounded-xl border overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">加载中...</div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-red-600 mb-3">{error}</p>
              <button onClick={fetchLeads} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800">重试</button>
            </div>
          ) : leads.length === 0 ? (
            <div className="p-12 text-center text-gray-400">暂无线索，请先完成诊断流程</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">姓名</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">主要痛点</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">工作量</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">推荐工作流</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">联系方式</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">状态</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">提交时间</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-900">{lead.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{lead.company ?? "—"}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-700">{lead.painPoint ?? "—"}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-500">{lead.timeSpent ?? "—"}</span>
                      </td>
                      <td className="px-5 py-4">
                        {lead.serviceType ? (
                          <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700">
                            {TYPE_LABELS[lead.serviceType] ?? lead.serviceType}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm text-gray-900">{lead.phone}</div>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={lead.status}
                          disabled={updating}
                          onChange={(e) => updateStatus(lead.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border-0 cursor-pointer ${STATUS_LABELS[lead.status]?.color}`}
                        >
                          <option value="NEW">新线索</option>
                          <option value="CONTACTED">已联系</option>
                          <option value="CLOSED">已关闭</option>
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm text-gray-500">
                          {new Date(lead.createdAt).toLocaleDateString("zh-CN")}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {new Date(lead.createdAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => openLead(lead)}
                          className="text-gray-900 hover:text-gray-700 text-sm font-medium"
                        >
                          详情
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Drawer */}
        {selectedLead && (
          <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedLead(null)}>
            <div className="absolute inset-0 bg-black/30" />
            <div
              className="relative w-full max-w-md bg-white shadow-xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
                <h2 className="font-semibold text-gray-900">线索详情</h2>
                <button onClick={() => setSelectedLead(null)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-6">

                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${STATUS_LABELS[selectedLead.status]?.color}`}>
                    {STATUS_LABELS[selectedLead.status]?.label}
                  </span>
                  <span className="text-xs text-gray-400">ID: {selectedLead.id.slice(0, 8)}...</span>
                </div>

                {/* Contact */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">姓名</p>
                    <p className="font-semibold text-gray-900">{selectedLead.name}</p>
                    {selectedLead.company && <p className="text-sm text-gray-500 mt-0.5">{selectedLead.company}</p>}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">联系电话</p>
                    <p className="font-medium text-gray-900">{selectedLead.phone}</p>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Diagnosis */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">诊断信息</h3>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">主要痛点</p>
                    <p className="text-sm text-gray-800">{selectedLead.painPoint ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">每月耗时</p>
                    <p className="text-sm text-gray-800">{selectedLead.timeSpent ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">推荐工作流</p>
                    {selectedLead.serviceType ? (
                      <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700">
                        {TYPE_LABELS[selectedLead.serviceType] ?? selectedLead.serviceType}
                      </span>
                    ) : (
                      <p className="text-sm text-gray-400">—</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">提交时间</p>
                    <p className="text-sm text-gray-700">{new Date(selectedLead.createdAt).toLocaleString("zh-CN")}</p>
                  </div>
                </div>

                {selectedLead.note && (
                  <>
                    <hr className="border-gray-100" />
                    <div>
                      <p className="text-xs text-gray-500 mb-1">需求说明</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedLead.note}</p>
                    </div>
                  </>
                )}

                <hr className="border-gray-100" />

                {/* Lead status actions */}
                <div>
                  <p className="text-xs text-gray-500 mb-3">更新状态</p>
                  <div className="flex gap-2">
                    {(["NEW", "CONTACTED", "CLOSED"] as const).map((s) => (
                      <button
                        key={s}
                        disabled={updating}
                        onClick={() => updateStatus(selectedLead.id, s)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedLead.status === s
                            ? STATUS_LABELS[s].color + " cursor-default"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {STATUS_LABELS[s].label}
                      </button>
                    ))}
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* ── 任务历史 ───────────────────── */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">任务历史</h3>
                    <button
                      onClick={() => fetchTasks(selectedLead.id)}
                      className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      刷新
                    </button>
                  </div>

                  {tasksLoading ? (
                    <div className="text-center py-6 text-sm text-gray-400">加载中...</div>
                  ) : tasks.length === 0 ? (
                    <div className="text-center py-6 text-sm text-gray-400 border border-dashed border-gray-200 rounded-xl">
                      暂无生成任务
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tasks.map((task) => {
                        const isImg = isImageTask(task.inputData);
                        const imageUrl = getImageUrl(task.outputData);
                        const normStatus = (s: string) => s?.toUpperCase().replace(" ", "_");
                        const isDone = task.status === "DONE" || task.status === "done";
                        const isFailed = task.status === "FAILED" || task.status === "failed";
                        const isSent = normStatus(task.deliveryStatus) === "SENT";
                        const isConfirmed = normStatus(task.deliveryStatus) === "CONFIRMED";

                        return (
                          <div key={task.id} className="rounded-xl border border-gray-200 overflow-hidden">
                            {/* 头部：类型 + 状态 + 日期 */}
                            <div className="px-4 py-2.5 bg-gray-50 flex items-center justify-between gap-2 border-b border-gray-100">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-gray-800">
                                  {TASK_TYPE_LABELS[task.taskType] ?? task.taskType}
                                </span>
                                {isDone && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-green-100 text-green-700">已完成</span>
                                )}
                                {isFailed && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-red-100 text-red-700">失败</span>
                                )}
                                {task.isCaseCandidate && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">★ 案例</span>
                                )}
                              </div>
                              <span className="text-[10px] text-gray-400">
                                {new Date(task.createdAt).toLocaleDateString("zh-CN")}
                              </span>
                            </div>

                            {/* 图片预览 + 快捷操作（图片任务） */}
                            {isImg && imageUrl && (
                              <div className="relative bg-gray-100" style={{ height: "180px" }}>
                                <Image
                                  src={imageUrl}
                                  alt="任务结果"
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                                {/* 覆盖层：发客户 / 复制链接 */}
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-3 flex items-center gap-2">
                                  <button
                                    onClick={async () => {
                                      try {
                                        await fetch(`/api/tasks/${task.id}`, {
                                          method: "PATCH",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({ deliveryStatus: "SENT" }),
                                        });
                                        setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, deliveryStatus: "SENT" } : t));
                                      } catch {}
                                    }}
                                    disabled={isSent || isConfirmed}
                                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                                      isSent || isConfirmed
                                        ? "bg-green-500 text-white cursor-default"
                                        : "bg-white text-gray-700 hover:bg-gray-100"
                                    }`}
                                  >
                                    {isSent || isConfirmed ? "已发客户" : "发客户"}
                                  </button>
                                  <button
                                    onClick={async () => {
                                      await fetch(`/api/tasks/${task.id}`, {
                                        method: "PATCH",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ deliveryStatus: "CONFIRMED" }),
                                      });
                                      setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, deliveryStatus: "CONFIRMED" } : t));
                                    }}
                                    disabled={isConfirmed}
                                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                                      isConfirmed
                                        ? "bg-gray-900 text-white cursor-default"
                                        : "bg-gray-800 text-white hover:bg-gray-700"
                                    }`}
                                  >
                                    {isConfirmed ? "已确认 ✓" : "客户确认"}
                                  </button>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(imageUrl);
                                    }}
                                    className="text-xs px-3 py-1.5 rounded-lg bg-white/90 text-gray-600 hover:bg-white transition-colors ml-auto flex items-center gap-1"
                                  >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                    复制
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* 失败信息 */}
                            {isFailed && task.errorMessage && (
                              <div className="px-4 py-2.5 bg-red-50 border-t border-red-100">
                                <p className="text-xs text-red-600">生成失败：{task.errorMessage}</p>
                              </div>
                            )}

                            {/* 客户反馈 + 底部操作 */}
                            <div className="px-4 py-2.5 border-t border-gray-100">
                              {task.customerFeedback ? (
                                <p className="text-xs text-gray-600 italic mb-2">「{task.customerFeedback}」</p>
                              ) : null}
                              <div className="flex items-center gap-2 flex-wrap">
                                {/* 反馈 */}
                                <CaseFeedbackButton
                                  taskId={task.id}
                                  currentFeedback={task.customerFeedback}
                                  onUpdate={(fb) => {
                                    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, customerFeedback: fb } : t));
                                  }}
                                />
                                {/* 标记案例 */}
                                <button
                                  onClick={async () => {
                                    try {
                                      const res = await fetch(`/api/tasks/${task.id}`, {
                                        method: "PATCH",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ isCaseCandidate: !task.isCaseCandidate }),
                                      });
                                      if (res.ok) {
                                        const data = await res.json();
                                        setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, isCaseCandidate: data.task.isCaseCandidate } : t));
                                      }
                                    } catch {}
                                  }}
                                  className={`text-xs px-2 py-1 border rounded-lg transition-colors ${
                                    task.isCaseCandidate
                                      ? "border-amber-300 bg-amber-50 text-amber-700"
                                      : "border-gray-200 text-gray-400 hover:text-gray-600"
                                  }`}
                                >
                                  {task.isCaseCandidate ? "★ 案例" : "☆ 案例"}
                                </button>
                                {/* 重试 */}
                                {isFailed && (
                                  <button
                                    onClick={() => retryTask(task.id)}
                                    className="text-xs px-2 py-1 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                  >
                                    重试
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
