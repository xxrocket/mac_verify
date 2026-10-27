import { invoke } from "@tauri-apps/api/core";

const hostInfo = document.querySelector<HTMLSpanElement>("#host-info")!;
const nameInput = document.querySelector<HTMLInputElement>("#name-input")!;
const greetBtn = document.querySelector<HTMLButtonElement>("#greet-btn")!;
const greetResult = document.querySelector<HTMLParagraphElement>("#greet-result")!;

// Ask the Rust backend for os/arch to prove the IPC bridge works.
async function loadHostInfo(): Promise<void> {
  const info = await invoke<{ os: string; arch: string }>("host_info");
  hostInfo.textContent = `${info.os} / ${info.arch}`;
}

greetBtn.addEventListener("click", async () => {
  const name = nameInput.value.trim() || "macOS";
  greetResult.textContent = await invoke<string>("greet", { name });
});

void loadHostInfo();
