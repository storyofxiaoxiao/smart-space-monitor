# 交付物 2：Bug 修复说明（`DeviceAlertPanel`）

## Bug 1：`fetchAlerts` 的 `useCallback` 依赖遗漏 `buildingId`

**问题现象**：切换楼栋后，列表仍请求旧楼栋的告警，或长期显示首次进入时的数据。

**根因分析**：`useCallback(..., [])` 在首屏闭包了初始 `buildingId`。父组件传入的 `buildingId` 变化时，回调内部仍使用旧值，`fetch` 的查询串错误。

**修复方法**：将 `buildingId` 写入依赖数组：`useCallback(..., [buildingId])`，保证每次楼栋变化都得到最新的请求函数。

---

## Bug 2：自动刷新 `useEffect` 未清理定时器

**问题现象**：关闭「自动刷新」或组件卸载后，仍周期性发起请求；多次开关后请求频率叠加，造成泄漏与多余负载。

**根因分析**：`setInterval` 创建后未 `clearInterval`，且 `useEffect` 无清理函数；依赖变化会再建定时器，旧定时器未取消。

**修复方法**：在 `useEffect` 内 `return () => clearInterval(timer)`，并把 `fetchAlerts` 加入依赖，与刷新开关、数据拉取逻辑一致。

---

## Bug 3：`handleAcknowledge` 中直接修改 state 并原地 `setAlerts(alerts)`

**问题现象**：点击「确认」后接口成功，但界面仍显示未确认样式，或偶发不更新。

**根因分析**：对 `alerts` 数组中的对象就地改 `acknowledged` 再 `setAlerts(alerts)`，引用未变，React 可能跳过更新；且违背不可变数据原则。

**修复方法**：使用函数式更新：`setAlerts((prev) => prev.map(...))`，为命中项返回新对象 `{ ...a, acknowledged: true }`，触发可靠重渲染。
