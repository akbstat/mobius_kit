// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod combiner;
mod divider;
mod inspector;
mod scaffold;
mod void_probe;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            inspector::fetch_sdtm,
            inspector::fetch_adam,
            inspector::fetch_tfls,
            inspector::infer_path_sdtm,
            inspector::infer_path_adam,
            inspector::infer_path_tfls,
            combiner::get_target_file_path,
            combiner::open_file,
            divider::divide_rtf,
            divider::open_directory,
            divider::list_rtfs,
            scaffold::scaffold_generate,
            void_probe::probe,
            void_probe::task_progress,
            void_probe::get_probe_result,
            void_probe::remove_temp_dir,
            void_probe::open_pdf_page,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
