# EasyMate 产品基线

## 需求

1. 从 Workmate 最新工作树复制完整业务能力，EasyMate 使用独立品牌、目录、端口和持久化空间。
2. 所有 Agent 任务只通过 Pi 执行，不展示或启动多引擎适配层。
3. 保留 Python 脚本与文档增强能力，但默认安装包不包含重型 Python AI/文档依赖。
4. 旧的多引擎偏好不得改变实际执行结果；运行上下文必须归一为 Pi。

## 验收

- workspace 包名均为 `@easymate/*`，桌面产品名为 EasyMate。
- API 与 renderer 默认端口分别为 `49832` 与 `49831`。
- Agent 执行入口只引用 `pi-runtime`。
- 桌面发布资源包含 `python-runtime`，不包含 `agentscope-runtime` 或 DSH runtime。
- 默认 Python requirements 不包含 AgentScope、Torch、ONNX、Docling、MarkItDown。
- `pnpm typecheck`、`pnpm build` 和品牌/端口回归检查通过。

## 追踪

- 核心执行：`packages/agent-core/src/stream-reply.ts`
- 上下文归一：`apps/api/src/modules/orchestration/context-assembler.ts`
- 桌面打包：`apps/desktop/package.json`、`apps/desktop/scripts/stage.mjs`
- Python 构建：`scripts/prepare-python-runtime.mjs`
- 产品隔离：根 `package.json`、各 workspace manifest、桌面 main/preload、默认端口配置
