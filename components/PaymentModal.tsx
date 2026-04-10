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
  wechat: "easyuseai",
};

const PAYMENT_ACCOUNT = {
  alipay: "easyuse@ai.com",
  note: "转账时备注「创意方案+手机号」",
};

export default function PaymentModal({ type, onClose }: PaymentModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 z-10">
          <h2 className="font-bold text-gray-900 text-sm sm:text-base">
            {PRICE_LABELS[type] ?? "立即获取"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5">
          {/* Step 1 - Pay after consultation */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">1</span>
              <h3 className="font-semibold text-gray-900">联系顾问报价</h3>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 sm:p-4 space-y-3">
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                顾问了解你的需求后，提供具体方案和报价。确认后付款，交付成果。
              </p>
              <div className="border-t border-gray-200 pt-3 space-y-2">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                  <span className="text-base">💬</span>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400">微信（优先）</p>
                    <p className="text-sm font-semibold text-gray-900">{CONTACT_INFO.wechat}</p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(CONTACT_INFO.wechat)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium shrink-0"
                  >
                    复制
                  </button>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                  <span className="text-base">📧</span>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400">邮箱</p>
                    <p className="text-sm font-semibold text-gray-900 break-all">{PAYMENT_ACCOUNT.alipay}</p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(PAYMENT_ACCOUNT.alipay)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium shrink-0"
                  >
                    复制
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">2</span>
              <h3 className="font-semibold text-gray-900">等待顾问联系</h3>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-blue-800 leading-relaxed">
                通常 2小时内回复，24小时内给出方案。顾问会了解你的具体情况后提供报价。
              </p>
            </div>
          </div>

          {/* Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-800 leading-relaxed">
              💡 先联系不收费。顾问了解需求后给出报价，确认满意再付款。
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
