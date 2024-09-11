use std::{env, path::Path};

use scaffold::{Kind, Version, VersionManager, VersionManagerParam};
use serde::Serialize;

use crate::config::{PRIVATE_TEMPLATE, TEMPLATE};

#[tauri::command]
pub fn list_templates(kind: Kind) -> Result<ListTemplateReply, String> {
    let manager = init_manager(&kind);
    match manager.list_templates() {
        Ok(versions) => Ok(ListTemplateReply { data: versions }),
        Err(err) => Err(err.to_string()),
    }
}

#[tauri::command]
pub fn read_template(version: Version, kind: Kind) -> Result<ReadTemplateReply, String> {
    let manager = init_manager(&kind);
    match manager.read_template(&version) {
        Ok(template) => Ok(ReadTemplateReply {
            data: String::from_utf8(template).unwrap(),
        }),
        Err(err) => Err(err.to_string()),
    }
}

#[tauri::command]
pub fn save_template(version: Version, kind: Kind, template: String) -> Result<(), String> {
    let manager = init_manager(&kind);
    match manager.save_template(&version, template.as_bytes()) {
        Ok(_) => Ok(()),
        Err(err) => Err(err.to_string()),
    }
}

fn init_manager(kind: &Kind) -> VersionManager {
    let offical =
        env::var(TEMPLATE).expect(&format!("Error: missing environment variable {}", TEMPLATE));
    let private = env::var(PRIVATE_TEMPLATE).expect(&format!(
        "Error: missing environment variable {}",
        PRIVATE_TEMPLATE
    ));
    let offical_path = Path::new(&offical);
    let private_path = Path::new(&private);
    VersionManager::new(&VersionManagerParam {
        offical_path,
        private_path,
        kind: kind.to_owned(),
    })
}

#[derive(Debug, Serialize)]
pub struct ListTemplateReply {
    data: Vec<Version>,
}

#[derive(Debug, Serialize)]
pub struct ReadTemplateReply {
    data: String,
}
