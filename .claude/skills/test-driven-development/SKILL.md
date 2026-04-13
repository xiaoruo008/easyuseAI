# test-driven-development

> TDD 测试驱动开发：红-绿-重构循环、单元测试、集成测试、测试策略的完整实践。

---

## 触发场景

触发词：
- 「写个测试」
- 「TDD 怎么做」
- 「这个函数怎么测试」
- 「跑一下测试」
- 「测试没通过」
- 「添加单元测试」
- 「集成测试怎么写」

---

## TDD 红绿重构循环

### Red（红）— 写一个失败的测试

```bash
# 先写测试，不要写实现
pnpm test

# 期望：测试失败，提示功能未实现
```

### Green（绿）— 写最少的代码让测试通过

```bash
# 写最简单的实现
# 不要过度设计，只让测试通过即可
pnpm test

# 期望：测试通过
```

### Refactor（重构）— 改善代码但不改变行为

```bash
# 重构代码
# 确保测试仍然通过
pnpm test
```

---

## 测试类型

### 1. 单元测试（Unit Test）

测试独立的函数/组件：

```typescript
// lib/math.test.ts
import { describe, it, expect } from 'vitest'
import { add, multiply } from './math'

describe('math utils', () => {
  it('adds two numbers', () => {
    expect(add(2, 3)).toBe(5)
  })

  it('multiplies two numbers', () => {
    expect(multiply(2, 3)).toBe(6)
  })
})
```

### 2. 集成测试（Integration Test）

测试多个模块协作：

```typescript
// app/api/user.test.ts
import { describe, it, expect } from 'vitest'

describe('GET /api/user', () => {
  it('returns user data', async () => {
    const response = await fetch('/api/user?id=1')
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data).toHaveProperty('id')
    expect(data).toHaveProperty('name')
  })
})
```

### 3. 端到端测试（E2E Test）

测试完整用户流程：

```typescript
// e2e/submit.test.ts
import { test, expect } from '@playwright/test'

test('submit form and see result', async ({ page }) => {
  await page.goto('/diagnosis')
  await page.fill('[name="description"]', '测试描述')
  await page.click('[type="submit"]')
  
  await expect(page.locator('.result')).toBeVisible()
})
```

---

## 测试运行命令

```bash
# 运行所有测试
pnpm test

# 监听模式（文件变化时重新运行）
pnpm test:watch

# 生成覆盖率报告
pnpm test:coverage

# 运行特定测试文件
pnpm test src/lib/math.test.ts

# 运行特定测试用例
pnpm test -t "adds two numbers"

# E2E 测试
pnpm exec playwright test
```

---

## 测试文件命名规范

```
src/
├── lib/
│   ├── math.ts
│   └── math.test.ts      # 单元测试
├── app/
│   └── api/
│       └── user/
│           └── route.ts
│           └── route.test.ts  # 集成测试
e2e/
├── submit.test.ts        # E2E 测试
```

---

## 测试覆盖原则

```
1. 覆盖所有业务逻辑路径
2. 覆盖边界条件（空值、0、负数、最大值）
3. 覆盖错误处理路径
4. 不测试第三方库本身
5. 不测试简单的 getter/setter
```

---

## 常见测试场景

### 异步函数测试

```typescript
it('handles async data', async () => {
  const data = await fetchData()
  expect(data).toEqual(expected)
})
```

### 错误抛出测试

```typescript
it('throws on invalid input', () => {
  expect(() => validate('')).toThrow('Input required')
})
```

### Mock 函数

```typescript
it('calls callback with result', () => {
  const callback = vi.fn()
  process(callback)
  expect(callback).toHaveBeenCalledWith(expected)
})
```

---

## 限制条件

- 不修改生产代码来迁就测试
- 不写无意义的测试（只测试存在的方法）
- 不在测试中硬编码随机值
- 保持测试快速（<100ms 一个用例）
- 测试之间相互独立，不共享状态

---

## 输出格式

```
## TDD 执行报告

### 测试结果
- 通过: N
- 失败: N
- 覆盖率: XX%

### 红绿重构状态
- [ ] Red: 添加了 xxx 测试
- [ ] Green: 实现了 xxx
- [ ] Refactor: 重构了 xxx

### 新增测试文件
- src/lib/xxx.test.ts

### 建议
xxx
```
