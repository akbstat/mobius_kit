use crate::{config, utils::open_file};
use inspector::v2::{
    self,
    inspect::result::{LogResult, QcResult},
    AuditResult, FileType, Group, Investigator, InvestigatorParam, Kind,
};
use lazy_static::lazy_static;
use penelope::extractor::{read_adam_sheet, read_sdtm_sheet, read_tfl_top, TrackerItem};
use serde::{Deserialize, Serialize};
use std::{
    env,
    path::{Path, PathBuf},
};

lazy_static! {
    static ref PROJECT_ROOT: PathBuf = Path::new(
        &env::var(config::PROJECT_ROOT).expect("Error: Invalid project root environment variable")
    )
    .into();
    static ref COMPASS_BASE_URL: String = env::var(config::COMPASS_BASE_URL).unwrap_or_default();
}

#[tauri::command]
pub fn config_root(param: ConfigRootRequest) -> Result<String, String> {
    let ConfigRootRequest {
        product,
        trial,
        purpose,
        kind,
    } = param;
    let root = match kind {
        v2::Kind::SDTM | v2::Kind::ADaM => PROJECT_ROOT
            .as_path()
            .join(product)
            .join(trial)
            .join(r"documents\specs"),
        v2::Kind::TFLs => PROJECT_ROOT
            .as_path()
            .join(product)
            .join(trial)
            .join("stats")
            .join(purpose)
            .join("utility"),
    };
    if root.exists() {
        Ok(root.to_string_lossy().to_string())
    } else {
        Ok("".to_string())
    }
}

#[tauri::command]
pub fn config_illation(param: ConfigRootRequest) -> Result<String, String> {
    let dir = config_root(param.clone())?;
    let dir = Path::new(&dir);
    if !dir.exists() {
        Ok("".to_string())
    } else {
        let mut files = vec![];
        for entry in dir.read_dir().map_err(|e| e.to_string())? {
            let entry = entry.map_err(|e| e.to_string())?;
            if entry.file_type().map_err(|e| e.to_string())?.is_dir() {
                continue;
            }
            let filename = entry.file_name().to_string_lossy().to_lowercase();
            if !filename.ends_with(".xlsx") {
                continue;
            }
            let kind = match param.kind {
                v2::Kind::SDTM => "sdtm",
                v2::Kind::ADaM => "adam",
                v2::Kind::TFLs => "top",
            };
            if filename.contains(kind) && !filename.starts_with("~") {
                let meta = entry.metadata().map_err(|e| e.to_string())?;
                let filepath = entry.path();
                let modified = meta.modified().map_err(|e| e.to_string())?;
                files.push((filepath, modified));
            }
        }
        files.sort_by(|a, b| b.1.cmp(&a.1));
        match files.last() {
            Some((file, _)) => Ok(file.to_string_lossy().to_string()),
            None => Ok("".to_string()),
        }
    }
}

#[tauri::command]
pub fn tracker_illation(param: ConfigRootRequest) -> Result<String, String> {
    let dir = config_root(ConfigRootRequest {
        kind: Kind::TFLs,
        product: param.product.clone(),
        trial: param.trial.clone(),
        purpose: param.purpose.clone(),
    })?;
    let dir = Path::new(&dir);
    if !dir.exists() {
        Ok("".to_string())
    } else {
        let mut files = vec![];
        for entry in dir.read_dir().map_err(|e| e.to_string())? {
            let entry = entry.map_err(|e| e.to_string())?;
            if entry.file_type().map_err(|e| e.to_string())?.is_dir() {
                continue;
            }
            let filename = entry.file_name().to_string_lossy().to_lowercase();
            if !filename.ends_with(".xlsx") {
                continue;
            }
            let kind = match param.kind {
                v2::Kind::SDTM | v2::Kind::ADaM => "tracker",
                v2::Kind::TFLs => "top",
            };
            if filename.to_lowercase().contains(kind) {
                let meta = entry.metadata().map_err(|e| e.to_string())?;
                let filepath = entry.path();
                let modified = meta.modified().map_err(|e| e.to_string())?;
                files.push((filepath, modified));
            }
        }
        files.sort_by(|a, b| b.1.cmp(&a.1));
        match files.last() {
            Some((file, _)) => Ok(file.to_string_lossy().to_string()),
            None => Ok("".to_string()),
        }
    }
}

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

