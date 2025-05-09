// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use config::config_env_init;
use scaffold::template;

mod code_flow;
mod combiner;
mod config;
mod divider;
mod fusion;
mod inspector;
mod reflector;
mod scaffold;
mod user;
mod utils;
mod vestige;
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
            utils::directory::open_directory,
            utils::list_rtfs,
            scaffold::scaffold_generate,
            scaffold::get_projects,
            scaffold::skeleton_generate,
            scaffold::build_root_path,
            scaffold::open_directory_with_root,
            scaffold::list_task_items,
            scaffold::save_trace,
            scaffold::read_trace,
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
            fusion::top::config_infer,
            fusion::top::top_info,
            fusion::config::list_configs,
            fusion::config::find_config,
            fusion::config::save_config,
            fusion::config::remove_config,
            fusion::fusion::run_fusion_task,
            fusion::fusion::clean_fusion_task,
            fusion::fusion::fetch_log,
            fusion::fusion::fetch_progress,
            fusion::fusion::fetch_previous_log,
            reflector::read_db,
            reflector::render_acrf,
            reflector::save_db_config,
            reflector::list_db_config,
            reflector::get_db_config,
            reflector::remove_db_config,
            inspector::v2::list_products,
            inspector::v2::inspect_summary,
            inspector::v2::log_detail,
            inspector::v2::qc_detail,
            inspector::v2::open_qc_file,
            inspector::v2::sequence_detail,
            inspector::v2::config_root,
            inspector::v2::config_illation,
            inspector::v2::list_historical_trials,
            inspector::v2::create_history,
            vestige::client::list_histories,
            vestige::client::save_history,
            vestige::client::remove_histories,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
