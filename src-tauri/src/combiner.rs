use std::path::PathBuf;

const TARGET_FILE_PATH: &str = r"CombinePDF\Final.pdf";

#[tauri::command]
pub fn get_target_file_path(directory: &str) -> String {
    let mut result = String::new();
    let dir = PathBuf::from(directory);
    if !dir.exists() {
        return result;
    }
    // dir = dir;
    result = dir.join(TARGET_FILE_PATH).to_string_lossy().to_string();
    result
}

// #[tauri::command]
// pub fn open_file(path: &str) {
//     Command::new("cmd")
//         .arg("/C")
//         .arg("start")
//         .arg(path)
//         .output()
//         .unwrap();
// }
