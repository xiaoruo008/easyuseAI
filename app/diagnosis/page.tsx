"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DIAGNOSIS_QUESTIONS, type AnswerValue } from "@/lib/diagnosis";

const TOTAL_STEPS = DIAGNOSIS_QUESTIONS.length;

export default function DiagnosisPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<number, AnswerValue>>({});
  const [selected, setSelected] = useState<AnswerValue | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 创建 session
  useEffect(() => {
    fetch("/api/diagnosis/session", { method: "POST" })
      .then((r) => r.json())
      .then((data) => setSessionId(data.id))
      .catch(() => setError("无法创建诊断会话，请刷新重试"));
  }, []);

  const question = DIAGNOSIS_QUESTIONS[currentStep - 1];

  const handleSelect = useCallback(
    async (value: AnswerValue) => {
      if (!sessionId) return;
      setSelected(value);
      const newAnswers = { ...answers, [currentStep]: value };
      setAnswers(newAnswers);

      setLoading(true);
      try {
        if (currentStep < TOTAL_STEPS) {
          // 保存答案并跳到下一步
          await fetch(`/api/diagnosis/session/${sessionId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ step: currentStep + 1, answers: newAnswers }),
          });
          setCurrentStep((s) => s + 1);
          setSelected(null);
        } else {
          // 最后一题：计算结果后跳转
          await fetch(`/api/diagnosis/session/${sessionId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ step: currentStep, answers: newAnswers, completed: true }),
          });
          router.push(`/result?session=${sessionId}`);
        }
      } catch {
        setError("保存答案失败，请重试");
      } finally {
        setLoading(false);
      }
    },
    [sessionId, currentStep, answers, router]
  );

  const progress = Math.round((currentStep / TOTAL_STEPS) * 100);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <p className="text-red-600 font-medium">{error}</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
            刷新重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="text-sm text-gray-500">问题诊断</span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-6 py-3">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-900 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl">
          {!sessionId ? (
            <div className="text-center text-gray-500 py-12">正在初始化...</div>
          ) : (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 leading-relaxed">
                {question.text}
              </h2>

              <div className="space-y-3">
                {question.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => !loading && handleSelect(opt.value)}
                    disabled={loading}
                    className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all duration-200 ${
                      selected === opt.value
                        ? "border-gray-900 bg-gray-50 text-gray-900"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                    } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <span className="font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>

              {loading && (
                <p className="text-center text-sm text-gray-400">保存中...</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
