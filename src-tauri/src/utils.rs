pub mod directory;
pub mod env;
pub mod project_path;
mod rtf;

pub use directory::hide_directory;

use std::{os::windows::process::CommandExt, path::Path, process::Command};

#[tauri::command]
pub fn open_file(path: &str) -> Result<(), String> {
    if !Path::new(path).exists() {
        return Err(format!("File {} does not exist", path));
    }
    let mut cmd: Command = Command::new("powershell");
    cmd.creation_flags(0x08000000);
    // use powershell instead of cmd to fix spaces issue in filename
    match cmd
        .arg("/C")
        .arg("start")
        .arg(format!("\"{}\"", path))
        .output()
    {
        Ok(_) => Ok(()),
        Err(err) => Err(format!("{:?}", err)),
    }
}

#[tauri::command]
pub fn list_rtfs(dir: String) -> Result<Vec<rtf::Rtf>, String> {
    match rtf::list_rtfs(Path::new(&dir)) {
        Ok(data) => Ok(data),
        Err(err) => Err(err.to_string()),
    }
}
