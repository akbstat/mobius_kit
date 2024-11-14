use std::sync::Mutex;

use fusion::config::{
    param::FusionParam,
    repo::{Config, ConfigManager, SaveConfigParam},
    utils::fusion_app_root,
};
use lazy_static::lazy_static;

lazy_static! {
    static ref FUSION_CONFIG_REPO: Mutex<ConfigManager> = Mutex::new(init_config_repo());
}

fn init_config_repo() -> ConfigManager {
    ConfigManager::new(&fusion_app_root().expect("Error: invalid fusion app root"))
}

#[tauri::command]
pub fn list_configs() -> Result<Vec<Config>, String> {
    let client = FUSION_CONFIG_REPO.lock().unwrap();
    Ok(client.list_configs())
}

#[tauri::command]
pub fn find_config(id: &str) -> Result<Option<FusionParam>, String> {
    let client = FUSION_CONFIG_REPO.lock().unwrap();
    match client.find_config(id) {
        Ok(param) => Ok(param),
        Err(err) => Err(err.to_string()),
    }
}

#[tauri::command]
pub fn save_config(config: SaveConfigParam, param: FusionParam) -> Result<String, String> {
    let mut client = FUSION_CONFIG_REPO.lock().unwrap();
    match client.save_config(&config, &param) {
        Ok(id) => Ok(id),
        Err(err) => Err(err.to_string()),
    }
}

#[tauri::command]
pub fn remove_config(id: &str) -> Result<(), String> {
    let mut client = FUSION_CONFIG_REPO.lock().unwrap();
    match client.remove_config(id) {
        Ok(()) => Ok(()),
        Err(err) => Err(err.to_string()),
    }
}
