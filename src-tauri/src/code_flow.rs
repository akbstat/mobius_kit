use std::path::Path;

use code_flow::{convert_to_utf8bom, list_files};

#[tauri::command]
pub fn list_file_tree(path: String) -> Result<String, String> {
    let result = list_files(Path::new(&path));
    match result {
        Ok(files) => match serde_json::to_string(&files) {
            Ok(data) => Ok(data),
            Err(err) => Err(err.to_string()),
        },
        Err(err) => Err(err.to_string()),
    }
}

#[tauri::command]
pub fn convert(path: Vec<String>) -> Result<(), String> {
    let mut paths = vec![];
    path.iter().for_each(|p| {
        let p = Path::new(p);
        paths.push(p);
    });
    match convert_to_utf8bom(&paths) {
        Ok(_) => Ok(()),
        Err(err) => Err(err.to_string()),
    }
}
