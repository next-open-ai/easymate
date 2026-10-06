# EasyMate 单 Pi 产品架构

## 决策

EasyMate 从 Workmate 当前能力基线派生，但作为独立产品维护。它保留会话、数字员工、Skills、Tools、MCP、知识库、本体、应用模型、资产、项目、持续任务、自动化、移动对话与环境清理等业务能力；Agent 执行层只使用进程内 Pi，不提供 AgentScope、DSH 或其他执行引擎的安装、路由和切换入口。

## 运行边界

- `@easymate/agent-core` 的公开执行入口直接调用 Pi runtime。
- API、桌面端和 Web Launcher 固定声明 `EASYMATE_AGENT_ENGINE=pi`。
- 历史 Workmate 数据中可能存在的 `engine` 字段只用于兼容读取，组装运行上下文时始终归一为 `pi`。
- Python 不是 Agent 引擎。它只服务于 Agent 编写的 Python 脚本及可选文档解析增强。

## Python 与安装包尺寸

桌面发布包内置裁剪后的便携 CPython，不预装 AgentScope、Torch、ONNX、Docling 或 MarkItDown。PPTX/PDF/DOCX 的重型增强解析组件由用户在设置中按需安装到 `~/.easymate/components/`；工作区脚本依赖安装到每个工作区的 `.python-packages`，不污染内置 Python。

该分层让基础安装包保持稳定、可离线运行，同时保留 Python 扩展能力。构建流水线通过 `scripts/prepare-python-runtime.mjs` 生成可重建的精简运行时，禁止把开发 `.venv` 或缓存目录提交、复制或打包。

## 产品隔离

- 应用名：EasyMate
- 应用 ID：`com.easymate.desktop`
- npm scope：`@easymate/*`
- CLI：`easymate`
- 数据目录：`~/.easymate`
- 默认界面端口：`49831`
- 默认 API 端口：`49832`
- 桌面协议、IPC、存储键和数据库文件均使用 `easymate` 前缀。

## 扩展策略

未来增强优先通过 Tool、Skill、MCP 和应用模型能力接入；不在 EasyMate 内重新引入第二套 Agent 执行引擎。如果将来确需多引擎产品，应在 Workmate 或新的产品线实现，而不是增加 EasyMate 基础包复杂度。
