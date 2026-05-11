# 交付物 4：设计说明

## 项目结构与组件划分

- `App`：整体布局、楼栋选择、Tab（设备看板 / 工单）、AI 助手侧栏开关；顶层按楼栋拉取设备列表供统计区使用。
- 设备域：`DeviceStats`、`DeviceList`、`DeviceDetail`、`FilterDropdown` 等，列表内自行按楼栋与筛选条件请求设备，与统计区职责分离但数据同源接口。
- 工单域：`WorkOrderList`、`WorkOrderDetail`、`CreateWorkOrderModal` 封装列表、详情与创建流程。
- `AIAssistant`：独立侧栏，通过统一 `api` 层访问聊天与业务接口。

## 状态管理方案

未引入 Redux 等全局库。以 **React 内置 `useState` / `useEffect`** 为主：各页面数据在挂载或依赖变化时请求，表单与弹窗状态局部管理。理由：体量适中、数据流以「页面内 CRUD + 单次会话」为主，本地状态足够清晰；减少样板代码与配置成本，便于阅读与交接。

## AI 对话与 Tool Calling 流程

用户发送消息后，将历史（含 `user` / `assistant` / `tool` 角色）组装为 `ChatMessage[]` 调用 `POST /api/chat`。若响应含 `tool_calls`，则对每项解析 `function.name` 与参数，在前端执行对应分支（查询设备、查询告警、创建工单），把 JSON 字符串结果以 `role: tool` 且带 `tool_call_id` 的消息追加回会话，再次请求 chat，直至返回纯文本 `content`。循环中通过消息列表展示「正在查询设备…」等中间态，并在异常时追加友好错误文案，避免静默失败。

## 主要权衡

- 统计区与列表区各自请求设备：略增请求次数，但避免强耦合、筛选逻辑可留在列表组件内。
- Mock 与真实后端均走 `/api` 相对路径，由 Vite 代理到 `localhost:3001`，部署时需同源或反向代理配套说明。
