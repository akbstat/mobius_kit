use std::path::Path;

// use anyhow::Result;
use inspector::{new_project, Inspector, Param};

#[tauri::command]
pub fn inspect(dir: String) -> Result<String, String> {
    let mut inspector = Inspector::new();
    match inspector.collect(Path::new(&dir)) {
        Ok(()) => {}
        Err(e) => return Err(e.to_string()),
    };
    match inspector.status() {
        Ok(data) => return Ok(data),
        Err(e) => return Err(e.to_string()),
    };
}

// remember to call `.manage(MyState::default())`
#[tauri::command]
pub fn fetch_project(config: String, root: String) -> Result<String, String> {
    let param = Param {
        config: Path::new(&config),
        root: Path::new(&root),
    };
    match new_project(&param) {
        Ok(project) => match serde_json::to_string(&project) {
            Ok(data) => return Ok(data),
            Err(e) => return Err(e.to_string()),
        },
        Err(e) => return Err(e.to_string()),
    };
}
