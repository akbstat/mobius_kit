// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use config::config_env_init;
use std::ffi::OsString;
use std::os::windows::prelude::*;
use winapi::um::winbase::GetUserNameW;

mod combiner;
mod config;
mod divider;
mod inspector;
mod scaffold;
mod void_probe;

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
            get_current_username,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn get_current_username() -> Result<String, ()> {
    let mut buffer: Vec<u16> = vec![0; 260];
    let mut size = buffer.len() as u32;

    if unsafe { GetUserNameW(buffer.as_mut_ptr(), &mut size as *mut _) } == 0 {
        Err(())
    } else {
        buffer.resize(size as usize, 0);
        unsafe {
            buffer.set_len(size as usize - 1);
        }
        Ok(OsString::from_wide(&buffer).to_string_lossy().to_string())
    }
}
