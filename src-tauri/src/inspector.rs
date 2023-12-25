use std::path::Path;

use inspector::Inspector;

#[tauri::command]
pub fn inspect(dir: String) -> String {
    let mut inspector = Inspector::new();
    inspector.collect(Path::new(&dir)).unwrap();
    inspector.status().unwrap()
}
