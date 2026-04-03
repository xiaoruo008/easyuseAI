"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

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

export default function DashboardLeadsPage() {
  const [leads, setLeads] = useState<EnrichedLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState<EnrichedLead | null>(null);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
              <div>
                <h1 className="font-semibold text-gray-900">easyuse.ai</h1>
                <p className="text-xs text-gray-500">顾问工作台</p>
              </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-medium">
              {leads.length} 条线索
            </span>
            <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              返回首页
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-2">
            {["ALL", "NEW", "CONTACTED", "CLOSED"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-indigo-600 text-white"
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
            className="flex-1 sm:max-w-xs px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">加载中...</div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-red-600 mb-3">{error}</p>
              <button onClick={fetchLeads} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">重试</button>
            </div>
          ) : leads.length === 0 ? (
            <div className="p-12 text-center text-gray-400">暂无线据，请先完成一论诊断流程</div>
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
                          <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700">
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
                          onClick={() => setSelectedLead(lead)}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
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
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">线索详情</h2>
                <button onClick={() => setSelectedLead(null)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* Status badge */}
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${STATUS_LABELS[selectedLead.status]?.color}`}>
                    {STATUS_LABELS[selectedLead.status]?.label}
                  </span>
                  <span className="text-xs text-gray-400">
                    ID: {selectedLead.id.slice(0, 8)}...
                  </span>
                </div>

                {/* Contact info */}
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">姓名</p>
                    <p className="font-semibold text-gray-900">{selectedLead.name}</p>
                    {selectedLead.company && (
                      <p className="text-sm text-gray-500 mt-0.5">{selectedLead.company}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">联系电话</p>
                    <p className="font-medium text-gray-900">{selectedLead.phone}</p>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Diagnosis info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">诊断信息</h3>
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
                      <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700">
                        {TYPE_LABELS[selectedLead.serviceType] ?? selectedLead.serviceType}
                      </span>
                    ) : (
                      <p className="text-sm text-gray-400">—</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">提交时间</p>
                    <p className="text-sm text-gray-700">
                      {new Date(selectedLead.createdAt).toLocaleString("zh-CN")}
                    </p>
                  </div>
                </div>

                {selectedLead.note && (
                  <>
                    <hr className="border-gray-100" />
                    <div>
                      <h3 className="text-xs text-gray-500 mb-1">需求说明</h3>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedLead.note}</p>
                    </div>
                  </>
                )}

                <hr className="border-gray-100" />

                {/* Status actions */}
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
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