#[tauri::command]
pub fn inspect_summary(param: InspectSunmmaryRequest) -> Result<Vec<v2::InspectionResult>, String> {
    let InspectSunmmaryRequest {
        product,
        trial,
        purpose,
        config,
        kind,
        qc_ignore,
        external_log_patterns,
    } = param;
    let result = v2::inspect(
        &v2::InvestigatorParam {
            product,
            trial,
            purpose,
            root: PROJECT_ROOT.as_path(),
        },
        &config,
        &kind,
        &qc_ignore,
        external_log_patterns,
    )
    .map_err(|err| err.to_string())?;
    Ok(result)
}

#[tauri::command]
pub fn log_detail(param: LogDetailRequest) -> Result<LogResult, String> {
    let LogDetailRequest {
        product,
        trial,
        purpose,
        kind,
        item,
        group,
        external_log_patterns,
    } = param;
    let result = v2::log_detail(
        &v2::InvestigatorParam {
            product,
            trial,
            purpose,
            root: PROJECT_ROOT.as_path(),
        },
        &item,
        &kind,
        &group,
        external_log_patterns,
    )
    .map_err(|e| e.to_string())?;
    Ok(result)
}

#[tauri::command]
pub fn qc_detail(param: QcDetailRequest) -> Result<Vec<QcResult>, String> {
    let QcDetailRequest {
        product,
        trial,
        purpose,
        kind,
        item,
        ignore,
    } = param;
    let result = v2::qc_detail(
        &v2::InvestigatorParam {
            product,
            trial,
            purpose,
            root: PROJECT_ROOT.as_path(),
        },
        &item,
        &kind,
        &ignore,
    )
    .map_err(|e| e.to_string())?;
    Ok(result)
}

#[tauri::command]
pub fn open_qc_file(param: OpenQcFileParam) -> Result<(), String> {
    let OpenQcFileParam {
        product,
        trial,
        purpose,
        kind,
        item,
        supp,
    } = param;
    let invest = Investigator::new(&InvestigatorParam {
        product,
        trial,
        purpose,
        root: PROJECT_ROOT.as_path(),
    });
    let file = match kind {
        v2::Kind::SDTM => {
            if supp {
                invest.sdtm_qc_supp(&item)
            } else {
                invest.sdtm_qc_main(&item)
            }
        }
        v2::Kind::ADaM => invest.adam_qc_result(&item),
        v2::Kind::TFLs => invest.tfl_qc_result(&item),
    };
    if let Some(file) = file {
        open_file(file.filepath.to_str().unwrap())?;
    }
    Ok(())
}

