// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use config::config_env_init;
use scaffold::template;

mod code_flow;
mod combiner;
mod config;
mod divider;
mod inspector;
mod scaffold;
mod user;
mod utils;
mod void_probe;
mod voyager;

fn main() {
    config_env_init().expect("failed to read configration");
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            inspector::fetch_sdtm,
            inspector::fetch_adam,
            inspector::fetch_tfls,
            inspector::infer_path_sdtm,
            inspector::infer_path_adam,
            inspector::infer_path_tfls,
            combiner::get_target_file_path,
            utils::open_file,
            divider::divide_rtf,
            divider::open_directory,
            divider::list_rtfs,
            scaffold::scaffold_generate,
            scaffold::get_projects,
            scaffold::skeleton_generate,
            scaffold::build_root_path,
            scaffold::open_directory_with_root,
            scaffold::list_task_items,
            void_probe::probe,
            void_probe::task_progress,
            void_probe::get_probe_result,
            void_probe::remove_temp_dir,
            void_probe::open_pdf_page,
            void_probe::probe_running,
            user::get_current_username,
            code_flow::list_file_tree,
            code_flow::convert,
            voyager::list_annotations,
            voyager::export_annotations,
            template::list_templates,
            template::read_template,
            template::save_template,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
