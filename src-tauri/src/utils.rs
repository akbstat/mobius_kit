pub mod directory;
mod rtf;

pub use directory::hide_directory;

use std::{path::Path, process::Command};

#[tauri::command]
pub fn open_file(path: &str) -> Result<(), String> {
    match Command::new("cmd")
        .arg("/C")
        .arg("start")
        .arg(path)
        .output()
    {
        Ok(_) => Ok(()),
        Err(err) => Err(format!("{:?}", err)),
    }
}

// remember to call `.manage(MyState::default())`
#[tauri::command]
pub fn list_rtfs(dir: String) -> Result<Vec<rtf::Rtf>, String> {
    match rtf::list_rtfs(Path::new(&dir)) {
        Ok(data) => Ok(data),
        Err(err) => Err(err.to_string()),
    }
}
