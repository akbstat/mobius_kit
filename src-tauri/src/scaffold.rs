use std::{
    env,
    path::{Path, PathBuf},
    str::FromStr,
};

use scaffold::{Generator, Group, Kind, Param};
use serde::{Deserialize, Serialize};

const TEMPLATE_DIR: &str = r"\\180.0.0.1\Data\Utility\tools\MobiusKit\scaffold\template";

#[tauri::command]
pub fn scaffold_generate(param: String) -> Result<(), String> {
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
            },
        ) {
            Ok(_) => {}
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
            },
        ) {
            Ok(_) => {}
            Err(e) => return Err(e.to_string()),
        }
    }
    Ok(())
}

fn kind_match(k: &str) -> Kind {
    if k.eq("SDTM") {
        return Kind::SDTM;
    } else if k.eq("ADaM") {
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
}

fn get_template_dir() -> PathBuf {
    if let Ok(dir) = env::var("TEMPLATE_DIR") {
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
