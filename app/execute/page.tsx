"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import type { DiagnosisResult } from "@/lib/diagnosis";
import { mapResultTypeToTrendingDiagnosisType } from "@/lib/diagnosis";
import { 
  CATEGORY_LABELS, SCENE_LABELS, 
  recommendSceneFromAction, recommendCategoryFromContext, buildGarmentDescription,
  type ProductCategory, type SceneType, type Gender
} from "@/lib/image/user-choices";
import { 
  MAIN_WHITE_TEMPLATES, 
  MODEL_PHOTO_TEMPLATES, 
  LIFESTYLE_TEMPLATES,
  HERO_BRANDED_TEMPLATES 
} from "@/lib/image/prompt-templates";
import type { Market, Category as ApiCategory } from "@/lib/types/fashion";

interface ResultData {
  session: { id: string; completed: boolean };
  result: DiagnosisResult | undefined;
  fields?: {
    market?: Market;
    gender?: Gender;
    category?: ApiCategory;
  };
}

type TextResult = { title: string; items: string[] };
type ImageResult = { imageUrl: string; thumbnailUrl?: string; provider: string; model: string; source: string; workflowLabel?: string };

const IMAGE_ACTIONS = new Set(["product_photo", "model_photo", "background_swap", "lifestyle", "fashion_model", "fashion_lifestyle"]);

const STYLE_OPTIONS = [
  { value: "commercial", label: "商业" },
  { value: "minimal", label: "极简" },
  { value: "luxury", label: "高端" },
];

const RATIO_OPTIONS = [
  { value: "1:1", label: "1:1" },
  { value: "3:4", label: "3:4" },
  { value: "16:9", label: "16:9" },
];

