# mac_verfiy

验证 macOS 编译链的最小项目集：Tauri v2（Rust + TS）与 Go Hello World。

## 机器与编译链（每台机器一节，后续在此追加）

### H29X7472FN

机器信息：

- 机型：MacBook Pro，Apple M4 Max
- 序列号：H29X7472FN
- macOS：26.3.1（Build 25D2128）
- 产物目录：`H29X7472FN_m4max_26.3.1_25D2128/`

编译链：

| 组件 | 版本 |
|---|---|
| Xcode | 26.5 (17F42)。注：本机为 26.6 (17F113)，其 clang 与 macOS SDK 与 26.5 完全一致（clang-2100.1.1.101 / SDK 26.5 build 25F70），仅 Swift 编译器不同，对 Rust/Go/C 编译无影响 |
| macOS SDK | 26.5（产物 `LC_BUILD_VERSION` 已验证） |
| Apple clang | 21.0.0 (clang-2100.1.1.101) |
| ld | 1267 |
| rustc | 1.89.0（rustup default + `rust/src-tauri/rust-toolchain.toml` 双重钉死） |
| Node | 20.10.0（npm 10.2.3，官方二进制） |
| Go | 1.25.4（官方二进制） |

构建产物（完整 sha256 见提交信息）：

- `hello`：sha256 前 16 位 `8f8a227c478f7f80`
- `mac-verify-tauri`：sha256 前 16 位 `c5993b8cb5dcaff9`
- 提交：`cb90f8c`

## 目录结构

- `rust/` — Tauri v2 最小应用：Rust 端两个 command（`greet` / `host_info`），前端为 vanilla TS（vite 5），通过 IPC 调 Rust 显示 os/arch
- `go/` — Hello World，打印 GOOS / GOARCH / Go 版本
- `H29X7472FN_m4max_26.3.1_25D2128/` 等以 SN 命名的目录 — 各构建机的二进制产物（仅两个可执行文件）

## 构建

Node / Go 装在 `~/.local/opt/` 下（`node-v20.10.0-darwin-arm64`、`go1.25.4`），rustc 1.89.0 为 rustup 默认工具链。

```bash
export PATH="$HOME/.cargo/bin:$HOME/.local/opt/node-v20.10.0-darwin-arm64/bin:$HOME/.local/opt/go1.25.4/bin:$PATH"

# Go
cd go && go build -o hello . && ./hello

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
