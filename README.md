# mac_verfiy

验证 macOS 编译链的最小项目集：Tauri v2（Rust + TS）与 Go Hello World。

## 机器与编译链（每台机器一节，后续在此追加）

### H29X7472FN

- 机型：MacBook Pro，Apple M4 Max
- 架构：arm64（aarch64）
- 序列号：H29X7472FN
- macOS：26.3.1（Build 25D2128）
- 产物目录：`H29X7472FN_m4max_26.3.1_25D2128/`
- Xcode：26.6（Build 17F113）
- macOS SDK：26.5（MacOSX26.5.sdk，ProductBuildVersion 25F70）
- Apple clang：21.0.0（clang-2100.1.1.101，target arm64-apple-darwin25.3.0）
- ld：ld-1267（BUILD Jun 8 2026）
- rustc：1.89.0（29483883e 2025-08-04，host aarch64-apple-darwin）
- cargo：1.89.0（c24e10642 2025-06-23）
- Node：v20.10.0（darwin-arm64，npm 10.2.3）
- Go：go1.25.4（darwin/arm64）
- 构建产物 `go-hello`：sha256 前 16 位 `0004a0d2eb7ca594`（于统一路径 `~/code/test_temp` 编译，不含 VCS/路径信息）
- 构建产物 `rust-mac-verify-tauri`：sha256 前 16 位 `c5993b8cb5dcaff9`
- 提交：`c168e89`（完整 sha256 见此提交信息）

## 目录结构

- `rust/` — Tauri v2 最小应用：Rust 端两个 command（`greet` / `host_info`），前端为 vanilla TS（vite 5），通过 IPC 调 Rust 显示 os/arch
- `go/` — Hello World，打印 GOOS / GOARCH / Go 版本
- `H29X7472FN_m4max_26.3.1_25D2128/` 等以 SN 命名的目录 — 各构建机的二进制产物（仅两个可执行文件）

## 构建

Node / Go 装在 `~/.local/opt/` 下（`node-v20.10.0-darwin-arm64`、`go1.25.4`），rustc 1.89.0 为 rustup 默认工具链。

```bash
export PATH="$HOME/.cargo/bin:$HOME/.local/opt/node-v20.10.0-darwin-arm64/bin:$HOME/.local/opt/go1.25.4/bin:$PATH"

# Go（两台机器统一在 ~/code/test_temp 编译，保证产物无路径差异）
mkdir -p ~/code/test_temp
cp go/go.mod go/main.go ~/code/test_temp/
cd ~/code/test_temp && go build -o go-hello . && ./go-hello

# Tauri（打 .app；DMG 需要在终端里授予「自动化控制 Finder」权限后运行 npx tauri build）
cd ../rust && npx tauri build --bundles app
```

## 版本约束说明

- rustc 1.89 编不过最新的 tauri 2.12（MSRV 要求 1.90）：`Cargo.lock` 已用 MSRV 兼容解析锁定依赖（tauri 2.11.6），如需重新生成：

  ```bash
  cd rust/src-tauri
  CARGO_RESOLVER_INCOMPATIBLE_RUST_VERSIONS=fallback cargo generate-lockfile
  ```

- npm 侧 `@tauri-apps/api` 固定 `~2.11.0`，需与 Rust crate 的 minor 版本对齐，否则 tauri CLI 直接报错
- Node 20.10.0 只能配 vite ^5（vite 7 要求 Node ≥ 20.19）
