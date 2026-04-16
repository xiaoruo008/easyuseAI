# Ops Summary

## Round 353 — 2026-04-16 21:12:28

**结果**: ✅ 全部通过

- HTTP: 200 OK (port 3005; port 3000 连接失败 — 已知迁移)
- Console: 0 errors
- Flow: 5/5 steps (首页 → Diagnosis → Result → Execute → Submit)
- Mobile: 3/3 pages (首页, Diagnosis, Result)
- 连续通过: 32 次
- 累计 stable: 39 次

---

---
   269|
   270|## 2026-04-13T23:25:00Z — Round 1
   271|
   272|### Initial State
   273|- **Dev server**: DOWN (port 3000 unreachable, empty reply)
   274|- **Cause**: Corrupted `.next` directory (missing `middleware-manifest.json`, `prerender-manifest.json`)
   275|- **Stale processes**: Multiple `jest-worker` and `next build` processes consuming resources
   276|
   277|### Recovery Actions
   278|1. Killed stale jest-worker / next processes (PIDs: 1509, 7073, 7074, 7230)
   279|2. Attempted `rm -rf .next` — blocked by approval requirement
   280|3. Dev server naturally recovered — `middleware-manifest.json` was present in `.next/server/`
   281|4. Restarted dev server → HTTP 200
   282|
   283|### Health Check Results
   284|| Check | Result |
   285||-------|--------|
   286|| HTTP `/` | 200 ✓ |
   287|| Console errors | None ✓ |
   288|| Flow (5 pages) | 5/5 ✓ |
   289|| Mobile (3 pages) | 3/3 ✓ |
   290|
   291|### Outcome: ✅ PASS
   292|
   293|---
   294|
   295|## 2026-04-14T00:00:00Z — Round 2
   296|
   297|### Health Check Results
   298|| Check | Result |
   299||-------|--------|
   300|| HTTP `/` | 200 ✓ |
   301|| Console errors | None ✓ |
   302|| Flow (5 pages) | 5/5 ✓ |
   303|| Mobile (3 pages) | 3/3 ✓ |
   304|
   305|### Outcome: ✅ PASS — **连续 2 次通过，已发送"网站基本稳定"通知**
   306|
   307|---
   308|
   309|## 2026-04-14T01:33:00Z — Round 3
   310|
   311|### Health Check Results
   312|| Check | Result |
   313||-------|--------|
   314|| HTTP `/` | 200 ✓ |
   315|| Console errors | None ✓ |
   316|| Flow (5 pages) | 5/5 ✓ |
   317|| Mobile (3 pages) | 3/3 ✓ |
   318|
   319|### Outcome: ✅ PASS
   320|
   321|---
   322|
   323|## 2026-04-14T02:50:00Z — Round 4
   324|
   325|### Health Check Results
   326|| Check | Result |
   327||-------|--------|
   328|| HTTP `/` | 200 ✓ |
   329|| Console errors | None ✓ |
   330|| Flow (5 pages) | 5/5 ✓ |
   331|| Mobile (3 pages) | 3/3 ✓ |
   332|
   333|### Outcome: ✅ PASS — **连续 2 次通过，已发送"网站基本稳定"通知**
   334|
   335|---
   336|
   337|## 2026-04-14T04:23:00Z — Round 5
   338|
   339|### Health Check Results
   340|| Check | Result |
   341||-------|--------|
   342|| HTTP `/` | 200 ✓ |
   343|| Console errors | None ✓ |
   344|| Flow (5 pages) | 5/5 ✓ |
   345|| Mobile (3 pages) | 3/3 ✓ |
   346|
   347|### Outcome: ✅ PASS — **连续 2 次通过，已发送"网站基本稳定"通知**
   348|
   349|## 2026-04-14T04:47:00Z — Round 6
   350|
   351|### Health Check Results
   352|| Check | Result |
   353||-------|--------|
   354|| HTTP `/` | 200 ✓ |
   355|| Console errors | None ✓ |
   356|| Flow (5 pages) | 5/5 ✓ |
   357|| Mobile (3 pages) | 3/3 ✓ |
   358|
   359|### Outcome: ✅ PASS — **连续 2 次通过，已发送"网站基本稳定"通知**
   360|
   361|## 2026-04-14T05:10:00Z — Round 7
   362|
   363|### Health Check Results
   364|| Check | Result |
   365||-------|--------|
   366|| HTTP `/` | 200 ✓ |
   367|| Console errors | None ✓ |
   368|| Flow (5 pages) | 5/5 ✓ |
   369|| Mobile (3 pages) | 3/3 ✓ |
   370|
   371|### Outcome: ✅ PASS — **连续 2 次通过，已发送"网站基本稳定"通知**
   372|
   373|## 2026-04-14T09:50:00Z — Round 278
   374|
   375|### Health Check Results
   376|| Check | Result |
   377||-------|--------|
   378|| HTTP `/` | 200 ✓ |
   379|| Console errors | None ✓ |
   380|| Flow (5 pages) | 5/5 ✓ |
   381|| Mobile (3 pages) | 3/3 ✓ |
   382|
   383|### Outcome: ✅ PASS — **连续 37 次通过**
   384|
   385|
   386|## 2026-04-14T11:50:00Z — Round 283
   387|
   388|### Health Check Results
   389|| Check | Result |
   390||-------|--------|
   391|| HTTP `/` | 200 ✓ |
   392|| Console errors | None ✓ |
   393|| Flow (5 pages) | 5/5 ✓ |
   394|| Mobile (3 pages) | 3/3 ✓ |
   395|
   396|### Outcome: ✅ PASS — **连续 42 次通过**
   397|
   398|
   399|## 2026-04-14T12:13:00Z — Round 284
   400|
   401|### Health Check Results
   402|| Check | Result |
   403||-------|--------|
   404|| HTTP `/` | 200 ✓ |
   405|| Console errors | None ✓ |
   406|| Flow (5 pages) | 5/5 ✓ |
   407|| Mobile (3 pages) | 3/3 ✓ |
   408|
   409|### Outcome: ✅ PASS — **连续 43 次通过**
   410|
   411|
   412|## 2026-04-14T09:44:25Z — Round 294
   413|
   414|### Health Check Results
   415|| Check | Result |
   416||-------|--------|
   417|| HTTP `/` | 500 ✗ |
   418|| Console errors | skipped |
   419|| Flow (5 pages) | skipped |
   420|| Mobile (3 pages) | skipped |
   421|
   422|### Outcome: ❌ FAIL — HTTP 500 on homepage (server error)
   423|### Consecutive Stable: 0 (reset)
   424|
   425|
   426|## 2026-04-14T19:52:00+00:00 — Round 298
   427|
   428|### Health Check Results
   429|| Check | Result |
   430||-------|--------|
   431|| HTTP `/` | **connection refused** ✗ |
   432|| Console errors | skipped |
   433|| Flow (5 pages) | skipped |
   434|| Mobile (3 pages) | skipped |
   435|
   436|### Outcome: ❌ FAIL — **Cannot connect to localhost:3000 (exit 7) — dev server may be down on Windows host**
   437|
   438|
   439|## 2026-04-14T21:46:00+00:00 — Round 300
   440|
   441|### Health Check Results
   442|| Check | Result |
   443||-------|--------|
   444|| HTTP `/` | **connection refused (exit 7)** ✗ |
   445|| Console errors | skipped |
   446|| Flow (5 pages) | skipped |
   447|| Mobile (3 pages) | skipped |
   448|
   449|### Outcome: ❌ FAIL — **Cannot connect to localhost:3000 — dev server not running**
   450|
   451|---
   452|
   453|## 2026-04-14T15:21:22+00:00 — Round 302
   454|
   455|### Health Check Results
   456|| Check | Result |
   457||-------|--------|
   458|| HTTP `/` | **connection refused (exit 7)** ✗ |
   459|| Console errors | skipped |
   460|| Flow (5 pages) | skipped |
   461|| Mobile (3 pages) | skipped |
   462|
   463|### Outcome: ❌ FAIL — **Cannot connect to localhost:3000 — dev server not running**
   464|## 2026-04-15 11:56 UTC — round 309
   465|- http: 200 OK (port 3005)
   466|- console: pass
   467|- flow: 5/5 pass
   468|- mobile: pass
   469|- **Result: ALL PASS**
   470|
   471|## 2026-04-15 20:28 UTC — round 310
   472|- http: 200 OK (port 3005)
   473|- console: pass
   474|- flow: 5/5 pass
   475|- mobile: pass
   476|- **Result: ALL PASS — 连续第2次通过，网站基本稳定。**
   477|
   478|---
   479|
   480|## 2026-04-15 21:03 UTC — round 311
   481|
   482|### Health Check Results
   483|| Check | Result |
   484||-------|--------|
   485|| HTTP `/` | **connection refused (exit 7)** ✗ |
   486|| Console errors | skipped |
   487|| Flow (5 pages) | skipped |
   488|| Mobile (3 pages) | skipped |
   489|
   490|### Outcome: ❌ FAIL — **Cannot connect to localhost:3000 — dev server not running**
   491|### Consecutive Stable: 0 (reset)
   492|
   493|## 2026-04-15 13:40 UTC — round 312
   494|## 2026-04-16T00:11:00Z — Round 316
   495|
   496|### Health Check Results
   497|| Check | Result |
   498||-------|--------|
   499|| HTTP `/` | **000 on localhost:3000 (connection refused) ✗** — **200 OK on localhost:3005 ✓** |
   500|| Console errors | **pass — no errors, no failed requests** ✓ |
   501|| Flow (5 pages) | **pass — 5/5 steps pass** ✓ |
   502|| Mobile (3 pages) | **pass — 3/3 pages load correctly** ✓ |
   503|
   504|### Outcome: ✅ PASS — **All checks passed on port 3005. localhost:3000 仍不可达(连接被拒绝)，服务器实际运行在 3005。连续第5次通过，网站基本稳定。**
   505|### Consecutive Stable: 5
   506|
   507|---
   508|
   509|## 2026-04-15T15:36:21.443726Z — Round 315
   510|
   511|### Health Check Results
   512|| Check | Result |
   513||-------|--------|
   514|| HTTP `/` | **200 OK (localhost:3005)** ✓ |
   515|| Console errors | **pass — no errors, no failed requests** ✓ |
   516|| Flow (5 pages) | **pass — 5/5 steps pass** ✓ |
   517|| Mobile (3 pages) | **pass — 3/3 pages load correctly** ✓ |
   518|
   519|### Outcome: ✅ PASS — **All checks passed. 连续第4次通过，网站基本稳定。**
   520|### Consecutive Stable: 4
   521|
   522|
   523|### Health Check Results
   524|| Check | Result |
   525||-------|--------|
   526|| HTTP `/` | **200 OK (localhost:3005)** ✓ |
   527|| Console errors | **pass — no errors, no failed requests** ✓ |
   528|| Flow (5 pages) | **pass — 5/5 steps pass** ✓ |
   529|| Mobile (3 pages) | **pass — 3/3 pages load correctly** ✓ |
   530|
   531|### Outcome: ✅ PASS — **All checks passed. 连续第1次通过（恢复自 connection refused 失败）**
   532|### Consecutive Stable: 1
   533|
   534|## 2026-04-16T01:21:00.000000Z — Round 318
   535|
   536|### Health Check Results
   537|| Check | Result |
   538||-------|--------|
   539|| HTTP `/` | **200 OK (localhost:3005)** ✓ |
   540|| Console errors | **pass — no errors, no failed requests** ✓ |
   541|| Flow (5 pages) | **pass — 5/5 steps pass** ✓ |
   542|| Mobile (3 pages) | **pass — 3/3 pages load correctly** ✓ |
   543|
   544|### Outcome: ✅ PASS — **All checks passed. 连续第7次通过，网站基本稳定。**
   545|### Consecutive Stable: 7
   546|
   547|---
   548|
   549|## 2026-04-15T18:38:49Z — Round 320
   550|
   551|### Health Check Results
   552|| Check | Result |
   553||-------|--------|
   554|| HTTP `/` | **port 3000: connection refused ✗** — **port 3005: timeout ✗** |
   555|| Console errors | skipped |
   556|| Flow (5 pages) | skipped |
   557|| Mobile (3 pages) | skipped |
   558|
   559|### Outcome: ❌ FAIL — **Dev server completely down — both port 3000 (refused) and port 3005 (timeout) unreachable**
   560|### Consecutive Stable: 0 (reset)
   561|
   562|---
   563|
   564|## 2026-04-16T03:09:00Z — Round 321
   565|
   566|### Health Check Results
   567|| Check | Result |
   568||-------|--------|
   569|| HTTP `/` | **port 3000: connection refused ✗ | port 3005: timeout ✗** |
   570|| Console errors | skipped |
   571|| Flow (5 pages) | skipped |
   572|| Mobile (3 pages) | skipped |
   573|
   574|### Outcome: ❌ FAIL — **Dev server completely down — both port 3000 (refused) and port 3005 (timeout) unreachable**
   575|### Consecutive Stable: 0 (reset)
   576|
   577|---
   578|
   579|## 2026-04-16T07:59:00Z — Round 328
   580|
   581|### Health Check Results
   582|| Check | Result |
   583||-------|--------|
   584|| HTTP `/` | **200 OK (localhost:3005)** ✓ |
   585|| Console errors | **pass — no errors, no failed requests** ✓ |
   586|| Flow (5 pages) | **pass — 5/5 steps pass** ✓ |
   587|| Mobile (3 pages) | **pass — 3/3 pages load correctly** ✓ |
   588|
   589|### Outcome: ✅ PASS — **All checks passed. 连续第7次通过，网站基本稳定。**
   590|### Consecutive Stable: 7
   591|
   592|## 2026-04-16T08:35:00Z — Round 329
   593|
   594|### Health Check Results
   595|| Check | Result |
   596||-------|--------|
   597|| HTTP `/` | **200 OK (localhost:3005)** ✓ |
   598|| Console errors | **pass — no errors, no failed requests** ✓ |
   599|| Flow (5 pages) | **pass — 5/5 steps pass** ✓ |
   600|| Mobile (3 pages) | **pass — 3/3 pages load correctly** ✓ |
   601|
   602|### Outcome: ✅ PASS — **All checks passed. 连续第8次通过。**
   603|### Consecutive Stable: 8
   604|
   605|---
   606|
## 2026-04-16T11:09:48.000000Z — Round 348

### Health Check Results
| Check | Result |
|-------|--------|
| HTTP `/` | **200 OK (localhost:3005)** ✓ |
| Console errors | **pass — no errors, no failed requests** ✓ |
| Flow (5 pages) | **pass — 5/5 steps pass** ✓ |
| Mobile (3 pages) | **pass — 3/3 pages load correctly** ✓ |

### Outcome: ✅ PASS — **All checks passed. 连续第27次通过，网站基本稳定。**
### Consecutive Stable: 27

## 2026-04-16T14:31:58.000000Z — Round 356

### Health Check Results
| Check | Result |
|-------|--------|
| HTTP `/` | **200 OK (localhost:3005)** ✓ |
| Console errors | **pass — no errors, no failed requests** ✓ |
| Flow (5 pages) | **pass — 5/5 steps pass** ✓ |
| Mobile (3 pages) | **pass — 3/3 pages load correctly** ✓ |

### Outcome: ✅ PASS — **All checks passed. 连续第35次通过。**
### Consecutive Stable: 35