function ExecuteContent() {
  const params = useSearchParams();
  const router = useRouter();
  const sessionId = params.get("session") ?? "";
  const actionId = params.get("action") ?? "";
  const workflowKey = params.get("workflowKey") ?? "";
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [textResult, setTextResult] = useState<TextResult | null>(null);
  const [imageResult, setImageResult] = useState<ImageResult | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("commercial");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [category, setCategory] = useState<ProductCategory>("dress");
  const [scene, setScene] = useState<SceneType>("white_hero");
  const [extraFeatures, setExtraFeatures] = useState("");
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 保存到生成历史（直接从 sessionStorage 读取，避免异步 state 延迟问题）
  const saveToHistory = useCallback((generatedImageUrl: string) => {
    try {
      const HISTORY_KEY = "generation_history";
      const MAX_HISTORY = 20;
      // 直接从 sessionStorage 读取，避免 useEffect 异步延迟
      const storedOriginalUrl = typeof window !== "undefined" 
        ? sessionStorage.getItem("original_image_url") || "" 
        : "";
      const record = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        originalImageUrl: storedOriginalUrl,
        generatedImageUrl,
        createdAt: new Date().toISOString(),
      };
      const existing = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      const updated = [record, ...existing].slice(0, MAX_HISTORY);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch { /* ignore storage error */ }
  }, []);

  const FREE_MAX = 2;
  const [freeLimitReached, setFreeLimitReached] = useState(() => {
    if (typeof window === "undefined") return false;
    const count = parseInt(localStorage.getItem("trial_count") ?? "0", 10);
    return count >= FREE_MAX;
  });

  const isImageTask = IMAGE_ACTIONS.has(actionId);

  useEffect(() => {
    if (!sessionId) {
      setError("缺少会话信息");
      setLoading(false);
      return;
    }
    const resultUrl = actionId
      ? `/api/diagnosis/session/${sessionId}/result?action=${encodeURIComponent(actionId)}`
      : `/api/diagnosis/session/${sessionId}/result`;
    fetch(resultUrl)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => { 
        setData(d); 
        // 选择模式初始化
        if (d?.fields) {
          const g = d.fields.gender as Gender | undefined;
          const cat = d.fields.category as ProductCategory | undefined;
          if (cat) setCategory(cat);
          else setCategory(recommendCategoryFromContext({ gender: g }));
          
          // 从 URL action 推荐场景
          const actionParam = typeof window !== "undefined" 
            ? new URLSearchParams(window.location.search).get("action") 
            : null;
          if (actionParam) setScene(recommendSceneFromAction(actionParam));
        }
        setLoading(false); 
        // 从 sessionStorage 读取原图 URL
        const stored = sessionStorage.getItem("original_image_url");
        if (stored) setOriginalImageUrl(stored);
      })
      .catch(() => { setError("加载失败"); setLoading(false); });
  }, [sessionId, actionId]);

  // 根据选择模式参数生成默认 prompt
  const generateDefaultPrompt = ({
    gender,
    category: cat,
    scene: s,
    market,
    extraFeatures: extra,
  }: {
    gender: Gender;
    category: ProductCategory;
    scene: SceneType;
    market: Market;
    extraFeatures: string;
  }): string => {
    const garmentDesc = buildGarmentDescription({ gender, category: cat, extraFeatures: extra });
    const extraScene = extra ? `, ${extra}` : "";
    switch (s) {
      case "white_hero":
        return MAIN_WHITE_TEMPLATES.resolve(garmentDesc).prompt;
      case "model_studio":
        return MODEL_PHOTO_TEMPLATES.resolve(garmentDesc).prompt;
      case "lifestyle":
        return LIFESTYLE_TEMPLATES.resolve(garmentDesc, "cozy coffee shop").prompt;
      case "brand_hero":
        return HERO_BRANDED_TEMPLATES.resolve(garmentDesc).prompt;
      default:
        return MAIN_WHITE_TEMPLATES.resolve(garmentDesc).prompt;
    }
  };

  // 当选择参数变化时，自动更新 prompt
  useEffect(() => {
    if (!data?.fields) return;
    const genderVal = (data.fields.gender as Gender) || "womenswear";
    const marketVal = data.fields.market || "domestic";
    const newPrompt = generateDefaultPrompt({
      gender: genderVal,
      category,
      scene,
      market: marketVal,
      extraFeatures,
    });
    setPrompt(newPrompt);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, scene, extraFeatures, data?.fields]);

  // 组件卸载或 sessionId 变化时清除轮询 timer
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-3 border-gray-900 border-t-transparent animate-spin mx-auto" />
          <p className="text-gray-400 text-sm">正在准备...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center space-y-6 max-w-sm mx-auto px-4">
          {/* Error Icon */}
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-red-500/10 animate-pulse" />
            <div className="absolute inset-2 rounded-full bg-red-500/20" />
            <div className="relative w-full h-full rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
          </div>

          {/* Error Title */}
          <div className="space-y-2">
            <h2 className="text-white text-xl font-semibold">出错了</h2>
            <p className="text-gray-400 text-sm leading-relaxed">{error ?? "未找到结果，请稍后重试"}</p>
          </div>

          {/* Action Button */}
          <Link
            href="/diagnosis"
            className="group inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-all duration-200 shadow-lg shadow-white/10 hover:shadow-white/20 hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
            重新开始
          </Link>

          {/* Subtle hint */}
          <p className="text-gray-600 text-xs">点击上方按钮返回诊断页面</p>
        </div>
      </div>
    );
  }

  const diagnosisResult = data.result;
  const action = (diagnosisResult.executionActions ?? []).find((a) => a.id === actionId);
  const hasResult = isImageTask ? !!imageResult : !!textResult;

  const handleCreate = async () => {
    // 免费试用次数用完，拦截
    if (freeLimitReached) {
      return;
    }

    setWorking(true);
    setError(null);
    try {
      // 从 sessionStorage 读取 leads 流程路由的 selectedProvider
      const storedProvider = typeof window !== "undefined" ? sessionStorage.getItem("selectedProvider") : null;

      // 从 sessionStorage 读取并传给 API（如果用户上传了原图）
      const storedOriginalUrl = typeof window !== "undefined"
        ? sessionStorage.getItem("original_image_url") || ""
        : "";

      // 【产品保留保护】如果没有原图，弹出确认框
      if (!storedOriginalUrl) {
        const confirmed = window.confirm(
          "⚠️ 你还没有上传产品图，当前生成将是「文字生图」（AI 自由发挥），结果可能与你的商品不符。\n\n" +
          "建议：先上传产品图再生成，以确保结果保留你的商品主体。\n\n" +
          "点击「确定」继续生成，或「取消」返回上传产品图。"
        );
        if (!confirmed) {
          setWorking(false);
          return;
        }
      }

      const useRemovebgComposite = !!storedOriginalUrl;

      const body: Record<string, unknown> = {
        // 有原图时使用抠图+合成 pipeline，保证产品 100% 保留
        action: useRemovebgComposite ? "removebg_composite" : actionId,
        // 保留原始模板 ID，用于生成 prompt 上下文
        templateAction: actionId,
        type: diagnosisResult.type,
        sessionId,
        userPainPoint: diagnosisResult.painPoint,
        userPersona: diagnosisResult.persona,
        workflowKey,
        diagnosisType: mapResultTypeToTrendingDiagnosisType(diagnosisResult.type),
        selectedProvider: storedProvider ?? undefined,
        // 选择模式字段：
        prompt,
        category,
        scene,
        extraFeatures: extraFeatures || undefined,
        gender: (data?.fields?.gender as Gender) || "womenswear",
        market: data?.fields?.market || "domestic",
        aspectRatio: scene === "white_hero" ? "1:1" : "3:4",
        // 【关键】原图 URL — 图生图的核心输入
        originalImageUrl: storedOriginalUrl || undefined,
      };

      const res = await fetch("/api/execute/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      const d = await res.json();

      // ── removebg_composite pipeline 处理 ─────────────────────────────
      // API 返回 pipeline_ready 时，客户端执行 Canvas 合成
      if (d.action === "removebg_composite" && d.step === "pipeline_ready") {
        setStatusText("正在合成图片...");

        // 动态导入 Canvas 合成工具（客户端专用）
        const { compositeImages } = await import("@/utils/canvas-composite");

        const compositeResult = await compositeImages({
          transparentUrl: d.data?.transparentUrl,
          backgroundUrl: d.data?.backgroundUrl,
          transparentBase64: d.data?.transparentBase64,
          outputFormat: "jpeg",
          quality: 0.95,
        });

        setStatusText("正在上传合成结果...");

        // 上传合成结果到 /api/upload
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            base64: compositeResult.base64,
            mimeType: "image/jpeg",
            filename: "composite.jpg",
          }),
        });
        if (!uploadRes.ok) throw new Error("合成图片上传失败");
        const { url: finalImageUrl } = await uploadRes.json();

        const finalResult = {
          imageUrl: finalImageUrl,
          thumbnailUrl: finalImageUrl,
          provider: "removebg_composite",
          model: "composite",
          generatedAt: new Date().toISOString(),
        };
        setImageResult({ ...finalResult, source: "composite", workflowLabel: d.workflowLabel });
        saveToHistory(finalImageUrl);

        // 标记免费试用已使用
        const prev = parseInt(localStorage.getItem("trial_count") ?? "0", 10);
        const next = prev + 1;
        localStorage.setItem("trial_count", String(next));
        if (next >= FREE_MAX) setFreeLimitReached(true);
        setWorking(false);
        return;
      }

      const taskId = d.taskId as string | null;

      if (!taskId) {
        // 没有 taskId（同步返回），直接使用结果
        if (d.taskCategory === "image") {
          setImageResult({ ...d.result, source: d.source ?? "mock", workflowLabel: d.workflowLabel ?? undefined });
          saveToHistory(d.result.imageUrl);
        } else {
          setTextResult(d.result);
        }
        // 标记免费试用已使用（累加计数）
        const prev = parseInt(localStorage.getItem("trial_count") ?? "0", 10);
        const next = prev + 1;
        localStorage.setItem("trial_count", String(next));
        if (next >= FREE_MAX) setFreeLimitReached(true);
        setWorking(false);
        return;
      }

      // 标记免费试用已使用（累加计数）
      const prev = parseInt(localStorage.getItem("trial_count") ?? "0", 10);
      const next = prev + 1;
      localStorage.setItem("trial_count", String(next));
      if (next >= FREE_MAX) setFreeLimitReached(true);

      // 启动轮询（每 3 秒一次，最多 60 秒）
      let elapsed = 0;
      timerRef.current = setInterval(async () => {
        elapsed += 3000;
        try {
          const pollRes = await fetch(`/api/tasks/${taskId}`);
          if (!pollRes.ok) return;
          const task = await pollRes.json();

          if (task.status === "done") {
            clearInterval(timerRef.current!);
            timerRef.current = null;
            setWorking(false);
            if (d.taskCategory === "image" && task.outputData) {
              setImageResult({ ...task.outputData, source: task.outputData.source ?? "ai", workflowLabel: d.workflowLabel ?? undefined });
              saveToHistory(task.outputData.imageUrl);
            } else if (task.outputData) {
              setTextResult(task.outputData);
            }
          } else if (task.status === "failed") {
            clearInterval(timerRef.current!);
            timerRef.current = null;
            setWorking(false);
            setError(task.errorMessage ?? "生成失败，请稍后重试。");
          } else if (elapsed >= 60000) {
            // 超时
            clearInterval(timerRef.current!);
            timerRef.current = null;
            setWorking(false);
            setError("生成超时（超过60秒），请稍后重试或联系顾问协助。");
          }
        } catch {
          // 轮询请求出错，继续等待下一次
        }
      }, 3000);

      // 同时设置 60 秒硬超时保险
      setTimeout(() => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setWorking(false);
          setError("生成超时（超过60秒），请稍后重试或联系顾问协助。");
        }
      }, 60000);

    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      // 网络波动安抚型错误提示
      if (message.includes("timeout") || message.includes("ETIMEDOUT")) {
        setError("生成超时，可能是网络波动。建议：1) 稍等 1 分钟后重试；2) 检查网络连接。");
      } else if (message.includes("2049") || message.includes("quota")) {
        setError("免费次数已用完。您可以：1) 留下联系方式获取 3 张免费券；2) 付费解锁。");
      } else {
        setError("制作时遇到点小问题，可能是网络波动或 AI 服务暂时繁忙。建议：1) 稍等 1 分钟再试；2) 检查网络连接；3) 如果多次失败，请联系顾问协助。");
      }
    }
  };

  const copyLink = () => {
    if (!imageResult) return;
    navigator.clipboard.writeText(imageResult.imageUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = async () => {
    if (!imageResult) return;
    try {
      const response = await fetch(imageResult.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `easyuse-product-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(imageResult.imageUrl, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center gap-3">
          <Link href={`/result?session=${sessionId}`} className="text-gray-300 hover:text-gray-600 transition-colors shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="min-w-0">
            <p className="text-[10px] md:text-xs text-gray-400 leading-none">正在为你制作</p>
            <p className="font-semibold text-gray-900 text-sm md:text-base truncate">{action?.label ?? "图片制作"}</p>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-5 md:space-y-6">

        {/* 你的情况 */}
        <div className="bg-gray-900 rounded-xl p-4 md:p-5 text-white">
          <p className="text-xs text-gray-400 mb-1">你的情况</p>
          <p className="text-sm md:font-medium leading-relaxed">{diagnosisResult.painPoint}</p>
        </div>

        {/* 本次任务 */}
        <div className="rounded-xl border border-gray-200 p-4 md:p-5">
          <div className="flex items-center gap-3 mb-1.5 md:mb-2">
            <span className="text-xl md:text-2xl">{action?.icon}</span>
            <div>
              <p className="font-semibold text-gray-900 text-sm md:text-base">{action?.label}</p>
            </div>
          </div>
          <p className="text-xs md:text-sm text-gray-500 leading-relaxed">{action?.desc}</p>
        </div>

        {/* 免费次数用完提示 */}
        {freeLimitReached && (
          <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 md:p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <span className="text-xl">🎁</span>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-amber-900 mb-1">免费次数已用完</h3>
                <p className="text-sm text-amber-700 leading-relaxed">
                  感谢你体验我们的服务！免费次数已用完，但你还有 2 种方式继续：
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <Link
                href={`/submit?session=${sessionId}`}
                className="block rounded-xl border border-amber-200 bg-white p-4 hover:border-amber-300 hover:bg-amber-50 transition-all"
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg">📝</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">方式 1：留下联系方式（推荐）</p>
                    <p className="text-xs text-gray-500 mt-1">
                      顾问 24 小时内联系你，帮你规划完整方案。现在填写，额外赠送 3 张免费制作券。
                    </p>
                    <p className="text-xs text-indigo-600 font-medium mt-2">
                      免费填写 →
                    </p>
                  </div>
                </div>
              </Link>
              <button
                onClick={() => router.push(`/result?session=${sessionId}`)}
                className="block w-full rounded-xl border border-amber-200 bg-white p-4 hover:border-amber-300 hover:bg-amber-50 transition-all text-left"
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg">💳</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">方式 2：立即付费解锁</p>
                    <p className="text-xs text-gray-500 mt-1">
                      ¥99 制作 5 张同规格图片，批量制作更优惠。
                    </p>
                    <p className="text-xs text-indigo-600 font-medium mt-2">
                      立即解锁 →
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* 图片任务：选择式生成 */}
        {isImageTask && !hasResult && (
          <>
            {/* 当前任务预览卡片 */}
            <div className="rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 p-5 text-white">
              <p className="text-xs text-white/60 mb-1">为你定制</p>
              <p className="font-bold text-lg">
                {CATEGORY_LABELS[category].zh} × {SCENE_LABELS[scene].zh}
              </p>
              <p className="text-xs text-white/50 mt-1">{SCENE_LABELS[scene].desc}</p>
            </div>

            {/* 步骤1：选品类 */}
            <div className="rounded-xl border border-gray-200 p-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">① 选择产品类型</h3>
              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(CATEGORY_LABELS) as ProductCategory[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`py-2.5 px-1 text-xs rounded-lg border transition-colors flex flex-col items-center gap-1 ${
                      category === cat
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <span className="text-base">{CATEGORY_LABELS[cat].emoji}</span>
                    <span>{CATEGORY_LABELS[cat].zh}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 步骤2：选场景 - P0商品保护：仅保留白底图，其他场景已禁用 */}
            <div className="rounded-xl border border-gray-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">② 选择出图场景</h3>
                <span className="text-xs text-amber-600 font-medium">白底图模式 · 商品100%保留</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {/* P0商品保护：仅显示白底图，禁用模特上身/生活场景/品牌海报 */}
                {(Object.keys(SCENE_LABELS) as SceneType[]).filter(s => s === "white_hero").map((s) => (
                  <button
                    key={s}
                    onClick={() => setScene(s)}
                    className={`py-3 px-3 text-left rounded-lg border transition-colors ${
                      scene === s
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <div className="text-sm font-medium flex items-center gap-1.5">
                      <span>{SCENE_LABELS[s].emoji}</span>
                      <span>{SCENE_LABELS[s].zh}</span>
                    </div>
                    <p className={`text-xs mt-0.5 ${scene === s ? "text-white/60" : "text-gray-400"}`}>
                      {SCENE_LABELS[s].desc}
                    </p>
                  </button>
                ))}
              </div>
              {/* 商品保护提示 */}
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-700">
                  <span className="font-semibold">商品保护模式：</span>
                  系统将自动从原图提取商品主体，生成专业白底主图。商品细节100%保留。
                </p>
              </div>
            </div>

            {/* 步骤3：补充描述（选填） */}
            <div className="rounded-xl border border-gray-200 p-4 space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">③ 补充特征（选填）</h3>
              <p className="text-xs text-gray-400">比如颜色、材质、款式细节，不填也可以</p>
              <input
                type="text"
                value={extraFeatures}
                onChange={(e) => setExtraFeatures(e.target.value)}
                placeholder="例如：黑色羊毛，修身款"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-300"
              />
            </div>

            {/* 步骤4：Prompt 预览与编辑 */}
            <div className="rounded-xl border border-gray-200 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">④ 生成的 Prompt</h3>
                <span className="text-xs text-gray-400">可直接修改</span>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none placeholder:text-gray-300"
                placeholder="系统将根据你的选择自动生成 prompt..."
              />
              <p className="text-xs text-gray-400">系统根据品类和场景自动匹配最佳模板，直接点击生成即可出图</p>
            </div>

            {/* 生成按钮 */}
            <button
              onClick={handleCreate}
              disabled={working || freeLimitReached}
              className="w-full py-4 bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 text-white rounded-xl font-bold text-base shadow-lg disabled:opacity-50 transition-all"
            >
              {working ? "AI 正在生成中..." : "⚡ 开始生成（约30秒）"}
            </button>
            <p className="text-center text-xs text-gray-400">不用手写提示词，系统自动匹配最佳模板</p>
          </>
        )}

        {/* 文案任务：上传素材 */}
        {!isImageTask && !hasResult && (
          <div className="rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">上传你的素材（可选）</h3>
            <p className="text-xs text-gray-400 mb-3">上传产品图、数据或客户反馈，我们会针对性制作</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx,.xlsx"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setUploadedFile(file.name);
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 file:font-medium hover:file:bg-gray-200 cursor-pointer"
            />
            {uploadedFile && (
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <svg className="w-3 h-3 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                已选择：{uploadedFile}
              </p>
            )}
          </div>
        )}

        {/* 图片结果 - Before/After 对比 */}
        {imageResult && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-900">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-semibold text-sm">
                {imageResult.workflowLabel ? `${imageResult.workflowLabel} · 你的图做好了` : "你的图做好了"}
              </h3>
            </div>
            {/* Before/After 对比区 - P0商品保护：1:1比例，object-contain防止裁切 */}
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-gray-200 overflow-hidden">
              {/* Before - 原图 */}
              <div className="relative bg-gray-100 aspect-square">
                {originalImageUrl ? (
                  <Image
                    src={originalImageUrl}
                    alt="原图"
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                      <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-400 text-center">原图</p>
                  </div>
                )}
                {/* 标签 */}
                <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded-md">
                  <span className="text-xs text-white font-medium">Before</span>
                </div>
              </div>
              {/* After - AI生成图 */}
              <div className="relative bg-gray-50 aspect-square">
                <Image
                  src={imageResult.imageUrl}
                  alt="AI制作结果"
                  fill
                  className="object-contain"
                />
                {/* 标签 */}
                <div className="absolute top-2 right-2 px-2 py-1 bg-indigo-600 rounded-md">
                  <span className="text-xs text-white font-medium">After</span>
                </div>
              </div>
            </div>
            {/* 底部说明文字 */}
            <p className="text-xs text-gray-400 text-center">原图 → AI优化后，可直接用于电商Listing</p>
            {/* 历史记录入口 */}
            <div className="text-center">
              <button
                onClick={() => router.push("/history")}
                className="text-xs text-gray-400 hover:text-gray-600 underline"
              >
                查看历史记录
              </button>
            </div>
            {/* 按钮组 */}
            <div className="p-3 md:p-4 border border-gray-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <p className="text-xs text-gray-400">
                {imageResult.source === "mock"
                  ? "当前为示例效果 · 付费后生成实际产品图"
                  : "AI生成效果 · 可直接使用"}
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5">
                {/* 下载原图 - 主按钮 */}
                <button
                  onClick={handleDownload}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 font-semibold text-sm shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  下载原图
                </button>
                {/* 复制图片链接 */}
                <button
                  onClick={copyLink}
                  className="flex-1 sm:flex-none px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      已复制
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      复制链接
                    </>
                  )}
                </button>
                {/* 再生成一张 */}
                <button
                  onClick={handleCreate}
                  disabled={working}
                  className="flex-1 sm:flex-none px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  再生成一张
                </button>
                {/* 用于 Listing - 商业语义 */}
                <button
                  onClick={() => router.push(`/submit?session=${sessionId}`)}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-sm font-semibold"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  用于 Listing
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 文案结果 */}
        {textResult && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-900">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-semibold text-sm">{textResult.title}</h3>
            </div>
            <div className="rounded-xl border border-gray-200 divide-y divide-gray-100">
              {textResult.items.map((item, i) => (
                <div key={i} className="px-5 py-4 flex gap-3">
                  <span className="text-gray-300 font-semibold text-sm mt-0.5">{i + 1}.</span>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 免费次数用完提示 */}
        {freeLimitReached && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2">
            <p className="text-sm font-medium text-amber-800">免费体验次数已用完</p>
            <p className="text-xs text-amber-600">留下联系方式，顾问24小时内联系你获取更多体验次数</p>
            <Link
              href={`/submit?session=${sessionId}`}
              className="block w-full py-3 bg-amber-600 text-white rounded-xl font-medium text-sm hover:bg-amber-700 transition-colors text-center"
            >
              留下联系方式
            </Link>
          </div>
        )}

        {/* 按钮 */}
        {!freeLimitReached && (
          <div className="space-y-3 pb-8">
          {!hasResult ? (
            <button
              onClick={handleCreate}
              disabled={working}
              className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {working ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  制作中，预计1-2分钟...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  立即帮我做一版
                </>
              )}
            </button>
          ) : (
            <>
              <button
                onClick={handleCreate}
                disabled={working}
                className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-base md:text-lg hover:bg-gray-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {working ? "制作中，预计1-2分钟" : "再做一版"}
              </button>
              {/* 移动端改为纵向堆叠 */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <Link
                  href={`/result?session=${sessionId}`}
                  className="flex-1 py-3 text-center border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  返回
                </Link>
                <button
                  onClick={() => router.push(`/submit?session=${sessionId}`)}
                  className="flex-1 py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  获取完整服务
                </button>
              </div>
            </>
          )}
          </div>
        )}

      </main>
    </div>
  );
}

export default function ExecutePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><p className="text-gray-400 text-sm">加载中...</p></div>}>
      <ExecuteContent />
    </Suspense>
  );
}
