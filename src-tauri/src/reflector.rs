use reflector::{
    acrf::builder::{ACrfBuilder, BuildParam},
    edc::{
        db::{DBStruct, DBStructReader},
        ecollect::{db::EcollectDBStructReader, ecrf::ECollectECRF},
    },
};
use serde::Deserialize;
use std::path::{Path, PathBuf};

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
    let ecrf = ECollectECRF::new(&param.ecrf).map_err(|e| e.to_string())?;
    let reader = EcollectDBStructReader::new();
    let db = reader.read(param.db, ecrf).map_err(|e| e.to_string())?;
    Ok(db)
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
