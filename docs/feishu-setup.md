# 飞书通知配置

## 快速配置（只需 2 步）

### Step 1: 创建飞书机器人

1. 打开飞书 → 进入群聊 → 设置 → 群机器人 → 添加机器人
2. 选择 **自定义机器人（Webhook）**
3. 名字填 `AI 夜间值守`
4. 复制 Webhook URL，类似：
   ```
   https://open.feishu.cn/open-apis/bot/v2/hook/xxxx-xxxx-xxxx
   ```

### Step 2: 配置到 .env.local

在 `/mnt/e/AI/easyuseAI/.env.local` 末尾添加：

```bash
FEISHU_WEBHOOK=https://open.feishu.cn/open-apis/bot/v2/hook/xxxx-xxxx-xxxx
```

### Step 3: 测试

```bash
cd /mnt/e/AI/easyuseAI
bash scripts/send-feishu-notify.sh test "飞书通知测试成功"
```

## 当前状态

- 通知脚本已创建：`scripts/send-feishu-notify.sh`
- 只差 Webhook URL 填入即可生效
- 未配置时通知降级保存到 `public/pending-notifications.json`
