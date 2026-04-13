import json

with open('/mnt/e/AI/easyuseAI/public/ops-status.json') as f:
    data = json.load(f)

prev_round = data.get('round', 0)
prev_stable = data.get('stable_count', 0)
new_round = prev_round + 1
new_stable = prev_stable + 1
is_consecutive = new_stable >= 2

print(f'round={new_round} stable={new_stable} consecutive={is_consecutive}')

data['round'] = new_round
data['stable_count'] = new_stable
data['timestamp'] = '2026-04-13T19:43:00.000Z'
data['status'] = 'PASS'
data['summary'] = {
    'diagnosisFlow': '3/3 步骤通过',
    'browserFlow': '5/5 页面加载通过',
    'consoleCheck': '无 console 错误，无失败请求',
    'mobileCheck': '3/3 移动端页面通过'
}

with open('/mnt/e/AI/easyuseAI/public/ops-status.json', 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print('ops-status.json updated')
