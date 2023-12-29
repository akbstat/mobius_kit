// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod combiner;
mod divider;
mod inspector;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            inspector::inspect,
            inspector::fetch_project,
            combiner::get_target_file_path,
            combiner::open_file,
            divider::divide_rtf,
            divider::open_directory,
            divider::list_rtfs,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
