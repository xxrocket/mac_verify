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
- 编译选项（Go）：
  - 命令：`cd ~/code/test_temp && go build -trimpath -buildvcs=false -o go-hello .`（PATH 前缀 `~/.local/opt/go1.25.4/bin`）
  - 生效参数（`go version -m` 记录）：`-buildmode=exe`、`-compiler=gc`、`-trimpath=true`、`-buildvcs=false`（无 vcs 记录）、`CGO_ENABLED=1`、`GOOS=darwin`、`GOARCH=arm64`、`GOARM64=v8.0`
  - 模块：`macverify/hello`（无第三方依赖，Go 内部链接器）
- 编译选项（Rust）：
  - 前置：`rustup component remove rust-src`（若装了；避免标准库以本机 `~/.rustup/.../library/` 路径嵌入——未装时用官方预编译的 `/rustc/<hash>/library/`，两台机器必须一致）
  - remap 规则顺序敏感：rustc 取**最后匹配**的规则，必须通用在前、registry 目录规则放最后，否则各机不同的 registry 目录名（如 `index.crates.io-xxxx` / `security-jfrog.xxx-xxxx`）会留在二进制里导致跨机不一致
  - 命令：
    `REG_RULES=""; for d in "$HOME"/.cargo/registry/src/*/; do REG_RULES="$REG_RULES --remap-path-prefix=$d=/build/registry/"; done`
    `RUSTFLAGS="--remap-path-prefix=$HOME=/build --remap-path-prefix=$HOME/.cargo=/build/.cargo --remap-path-prefix=$HOME/.rustup=/build/.rustup$REG_RULES" npx tauri build --bundles app`
  - 环境：`DEVELOPER_DIR=/Applications/Xcode-26.5.app/Contents/Developer`（cc/clang/ld/SDK 用 Xcode 26.5）；PATH 前缀 `~/.cargo/bin` + `~/.local/opt/node-v20.10.0-darwin-arm64/bin`
  - cargo：1.89.0 `build --release`（host `aarch64-apple-darwin`，无 `--target` 交叉）；工具链由 `rust-toolchain.toml` 钉死（channel 1.89.0，profile minimal）
  - release profile：全默认（`opt-level=3`、`lto=false`、`codegen-units=16`、`panic=unwind`、`debug=0`、strip 未设置）
  - 依赖：严格按 `Cargo.lock`（MSRV 兼容解析锁定，tauri 2.11.6 / 429 个包）
  - 前端：`beforeBuildCommand` 执行 `tsc && vite build`（vite 5.4.21），dist 产物经 `generate_context!` 嵌入二进制
- 构建产物 `go-hello`：sha256 前 16 位 `ed21bdd3b4c00ec1`（`-trimpath -buildvcs=false`，无 VCS/路径信息）
- 构建产物 `rust-mac-verify-tauri`：sha256 前 16 位 `8b608b61dc406095`（Xcode 26.5 构建；remap 剔除绝对路径并把各机不同的 registry 目录名统一为 `/build/registry`；本机未装 rust-src，标准库为官方预编译的 `/rustc/<hash>` 路径）
- 校验：Xcode 26.5 (17F42) 与 26.6 (17F113) 在相同 remap 下全量构建产物比特级一致（85a93ede…；clang-2100.1.1.101 / SDK 25F70 / ld-1267 相同，仅 ld 构建日期不同但不影响输出）；加入 registry 目录名统一（/build/registry）后 sha256 为 8b608b61…；本机构建时用 `DEVELOPER_DIR=/Applications/Xcode-26.5.app/Contents/Developer` 指定 26.5
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
# 前置：若装了 rust-src 先卸载（两台机器需一致）：rustup component remove rust-src
# remap 顺序敏感：rustc 取最后匹配的规则 → 通用在前，registry 目录规则放最后
# （否则各机 registry 目录名不同会留在二进制里）；trim-paths 在 cargo 1.89 未稳定故不用。
# DMG 需在终端授予「自动化控制 Finder」权限后才能打）
cd ../rust/src-tauri && cargo clean && cd ..
REG_RULES=""; for d in "$HOME"/.cargo/registry/src/*/; do REG_RULES="$REG_RULES --remap-path-prefix=$d=/build/registry/"; done
RUSTFLAGS="--remap-path-prefix=$HOME=/build --remap-path-prefix=$HOME/.cargo=/build/.cargo --remap-path-prefix=$HOME/.rustup=/build/.rustup$REG_RULES" npx tauri build --bundles app
```

## 版本约束说明

- rustc 1.89 编不过最新的 tauri 2.12（MSRV 要求 1.90）：`Cargo.lock` 已用 MSRV 兼容解析锁定依赖（tauri 2.11.6），如需重新生成：

  ```bash
  cd rust/src-tauri
  CARGO_RESOLVER_INCOMPATIBLE_RUST_VERSIONS=fallback cargo generate-lockfile
  ```

- npm 侧 `@tauri-apps/api` 固定 `~2.11.0`，需与 Rust crate 的 minor 版本对齐，否则 tauri CLI 直接报错
- Node 20.10.0 只能配 vite ^5（vite 7 要求 Node ≥ 20.19）
