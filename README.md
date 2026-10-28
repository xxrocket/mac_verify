# mac_verfiy

验证 macOS 编译链的最小项目集：Tauri v2（Rust + TS）与 Go Hello World。

## 机器与编译链（每台机器一节，后续在此追加）

### H29X7472FN

- 机型：MacBook Pro，Apple M4 Max
- 架构：arm64（aarch64）
- 序列号：H29X7472FN
- macOS：26.3.1（Build 25D2128）
- 产物目录：`H29X7472FN_m4max_26.3.1_25D2128/`
- Xcode：26.5（Build 17F42）
- macOS SDK：26.5（MacOSX26.5.sdk，ProductBuildVersion 25F70）
- Apple clang：21.0.0（clang-2100.1.1.101，target arm64-apple-darwin25.3.0）
- ld：ld-1267（BUILD 18:30:29 Apr 22 2026）
- rustc：1.89.0（29483883e 2025-08-04，host aarch64-apple-darwin）
- cargo：1.89.0（c24e10642 2025-06-23）
- Node：v20.10.0（darwin-arm64，npm 10.2.3）
- Go：go1.25.4（darwin/arm64）
- 编译选项（Go）：`go build -trimpath -buildvcs=false`（剔除 VCS 与路径信息）
- 编译选项（Rust）：`RUSTFLAGS="--remap-path-prefix=$HOME/.cargo=/build/.cargo --remap-path-prefix=$HOME/.rustup=/build/.rustup --remap-path-prefix=$HOME=/build"`，release profile（`npx tauri build`，机器相关路径全部改写为 /build）
- 构建产物 `go-hello`：sha256 前 16 位 `ed21bdd3b4c00ec1`（`-trimpath -buildvcs=false`，无 VCS/路径信息）
- 构建产物 `rust-mac-verify-tauri`：sha256 前 16 位 `85a93ede2f51d025`（Xcode 26.5 构建，`--remap-path-prefix` 剔除绝对路径，全量重建比特级一致）
- 校验：Xcode 26.5 (17F42) 与 26.6 (17F113) 各自 `cargo clean` 全量构建，产物 sha256 完全一致（85a93ede…；clang-2100.1.1.101 / SDK 25F70 / ld-1267 两版本相同，仅 ld 构建日期不同但不影响输出）；本机构建时用 `DEVELOPER_DIR=/Applications/Xcode-26.5.app/Contents/Developer` 指定 26.5
- 提交：`go-hello` 完整 sha256 见提交 `354cb50`，`rust-mac-verify-tauri` 完整 sha256 见提交 `da21738`

## 目录结构

- `rust/` — Tauri v2 最小应用：Rust 端两个 command（`greet` / `host_info`），前端为 vanilla TS（vite 5），通过 IPC 调 Rust 显示 os/arch
- `go/` — Hello World，打印 GOOS / GOARCH / Go 版本
- `H29X7472FN_m4max_26.3.1_25D2128/` 等以 SN 命名的目录 — 各构建机的二进制产物（仅两个可执行文件）

## 构建

Node / Go 装在 `~/.local/opt/` 下（`node-v20.10.0-darwin-arm64`、`go1.25.4`），rustc 1.89.0 为 rustup 默认工具链。

```bash
export PATH="$HOME/.cargo/bin:$HOME/.local/opt/node-v20.10.0-darwin-arm64/bin:$HOME/.local/opt/go1.25.4/bin:$PATH"

# Go（两台机器统一在 ~/code/test_temp 编译；-buildvcs=false 不嵌 VCS 信息，-trimpath 去掉路径信息）
mkdir -p ~/code/test_temp
cp go/go.mod go/main.go ~/code/test_temp/
cd ~/code/test_temp && go build -trimpath -buildvcs=false -o go-hello . && ./go-hello

# Tauri（若 xcode-select 默认不是 Xcode 26.5，先指定：
#   export DEVELOPER_DIR=/Applications/Xcode-26.5.app/Contents/Developer
# 三条 remap 显式覆盖 ~/.cargo、~/.rustup，并用 $HOME 兜底其余主目录路径，机器相关路径全部改写为 /build；
# cargo 的 trim-paths 在 1.89 尚未稳定故不用。DMG 需在终端授予「自动化控制 Finder」权限后才能打）
cd ../rust && RUSTFLAGS="--remap-path-prefix=$HOME/.cargo=/build/.cargo --remap-path-prefix=$HOME/.rustup=/build/.rustup --remap-path-prefix=$HOME=/build" npx tauri build --bundles app
```

## 版本约束说明

- rustc 1.89 编不过最新的 tauri 2.12（MSRV 要求 1.90）：`Cargo.lock` 已用 MSRV 兼容解析锁定依赖（tauri 2.11.6），如需重新生成：

  ```bash
  cd rust/src-tauri
  CARGO_RESOLVER_INCOMPATIBLE_RUST_VERSIONS=fallback cargo generate-lockfile
  ```

- npm 侧 `@tauri-apps/api` 固定 `~2.11.0`，需与 Rust crate 的 minor 版本对齐，否则 tauri CLI 直接报错
- Node 20.10.0 只能配 vite ^5（vite 7 要求 Node ≥ 20.19）
