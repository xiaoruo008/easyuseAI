"use client";

interface PaymentModalProps {
  type: "paid" | "pro";
  onClose: () => void;
}

const PRICE_LABELS: Record<string, string> = {
  paid: "¥99 标准制作",
  pro: "¥299 完整定制",
};

const CONTACT_INFO = {
  wechat: "easyuse_ai",
  whatsapp: "+86 138-0000-0000",
};

const PAYMENT_ACCOUNT = {
  alipay: "easyuse@ai.com",
  note: "转账时备注「创意方案+手机号」",
};

export default function PaymentModal({ type, onClose }: PaymentModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end pr-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold text-gray-900">
            {PRICE_LABELS[type] ?? "立即获取"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Step 1 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">1</span>
              <h3 className="font-semibold text-gray-900">完成付款</h3>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">支付宝</span>
                <span className="font-semibold text-gray-900">{PAYMENT_ACCOUNT.alipay}</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <p className="text-xs text-gray-400 mb-2">微信/支付宝 付款码</p>
                <div className="w-32 h-32 bg-gray-200 border-2 border-dashed rounded-xl mx-auto flex items-center justify-center text-gray-400 text-xs text-center">
                  二维码占位
                </div>
              </div>
              <p className="text-xs text-gray-400 text-center">{PAYMENT_ACCOUNT.note}</p>
            </div>
          </div>

          {/* Step 2 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">2</span>
              <h3 className="font-semibold text-gray-900">联系顾问</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="text-base">💬</span>
                  <span className="text-sm font-medium text-gray-800">微信</span>
                </div>
                <span className="text-sm font-semibold text-blue-700">{CONTACT_INFO.wechat}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="text-base">📱</span>
                  <span className="text-sm font-medium text-gray-800">WhatsApp</span>
                </div>
                <span className="text-sm font-semibold text-green-700">{CONTACT_INFO.whatsapp}</span>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-800 leading-relaxed">
              💡 付款后联系顾问，发送付款截图。<br />
              顾问会在24小时内完成制作并发送成果。
            </p>
          </div>

          {/* Free alt */}
          <div className="text-center pt-2">
            <p className="text-xs text-gray-400 mb-2">还没准备好？</p>
            <button
              onClick={onClose}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              先填免费资料 →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
