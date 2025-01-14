use std::{env, path::Path};

use inspector::v2;

#[tauri::command]
pub fn list_products() -> Result<Vec<v2::Product>, String> {
    let root = env::var("MK_PROJECT_ROOT").unwrap_or_default();
    let root = Path::new(&root);
    if !root.exists() {
        return Err("Error: Invalid project root directory".into());
    }
    let products = v2::list_products(root).map_err(|err| err.to_string())?;
    Ok(products)
}
