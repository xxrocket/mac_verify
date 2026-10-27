use serde::Serialize;

#[derive(Serialize)]
struct HostInfo {
    os: &'static str,
    arch: &'static str,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {name}! You've been greeted from Rust 🦀")
}

#[tauri::command]
fn host_info() -> HostInfo {
    HostInfo {
        os: std::env::consts::OS,
        arch: std::env::consts::ARCH,
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, host_info])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
