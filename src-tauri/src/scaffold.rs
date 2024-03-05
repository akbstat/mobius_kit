use std::{
    env,
    path::{Path, PathBuf},
    str::FromStr,
};

use scaffold::{FileResult, Generator, Group, Kind, Param};
use serde::{Deserialize, Serialize};

const TEMPLATE_DIR: &str = r"\\180.0.0.1\Data\Utility\tools\MobiusKit\scaffold\template";

#[tauri::command]
pub fn scaffold_generate(param: String) -> Result<String, String> {
    let mut result = GenerateResult::default();
    let param: Parameter = serde_json::from_str(&param).unwrap();
    let config = Path::new(&param.config);
    let kind = kind_match(&param.kind);
    let generator = match Generator::new(config, get_template_dir().as_path(), kind) {
        Ok(g) => g,
        Err(e) => return Err(e.to_string()),
    };
    if param.dev {
        match generator.render(
            Path::new(&param.dev_dest),
            &Param {
                study: param.project.clone(),
                engine: param.engine.clone(),
                group: Group::Dev,
                custom_code: param.custom_code.clone(),
            },
        ) {
            Ok(data) => result.dev = data,
            Err(e) => return Err(e.to_string()),
        }
    }
    if param.qc {
        match generator.render(
            Path::new(&param.qc_dest),
            &Param {
                study: param.project.clone(),
                engine: param.engine.clone(),
                group: Group::Qc,
                custom_code: param.custom_code.clone(),
            },
        ) {
            Ok(data) => result.qc = data,
            Err(e) => return Err(e.to_string()),
        }
    }
    Ok(serde_json::to_string(&result).unwrap())
}

fn kind_match(k: &str) -> Kind {
    if k.eq("SDTM") {
        return Kind::SDTM;
    }
    if k.eq("ADaM") {
        return Kind::ADAM;
    }
    Kind::TFL
}

#[derive(Debug, Serialize, Deserialize)]
struct Parameter {
    pub project: String,
    pub engine: String,
    pub config: String,
    pub kind: String,
    pub dev: bool,
    pub qc: bool,
    pub dev_dest: String,
    pub qc_dest: String,
    pub custom_code: String,
}

#[derive(Debug, Serialize, Deserialize, Default)]
struct GenerateResult {
    pub dev: Vec<FileResult>,
    pub qc: Vec<FileResult>,
}

fn get_template_dir() -> PathBuf {
    if let Ok(dir) = env::var("MK_TEMPLATE") {
        let p = Path::new(&dir);
        if p.exists() && p.is_dir() {
            PathBuf::from(p)
        } else {
            PathBuf::from_str(TEMPLATE_DIR).unwrap()
        }
    } else {
        PathBuf::from_str(TEMPLATE_DIR).unwrap()
    }
}
