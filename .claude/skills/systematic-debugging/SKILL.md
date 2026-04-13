# systematic-debugging

> 系统化调试流程：从问题复现、根因定位到修复验证的完整方法论。

---

## 触发场景

触发词：
- 「怎么排查这个问题」
- 「一直报错」
- 「不知道为什么」
- 「调试一下」
- 「页面坏了」
- 「接口挂了」

---

## 分步执行流程

### Step 1 — 问题确认

明确以下信息：
- 什么操作触发问题？
- 期望行为是什么？
- 实际行为是什么？
- 是否稳定复现？

```bash
# 记录复现步骤
echo "操作: $ACTION"
echo "期望: $EXPECTED"
echo "实际: $ACTUAL"
```

### Step 2 — 收集上下文

```bash
# 错误信息
echo "$ERROR_MESSAGE"

# 相关日志（最后 100 行）
tail -100 logs/*.log 2>/dev/null || echo "无日志文件"

# 终端输出
echo "终端错误: $TERMINAL_OUTPUT"
```

### Step 3 — 定位问题层级

```
a) UI 层（页面渲染、组件状态）
   → 检查 React DevTools / Browser DevTools
   
b) API 层（接口响应、状态码）
   → curl -v 检查请求/响应
   
c) 业务逻辑层（lib/、service/）
   → 添加 console.log 断点
   
d) 数据层（数据库、缓存）
   → 检查查询语句、连接状态
   
e) 基础设施层（网络、认证、环境变量）
   → ping、curl、env 检查
```

### Step 4 — 假设验证

提出最可能的假设，逐一验证：

```
假设 1: 网络请求超时
验证: curl --max-time 5 $URL

假设 2: 环境变量缺失
验证: echo $VAR_NAME

假设 3: 权限问题
验证: 检查 API Key、token、session
```

### Step 5 — 修复实施

```
优先级修复：
1. 最简单、最小改动
2. 验证修复有效
3. 确认无副作用
```

### Step 6 — 回归验证

```bash
# 复现原问题的操作
$ORIGINAL_OPERATION

# 确认问题已修复
if [ "$RESULT" == "$EXPECTED" ]; then
    echo "✅ 修复成功"
else
    echo "❌ 修复失败"
fi
```

---

## 常用排查命令

```bash
# 检查端口占用
lsof -i :$PORT

# 检查进程
ps aux | grep $PROCESS_NAME

# 检查环境变量
env | grep -E "(KEY|URL|PORT)"

# 检查网络连通性
curl -s -o /dev/null -w "%{http_code}" $URL

# 检查日志
tail -f logs/*.log

# 检查依赖
pnpm list $PACKAGE_NAME
```

---

## 限制条件

- 只排查不修改业务逻辑（除非明确授权）
- 不删除数据
- 不修改环境变量
- 不在生产环境直接调试
- 输出排查报告而非直接大改代码

---

## 输出格式

```
## 调试报告

### 问题描述
- 操作: xxx
- 期望: xxx
- 实际: xxx

### 根因分析
xxx

### 修复方案
1. xxx
2. xxx

### 验证结果
✅ 修复成功 / ❌ 修复失败

### 备注
xxx
```
