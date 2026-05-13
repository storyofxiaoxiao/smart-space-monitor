# 交付物 2：Bug 修复说明（`DeviceAlertPanel`）

题目附件 **`attachments/buggy-component.tsx`** 内含 **3 处故意缺陷**（见该文件注释与 `← 留意这里` 等标记）。修复后的实现位于 **`src/components/DeviceAlertPanel.tsx`**（与附件组件职责一致，并补充表格等展示）；单测 **`src/components/__tests__/DeviceAlertPanel.test.tsx`** 覆盖三处修复行为。

主界面与 **`attachments/wireframes.md`** 对齐：**不在设备看板底部挂载**该面板；Mock 告警在 **设备详情弹窗**「最近告警」表格中展示（级别、告警内容、时间、确认状态），数据来自 `GET /api/devices/:id` 的 `alerts`。`DeviceAlertPanel` 仍可作为「附件 Bug 修复」的独立交付对照。

---

## Bug 1：`fetchAlerts` 的 `useCallback` 依赖遗漏 `buildingId`

**问题现象**：在界面中切换楼栋后，告警列表仍显示上一栋楼的数据，或长期停留在首次进入时的结果，与当前选中楼栋不一致。

**根因分析**：`useCallback` 的依赖数组写成了 `[]`，函数体闭包的是**初次渲染**时的 `buildingId`。父组件后续传入的新 `buildingId` 不会使 `fetchAlerts` 引用更新，`fetch` 仍使用旧查询参数，属于典型的 React Hooks 陈旧闭包问题。

**附件中的问题代码**（`buggy-component.tsx` 约第 49–61 行）：

```ts
const fetchAlerts = useCallback(async () => {
  // ...
  const res = await fetch(`/api/alerts?buildingId=${buildingId}`);
  // ...
}, []); // ← 留意这里：未依赖 buildingId
```

**修复后代码**（`DeviceAlertPanel.tsx`）：

```ts
const fetchAlerts = useCallback(async () => {
  setLoading(true);
  try {
    const res = await fetch(`/api/alerts?buildingId=${buildingId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: Alert[] = await res.json();
    setAlerts(data);
  } catch (err) {
    console.error('Failed to fetch alerts:', err);
  } finally {
    setLoading(false);
  }
}, [buildingId]);
```

**修复方法**：将 `buildingId` 写入 `useCallback` 依赖数组，使楼栋变化时 `fetchAlerts` 引用更新，`useEffect(..., [fetchAlerts])` 随之重新拉取。

---

## Bug 2：自动刷新 `useEffect` 未清理定时器

**问题现象**：取消勾选「自动刷新」后，网络面板仍周期性出现告警请求；或多次勾选/取消后，同一时间存在多个定时器，请求频率叠加，卸载页面后仍可能继续请求。

**根因分析**：`setInterval(fetchAlerts, 5000)` 创建后没有在 `useEffect` 的清理函数中 `clearInterval`；且 `useEffect` 依赖不完整时，每次依赖变化会新建定时器而不销毁旧定时器，造成内存与请求泄漏。

**附件中的问题代码**（`buggy-component.tsx` 约第 68–73 行）：

```ts
useEffect(() => {
  if (autoRefresh) {
    const timer = setInterval(fetchAlerts, 5000);
  }
}, [autoRefresh]); // 无清理、未依赖 fetchAlerts
```

**修复后代码**（`DeviceAlertPanel.tsx`）：

```ts
useEffect(() => {
  if (autoRefresh) {
    const timer = setInterval(fetchAlerts, 5000);
    return () => clearInterval(timer);
  }
}, [autoRefresh, fetchAlerts]);
```

**修复方法**：在 `if (autoRefresh)` 分支内 `return () => clearInterval(timer)`；依赖数组包含 `fetchAlerts`，与当前拉取逻辑一致，避免陈旧闭包与多定时器叠加。

---

## Bug 3：`handleAcknowledge` 中直接修改 state 并原地 `setAlerts(alerts)`

**问题现象**：用户点击「确认」后，接口返回成功，但列表项仍显示未确认样式，或偶发界面不刷新。

**根因分析**：代码对 `alerts` 数组中的元素就地修改 `alert.acknowledged = true`，再执行 `setAlerts(alerts)`。此时 **数组引用未变**，React 可能判定状态无变化而跳过更新；同时违反「不可变更新」规范，后续维护易产生隐蔽 bug。

**附件中的问题代码**（`buggy-component.tsx` 约第 76–86 行）：

```ts
const alert = alerts.find((a) => a.id === alertId);
if (alert) {
  alert.acknowledged = true;
  setAlerts(alerts);
}
```

**修复后代码**（`DeviceAlertPanel.tsx`）：

```ts
setAlerts((prevAlerts) =>
  prevAlerts.map((a) =>
    a.id === alertId ? { ...a, acknowledged: true } : a
  )
);
```

**修复方法**：使用函数式更新 + `map` 生成新数组、展开运算符生成新对象，保证引用变化，触发可靠重渲染。

---

## 小结

以上三点分别对应 **数据与 props 同步**、**副作用清理**、**状态更新规范**，均为 React 常见考点；与 **`attachments/buggy-component.tsx`** 中的三处缺陷一一对应。修复后的 `DeviceAlertPanel.tsx` 与单测便于评审对照附件；若需在看板底部再次挂载该面板，在 `DeviceDashboardPage` 中引入即可。
