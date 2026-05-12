# 交付物 2：Bug 修复说明（`DeviceAlertPanel`）

附件 `buggy-component.tsx` 中的告警面板经修复后位于 `src/components/DeviceAlertPanel.tsx`。该文件作为题目要求的**修复后源码**保留；行为验证见 `src/components/__tests__/DeviceAlertPanel.test.tsx`（覆盖 `buildingId` 依赖、定时器清理、不可变状态更新三处修复）。

主界面布局与 `attachments/wireframes.md` 一致：**不在设备看板底部挂载**该面板；同一套 Mock 告警数据在 **设备详情弹窗**「最近告警」中以表格展示（级别、**告警内容**、时间、确认状态），数据来自 `GET /api/devices/:id` 返回的 `alerts` 字段。

---

## Bug 1：`fetchAlerts` 的 `useCallback` 依赖遗漏 `buildingId`

**问题现象**：在界面中切换楼栋后，告警列表仍显示上一栋楼的数据，或长期停留在首次进入时的结果，与当前选中楼栋不一致。

**根因分析**：`useCallback` 的依赖数组写成了 `[]`，函数体闭包的是**初次渲染**时的 `buildingId`。父组件后续传入的新 `buildingId` 不会使 `fetchAlerts` 引用更新，`fetch` 仍使用旧查询参数，属于典型的 React Hooks 陈旧闭包问题。

**修复方法**：将 `buildingId` 加入 `useCallback` 依赖：`useCallback(async () => { ... }, [buildingId])`。这样楼栋变化时会得到新的拉取函数，`useEffect` 依赖 `fetchAlerts` 也会在切换后重新请求正确数据。

---

## Bug 2：自动刷新 `useEffect` 未清理定时器

**问题现象**：取消勾选「自动刷新」后，网络面板仍周期性出现告警请求；或多次勾选/取消后，同一时间存在多个定时器，请求频率叠加，卸载页面后仍可能继续请求。

**根因分析**：`setInterval(fetchAlerts, 5000)` 创建后没有在 `useEffect` 的清理函数中 `clearInterval`；且 `useEffect` 依赖不完整时，每次依赖变化会新建定时器而不销毁旧定时器，造成内存与请求泄漏。

**修复方法**：在开启自动刷新的 `useEffect` 内 `return () => clearInterval(timer)`，并将 `fetchAlerts` 一并写入依赖数组，保证定时器与当前拉取逻辑一致，卸载或关闭自动刷新时定时器被可靠清除。

---

## Bug 3：`handleAcknowledge` 中直接修改 state 并原地 `setAlerts(alerts)`

**问题现象**：用户点击「确认」后，接口返回成功，但列表项仍显示未确认样式，或偶发界面不刷新。

**根因分析**：代码对 `alerts` 数组中的元素就地修改 `alert.acknowledged = true`，再执行 `setAlerts(alerts)`。此时 **数组引用未变**，React 可能判定状态无变化而跳过更新；同时违反「不可变更新」规范，后续维护易产生隐蔽 bug。

**修复方法**：使用函数式更新与不可变数据：`setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a)))`。为新状态创建新数组与新对象引用，保证重新渲染稳定、可预测。

---

## 小结

以上三点分别对应 **数据与 props 同步**、**副作用清理**、**状态更新规范**，均为 React 常见考点。修复后的组件源码与单测便于评审对照附件中的原始缺陷；若需在看板中再次挂载该面板，只需在 `DeviceDashboardPage` 中引入即可。
