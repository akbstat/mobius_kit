mod hide_directory;

pub use hide_directory::hide_directory;

use std::process::Command;

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
