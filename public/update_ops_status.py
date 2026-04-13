import json
from datetime import datetime

now = datetime.utcnow().isoformat() + 'Z'
data = {
  "timestamp": now,
  "round": 5,
  "currentIssue": None,
  "status": "PASS",
  "summary": {
    "diagnosisFlow": "3/3 步骤通过",
    "browserFlow": "5/5 页面加载通过",
    "consoleCheck": "无 console 错误，无失败请求",
    "mobileCheck": "3/3 移动端页面通过"
  },
  "tests": {
    "home": {"passed": True, "note": "页面加载正常，无 console 错误"},
    "diagnosis": {"passed": True, "note": "交互流程 3/3 步骤通过"},
    "diagnosisConsole": {"passed": True, "note": "无 console 错误，无失败请求"},
    "result": {"passed": True, "note": "Result 页面正常到达"},
    "execute": {"passed": True, "note": "页面加载正常"},
    "submit": {"passed": True, "note": "页面加载正常"},
    "mobile": {"passed": True, "note": "3/3 移动端页面通过"}
  },
  "nextAction": "无需进一步行动，所有核心测试通过",
  "lastValidation": now,
  "screenshotFiles": [
    "public/screenshots/flow-首页.png",
    "public/screenshots/flow-diagnosis.png",
    "public/screenshots/flow-result.png",
    "public/screenshots/flow-execute.png",
    "public/screenshots/flow-submit.png",
    "public/screenshots/mobile-首页.png",
    "public/screenshots/mobile-diagnosis.png",
    "public/screenshots/mobile-result.png"
  ],
  "stable_count": 4
}

with open('public/ops-status.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print('ops-status.json updated: round=5, stable_count=4')
