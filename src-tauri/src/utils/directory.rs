use std::{error::Error, fs, os::windows::process::CommandExt, path::Path, process::Command};

const HIDE_DIRECTORY_SCRIPT: &str = r#"Option Explicit
Dim fso, folderPath
folderPath = "{.TEMP_DIR}"
Set fso = CreateObject("Scripting.FileSystemObject")
If fso.FolderExists(folderPath) Then
    Dim folder
    Set folder = fso.GetFolder(folderPath)
    folder.Attributes = folder.Attributes + 2 
End If
Set folder = Nothing
Set fso = Nothing"#;

pub fn hide_directory(path: &Path) -> Result<(), Box<dyn Error>> {
    let script_path = path.join("hide.vbs");
    fs::write(
        &script_path,
        HIDE_DIRECTORY_SCRIPT.replace("{.TEMP_DIR}", &path.to_string_lossy()),
    )?;
    let mut cmd = Command::new("cmd");
    cmd.creation_flags(0x08000000);
    cmd.arg("/C").arg(script_path.to_string_lossy().to_string());
    cmd.output()?;
    fs::remove_file(script_path)?;
    Ok(())
}

#[tauri::command]
pub fn open_directory(path: &str) -> Result<(), String> {
    let p = Path::new(path);
    if !p.exists() {
        return Err("Error: Directory does not exist".into());
    }
    match Command::new("cmd")
        .arg("/C")
        .arg("start")
        .arg(path)
        .output()
    {
        Ok(_) => Ok(()),
        Err(err) => Err(err.to_string()),
    }
}

#[cfg(test)]
mod test_hide_directory {
    use super::*;
    #[test]
    fn hide_directory_test() {
        let dir = Path::new(r"D:\Users\yuqi01.chen\.temp");
        hide_directory(dir).unwrap();
    }
}