#[tauri::command]
pub fn open_project_file(param: OpenProjectFileParam) -> Result<(), String> {
    let OpenProjectFileParam {
        product,
        trial,
        purpose,
        file,
        kind,
        group,
        file_type,
    } = param;
    let mut subpaths = vec![product, trial, "stats".to_string(), purpose];
    subpaths.push(match group {
        Group::Production => "product".into(),
        Group::Validation => "validation".into(),
    });
    match file_type {
        FileType::Code | FileType::Log => subpaths.push("program".into()),
        FileType::Data | FileType::Xpt => subpaths.push("dataset".into()),
        FileType::Output => subpaths.push("output".into()),
        FileType::Qc => subpaths.push("qc-result".into()),
    }
    match kind {
        Kind::SDTM => subpaths.push("sdtm".into()),
        Kind::ADaM => subpaths.push("adam".into()),
        Kind::TFLs => {
            if FileType::Output.ne(&file_type) {
                subpaths.push("tfl".into())
            }
        }
    }
    subpaths.push(file);
    let filepath = PROJECT_ROOT.join(subpaths.join(r"\"));
    if filepath.exists() {
        open_file(filepath.to_str().unwrap_or_default())?;
    }
    Ok(())
}

#[tauri::command]
pub fn sequence_detail(param: InspectDetailParam) -> Result<Vec<AuditResult>, String> {
    let InspectDetailParam {
        product,
        trial,
        purpose,
        kind,
        supp,
        item,
    } = param;

    Ok(v2::sequence_detail(
        &v2::InvestigatorParam {
            product,
            trial,
            purpose,
            root: PROJECT_ROOT.as_path(),
        },
        &item,
        supp,
        &kind,
    ))
}

#[tauri::command]
pub fn list_historical_trials(user: String) -> Result<Vec<String>, String> {
    if COMPASS_BASE_URL.is_empty() {
        return Ok(vec![]);
    }
    let response = reqwest::blocking::get(format!(
        "{}/api/v1/trail?user={}&top=10",
        *COMPASS_BASE_URL, user
    ))
    .map_err(|e| e.to_string())?;
    let response = response
        .json::<HistoricalTrialReply>()
        .map_err(|e| e.to_string())?;
    Ok(response
        .trails
        .iter()
        .map(|t| format!("{}-{}-{}", t.product, t.trial, t.kind))
        .collect())
}

#[tauri::command]
pub fn create_history(param: CreatHistoryRequest) -> Result<(), String> {
    if COMPASS_BASE_URL.is_empty() {
        return Ok(());
    }
    let client = reqwest::blocking::Client::new();
    client
        .post(format!("{}/api/v1/trail", *COMPASS_BASE_URL))
        .json(&param)
        .send()
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_tracker_information(filepath: String, kind: Kind) -> Result<Vec<TrackerItem>, String> {
    let filepath = Path::new(&filepath);
    match kind {
        Kind::SDTM => read_sdtm_sheet(filepath).map_err(|e| e.to_string()),
        Kind::ADaM => read_adam_sheet(filepath).map_err(|e| e.to_string()),
        Kind::TFLs => read_tfl_top(filepath).map_err(|e| e.to_string()),
    }
}

#[derive(Debug, Deserialize, Clone)]
pub struct ConfigRootRequest {
    product: String,
    trial: String,
    purpose: String,
    kind: v2::Kind,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InspectSunmmaryRequest {
    product: String,
    trial: String,
    purpose: String,
    config: PathBuf,
    kind: v2::Kind,
    qc_ignore: Vec<String>,
    external_log_patterns: Option<v2::ExternalLogPattern>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LogDetailRequest {
    product: String,
    trial: String,
    purpose: String,
    kind: v2::Kind,
    item: String,
    group: Group,
    external_log_patterns: Option<v2::ExternalLogPattern>,
}

#[derive(Debug, Deserialize)]
pub struct QcDetailRequest {
    product: String,
    trial: String,
    purpose: String,
    kind: v2::Kind,
    item: String,
    ignore: Vec<String>,
}

#[derive(Debug, Deserialize)]
pub struct OpenQcFileParam {
    product: String,
    trial: String,
    purpose: String,
    item: String,
    kind: v2::Kind,
    supp: bool,
}

#[derive(Debug, Deserialize)]
pub struct InspectDetailParam {
    product: String,
    trial: String,
    purpose: String,
    kind: v2::Kind,
    item: String,
    supp: bool,
}

#[derive(Debug, Deserialize)]
pub struct HistoricalTrialReply {
    trails: Vec<Trial>,
}

#[derive(Debug, Deserialize)]
pub struct Trial {
    product: String,
    trial: String,
    kind: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreatHistoryRequest {
    product: String,
    trial: String,
    kind: String,
    user: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OpenProjectFileParam {
    product: String,
    trial: String,
    purpose: String,
    file: String,
    kind: v2::Kind,
    file_type: v2::FileType,
    group: Group,
}
