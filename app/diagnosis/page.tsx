"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { DIAGNOSIS_QUESTIONS, calculateResult, type AnswerValue } from "@/lib/diagnosis";

const TOTAL_STEPS = 8;

export default function DiagnosisPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<number, AnswerValue>>({});
  const [selected, setSelected] = useState<AnswerValue | null>(null);
  const [loading, setLoading] = useState(false);

  const question = DIAGNOSIS_QUESTIONS[currentStep - 1];

  const handleSelect = useCallback(
    (value: AnswerValue) => {
      if (loading) return;
      setSelected(value);
      const newAnswers = { ...answers, [currentStep]: value };
      setAnswers(newAnswers);

      setLoading(true);
      setTimeout(() => {
        if (currentStep < TOTAL_STEPS) {
          setCurrentStep((s) => s + 1);
          setSelected(null);
        } else {
          // Last question: calculate result and store in localStorage
          const result = calculateResult(newAnswers);
          localStorage.setItem(
            "diagnosis_result",
            JSON.stringify({
              q1_answer: newAnswers[1],
              q2_answer: newAnswers[2],
              q3_answer: newAnswers[3],
              result_type: result.type,
            })
          );
          window.location.href = "/result";
        }
        setLoading(false);
      }, 300);
    },
    [currentStep, answers, loading]
  );

  const progress = Math.round((currentStep / TOTAL_STEPS) * 100);

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
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center gap-3">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden flex-1">
            <div
              className="h-full bg-gray-900 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 shrink-0">
            {currentStep}/{TOTAL_STEPS}
          </span>
        </div>
      </div>

      {/* Question */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl">
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900 leading-relaxed">
              {question.text}
            </h2>

            <div className="space-y-3">
              {question.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
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
        </div>
      </main>
    </div>
  );
}
