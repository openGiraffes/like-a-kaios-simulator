# Like a KaiOS Simulator

Windows / WinForms 模拟器，使用原有 **Gecko 45 + GeckoFX 45（x86）**。移植 KE 的 KaiOS polyfill 和共享资源，通过 C# 宿主桥接实现文件、网络、设置和应用管理；不包含 Electron、Chromium 或 WebView2 运行内核。

## 使用

运行 `KaiosSim.exe`，导入 ZIP、manifest、HTML 或应用目录，也可拖入窗口。ZIP 解压到独立安装目录；目录和单文件导入直接引用源码，刷新即可查看修改。同一 manifest id / origin（没有时使用名称）视为应用更新。

应用库提供搜索、启动、移除和 SD 卡目录入口。可选择 KaiOS 2.5 或 3.x / 4.x **API 配置**；两种配置都由 Gecko 45 渲染，不代表升级浏览器内核。

运行窗口提供旋转、分辨率、100% / 150% / 200% 缩放、虚拟键盘和日志。F1 / F2 为软键，方向键和 Enter 为导航，Esc 返回，文本框中 Backspace 正常删除；F5 刷新，F12 开关日志。通知显示在底部状态栏，点击可触发应用的通知回调。返回键先交给应用处理，再返回浏览器历史；挂断关闭应用。状态栏遵循 manifest 的 fullscreen / hidden / overlap 设置。

应用列表、设置、Gecko profile 和独立 SD 卡位于程序旁 `data/simulator`；安装目录不可写时使用 `%LOCALAPPDATA%/LikeAKaiosSimulator`。更新应用保留数据；移除记录保留原始文件和 SD 卡。旧 `config.json` 历史记录首次启动时迁移，旧浏览器 profile 不自动覆盖。

## 构建

安装 VS2022 的 .NET 桌面开发组件和 .NET Framework 4.5 targeting pack。PowerShell：

```powershell
.\tools\build-windows.ps1
```

脚本从 NuGet 还原原项目依赖，以 Release / x86 构建到 `artifacts/windows-gecko45`。所有配置固定 x86，以匹配现有 Gecko 原生 DLL；Windows ARM64 通过系统的 x86 兼容运行。

生成的 JavaScript 已包含在仓库中，普通 Windows 构建不需要 Node。修改补丁适配层后执行：

```sh
npm --prefix tools/polyfill ci
npm --prefix tools/polyfill run build
npm --prefix tools/polyfill test
```

`Polyfills/upstream/kaios-polyfill.js` 是 KE 原文件。`tools/polyfill/build.js` 保留原文件，只在生成时适配模块依赖、Gecko 只读属性、严格模式块函数和重复按键派发，并转译主补丁与共享脚本为 ES5。`adapter.js` 将 Node/Electron API 调用替换为本地 C# 桥接；代码中的 `electron` 模块名只是兼容接口，不会加载 Electron。

## 验证

登录 Windows 桌面后运行：

```powershell
.\tools\test-windows.ps1
```

测试为 legacy / new 分别创建隔离 profile 和数据目录，启动真实 Gecko 窗口，验证 API、按键、设置、SD 卡、TCP/UDP、应用身份、远程 iframe 提前注入、虚拟应用 origin 的双向消息、虚拟键盘向焦点 iframe 派发、共享资源和广告 SDK 路由、两种通知的点击回调，以及 ZIP 更新、路径检查和持久化。Windows ARM64 上 x86 Gecko 冷启动有时较慢，整体测试超时为 90 秒。GeckoFX 内部 ChromeContext 使用 alert.xul 初始化，日志中的 window.arguments / NS_ERROR_NOT_IMPLEMENTED 警告不能单独判定为应用启动失败。结果写到构建目录的 `smoke-legacy.json`、`smoke-new.json`。通过 Parallels 以 SYSTEM 执行时，脚本使用临时交互计划任务，测试结束后删除任务。

Store 启动适配包括：补齐 Gecko 嵌入环境缺少的 ServiceWorker 容器、在远程页面脚本之前加载补丁、将 manifest 声明的设备 origin 与本地父窗口进行双向消息映射，以及将新版 `scrollIntoView(options)` 转为 Gecko 45 支持的调用。ServiceWorker 仍采用 KE 的被动模拟，不执行真实后台 worker。

## 实现和边界

- 本地回环 HTTP 服务在应用脚本执行前注入补丁；Gecko 文档 observer 为远程文档/iframe 提前注入。共享 Gaia 资源、KaiAds SDK 和本地系统服务路径由 Gecko 请求 observer 路由。
- DeviceStorage、settings、TCP/TLS、UDP、HTTP、随机数/HMAC、安装更新使用真实宿主实现。TCP 保持字节流语义，应用应自行处理分包。
- KE 中的蜂窝网络、SIM、蓝牙、NFC、FM、设备身份、广告和部分系统服务仍是模拟接口，不是实体硬件实现；未支持的 activity 返回 `NO_PROVIDER`。
- 完整移植 polyfill 不会补齐 Gecko 45 缺失的全部浏览器能力。应用自身使用较新 JS/CSS、WebAssembly 或新版媒体接口时，仍需为 Gecko 45 转译/适配。已用 2780 固件的 KaiOS Store 3.2.0 验证远程目录加载；线上支付接口在当前模拟设备配置下返回 401，付费能力未验证。实体相机、所有 TLS 服务和所有第三方应用没有逐一验证。

KE 来源和许可证见 `THIRD-PARTY-NOTICES.md` 与 `LICENSE`；共享文件内原有版权说明保留。
