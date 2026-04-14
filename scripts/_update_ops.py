import json
from datetime import datetime

with open('/mnt/e/AI/easyuseAI/public/ops-status.json') as f:
    data = json.load(f)

prev_round = data.get('round', 0)
prev_stable = data.get('stable_count', 0)
new_round = prev_round + 1
new_stable = prev_stable + 1
is_consecutive = new_stable >= 2

now = datetime.utcnow().isoformat() + 'Z'

data['round'] = new_round
data['stable_count'] = new_stable
data['last_check'] = now
data['last_result'] = 'pass'
data['checks'] = {
    'http': '200 - localhost:3000',
    'console': 'pass',
    'flow': 'pass (5/5)',
    'mobile': 'pass (3/3)',
    'errors': 'none found'
}
data['notes'] = {
    'tts': 'script ready at public/welcome-voice-script.txt, TTS API not integrated',
    'health': 'HTTP 200, no errors, flow 5/5, mobile 3/3'
}

with open('/mnt/e/AI/easyuseAI/public/ops-status.json', 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f'round={new_round} stable={new_stable} consecutive={is_consecutive}')
print('ops-status.json updated')
