#[cfg(feature = "prod")]
const IS_PROD: bool = true;

#[cfg(feature = "test")]
const IS_PROD: bool = false;

#[tauri::command]
pub fn is_prod_env() -> bool {
    IS_PROD
}
