# 交付物 4：设计说明

## 1. 项目结构与组件划分

| 区域 | 职责 | 主要文件 |
|------|------|----------|
| 应用壳层 | 三栏布局（左楼栋 / 中内容 / 右可选 AI）、Tab、当前楼栋设备拉取（供统计） | `App.tsx` |
| 设备看板 | 统计卡片、列表与筛选、设备详情弹窗（**最近告警**以表格展示：级别、告警内容、时间、确认状态） | `DeviceStats`、`DeviceList`、`DeviceDetail`、`FilterDropdown` |
| 工单 | 列表（编号/状态筛选）、创建弹窗、详情与**状态推进** | `WorkOrderList`、`WorkOrderDetail`、`CreateWorkOrderModal` |
| AI | 侧栏对话、Tool Calling 循环、错误提示 | `AIAssistant` |
| 数据访问 | 统一 `fetch` 封装，避免把 `undefined` 写进查询串 | `api/index.ts` |
| 工程健壮性 | 根级错误边界，避免渲染异常白屏 | `ErrorBoundary`、`main.tsx` |

划分原则：**按业务域拆组件**，列表与详情分离；设备「统计」与「列表」各自请求，降低父子 props 纠缠；**楼栋级告警面板**（`DeviceAlertPanel.tsx`）作为题目 Bug 修复交付源码保留，主界面布局与 `attachments/wireframes.md` 对齐，不在看板底部重复挂载；设备关联告警在详情弹窗内随 `GET /api/devices/:id` 一并展示。

## 2. 状态管理方案

采用 **React 内置 `useState` / `useEffect` / `useCallback`**，不引入 Redux。原因：页面规模适中，数据以「单次进入页面拉取 + 弹窗内编辑」为主，全局共享状态少；本地状态可读性高、调试路径短，符合 take-home 的交付与评审效率。工单列表用 `statusFilter` 驱动 `useCallback` 封装的 `loadWorkOrders`，避免筛选与请求逻辑分散。

## 3. AI 对话与 Tool Calling 流程

1. 用户发送消息 → 将已有消息（含 `user` / `assistant` / `tool`）组装为 `ChatMessage[]`，追加当前用户句，调用 `POST /api/chat`。
2. 若返回 `tool_calls`：展示「正在查询设备…」等中间态 → 解析 `function.arguments` → 调用 `deviceApi` / `alertApi` / `workOrderApi` → 将 JSON 字符串作为 `role: tool` 且带 `tool_call_id` 写回消息数组 → **再次**请求 `/api/chat`。
3. 循环直至返回纯文本 `content`。Chat 失败、解析失败、工具 API 失败分别 `catch`，在对话流中插入可读说明，并配合根级 `ErrorBoundary` 防止白屏。

## 4. 与题目、Mock 的衔接

- **Vite 代理**：开发态 `/api` → `http://localhost:3001`，与题目 Mock Server 一致；提交前需同时起前端与 `attachments/mock-server`。
- **工单状态文案**：与题目「待派单 / 已派单 / 处理中 / 已完成」对齐（常量 `WORK_ORDER_STATUSES`），与后端枚举 `pending` / `assigned` / `in_progress` / `completed` 一一对应。
- **Mock Server 扩展**：为改善对话体验，在 `server.js` 中增加了对简短肯定语（如「需要」）承接上一句「是否创建工单」的启发式回复；若招聘方要求「零改动附件」，可在面试说明中标注该点（题目亦允许在说明中写明对 mock 的扩展）。

## 5. 主要权衡取舍

| 取舍 | 说明 |
|------|------|
| 统计区与列表区各拉一次设备 | 多一次 HTTP，但筛选逻辑留在 `DeviceList`，`App` 只负责当前楼栋全量设备供 `DeviceStats`，结构更简单。 |
| 工单详情内本地 `wo` state + `onUpdated` 回写列表 | 避免整表重拉即可更新一行；关闭详情后列表已与后端一致。 |
| `deviceApi.getAll` 手写 `URLSearchParams` | 避免 `type=undefined` 被序列化导致 Mock 过滤结果为空（真实踩坑）。 |
| 样式以 inline + **MUI**（`Box` / `Tabs` / `Button`）为主，图标保留自研 `src/icons` | 减少全局 CSS，布局与主题通过 `ThemeProvider` 统一主色。 |

## 6. 本地运行与构建（交付物 1）

1. 终端 A：`cd attachments/mock-server && npm install && node server.js`（端口 3001）。
2. 终端 B：项目根目录 `pnpm install && pnpm dev`（或 `npm install && npm run dev`）。
3. 提交前执行 `pnpm run build`（或 `npm run build`）确保 `tsc && vite build` 无报错。
