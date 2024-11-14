use std::path::{Path, PathBuf};

use fusion::top::{read_top, Top};
use serde::Serialize;

const DEFAULT_OUTPUT_DIR: &str = r"product\output";
const DEFAULT_DESTINATION: &str = r"combined";
const DETAULT_TOP_DIR: &str = r"utility";

#[derive(Debug, Serialize)]
pub struct InferConfig {
    output: PathBuf,
    top: Vec<PathBuf>,
    destination: PathBuf,
}

#[tauri::command]
pub fn top_info(filepath: String) -> Result<Vec<Top>, String> {
    let filepath = Path::new(&filepath);
    let top = read_top(filepath);
    match top {
        Ok(data) => Ok(data),
        Err(err) => Err(err.to_string()),
    }
}

#[tauri::command]
pub fn config_infer(dir: String) -> Result<Option<InferConfig>, String> {
    if let Some(index) = dir.find(DEFAULT_OUTPUT_DIR) {
        let root = Path::new(dir.get(0..index).unwrap());
        let mut top = vec![];
        let top_dir = root.join(DETAULT_TOP_DIR);
        if top_dir.exists() && top_dir.is_dir() {
            match top_dir.read_dir() {
                Ok(dir) => {
                    for file in dir {
                        let filename = file.unwrap().file_name();
                        let filename = filename.to_string_lossy();
                        if filename.ends_with(".xlsx") && filename.to_lowercase().contains("top") {
                            top.push(top_dir.join(filename.to_string()));
                        }
                    }
                }
                Err(err) => return Err(err.to_string()),
            };
        }
        Ok(Some(InferConfig {
            output: root.join(DEFAULT_OUTPUT_DIR),
            top,
            destination: root.join(DEFAULT_OUTPUT_DIR).join(DEFAULT_DESTINATION),
        }))
    } else {
        Ok(None)
    }
}
