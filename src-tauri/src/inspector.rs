use std::path::Path;

use anyhow::Result;
use inspector::{inspect_adam, inspect_sdtm, inspect_tfls, ProjectDirInfer};

#[tauri::command]
pub fn fetch_sdtm(config: String, root: String) -> Result<String, String> {
    let data = inspect_sdtm(Path::new(&config), Path::new(&root));
    match data {
        Ok(data) => Ok(serde_json::to_string(&data).unwrap()),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn fetch_adam(config: String, root: String) -> Result<String, String> {
    let data = inspect_adam(Path::new(&config), Path::new(&root));
    match data {
        Ok(data) => Ok(serde_json::to_string(&data).unwrap()),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn fetch_tfls(config: String, root: String) -> Result<String, String> {
    let data = inspect_tfls(Path::new(&config), Path::new(&root));
    match data {
        Ok(data) => Ok(serde_json::to_string(&data).unwrap()),
        Err(e) => Err(e.to_string()),
    }
}

// remember to call `.manage(MyState::default())`
#[tauri::command]
pub fn infer_path_sdtm(path: String) -> Result<String, String> {
    let p = ProjectDirInfer::new(Path::new(&path));
    let p = match p {
        Ok(p) => p,
        Err(e) => return Err(e.to_string()),
    };
    match p.sdtm() {
        Ok(data) => Ok(serde_json::to_string(&data).unwrap()),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn infer_path_adam(path: String) -> Result<String, String> {
    let p = ProjectDirInfer::new(Path::new(&path));
    let p = match p {
        Ok(p) => p,
        Err(e) => return Err(e.to_string()),
    };
    match p.adam() {
        Ok(data) => Ok(serde_json::to_string(&data).unwrap()),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn infer_path_tfls(path: String) -> Result<String, String> {
    let p = ProjectDirInfer::new(Path::new(&path));
    let p = match p {
        Ok(p) => p,
        Err(e) => return Err(e.to_string()),
    };
    match p.tfl() {
        Ok(data) => Ok(serde_json::to_string(&data).unwrap()),
        Err(e) => Err(e.to_string()),
    }
}
