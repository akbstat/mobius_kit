use crate::config::REFLECTOR;
use lazy_static::lazy_static;
use reflector::{
    acrf::builder::{ACrfBuilder, BuildParam},
    config::{config::ConfigList, controller::ConfigController},
    ecrf::ECRF,
    edc::{
        db::{DBStruct, DBStructReader, Form},
        ecollect::{db::EcollectDBStructReader, ecrf::ECollectECRF},
    },
};
use serde::Deserialize;
use std::{
    env,
    path::{Path, PathBuf},
};

lazy_static! {
    static ref REFLECTOR_ROOT: PathBuf = Path::new(&env::var(REFLECTOR).unwrap()).to_path_buf();
}

#[derive(Debug, Deserialize)]
pub struct DBStructParam {
    ecrf: PathBuf,
    db: PathBuf,
}

#[derive(Debug, Deserialize)]
pub struct RenderAcrfParam {
    event: DBStruct,
    source: PathBuf,
    destination: PathBuf,
}

#[tauri::command]
pub fn read_db(param: DBStructParam) -> Result<DBStruct, String> {
    if !param.ecrf.exists() {
        return Ok(DBStruct {
            visit: vec![],
            form: vec![],
            binding: vec![],
        });
    }
    let ecrf = ECollectECRF::new(&param.ecrf).map_err(|e| e.to_string())?;
    let reader = EcollectDBStructReader::new();
    if !param.db.exists() {
        Ok(DBStruct {
            visit: vec![],
            form: ecrf
                .list_forms()
                .iter()
                .enumerate()
                .map(|(i, f)| {
                    let page = ecrf.form_page(f).unwrap_or(0);
                    Form {
                        id: i,
                        name: f.clone(),
                        page,
                        order: i as i32,
                    }
                })
                .collect(),
            binding: vec![],
        })
    } else {
        let db = reader.read(param.db, ecrf).map_err(|e| e.to_string())?;
        Ok(db)
    }
}

#[tauri::command]
pub fn render_acrf(param: RenderAcrfParam) -> Result<(), String> {
    let acrf_outline_bin = std::env::var("MK_ACRF_OUTLINTE_BIN").map_err(|e| e.to_string())?;
    let workspace = param
        .destination
        .parent()
        .ok_or("Error: Invalid workspace".to_string())?
        .to_path_buf();
    let bookmark_bin = Path::new(acrf_outline_bin.as_str());
    ACrfBuilder::new(param.event)
        .build(BuildParam {
            source: &param.source,
            destination: &param.destination,
            workspace: &workspace,
            bookmark_bin: &bookmark_bin.to_path_buf(),
        })
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn save_db_config(
    id: Option<String>,
    name: String,
    config: DBStruct,
) -> Result<String, String> {
    let controller = ConfigController::new(REFLECTOR_ROOT.as_path()).map_err(|e| e.to_string())?;
    let id = controller
        .save_config(id, &name, &config)
        .map_err(|e| e.to_string())?;
    Ok(id)
}

#[tauri::command]
pub fn list_db_config() -> Result<Vec<ConfigList>, String> {
    let controller = ConfigController::new(REFLECTOR_ROOT.as_path()).map_err(|e| e.to_string())?;
    let list = controller.list_config().map_err(|e| e.to_string())?;
    Ok(list)
}

#[tauri::command]
pub fn get_db_config(id: String) -> Result<DBStruct, String> {
    let controller = ConfigController::new(REFLECTOR_ROOT.as_path()).map_err(|e| e.to_string())?;
    let config = controller.get_config(&id).map_err(|e| e.to_string())?;
    Ok(config)
}

#[tauri::command]
pub fn remove_db_config(id: String) -> Result<(), String> {
    let controller = ConfigController::new(REFLECTOR_ROOT.as_path()).map_err(|e| e.to_string())?;
    controller.remove_config(&id).map_err(|e| e.to_string())?;
    Ok(())
}
