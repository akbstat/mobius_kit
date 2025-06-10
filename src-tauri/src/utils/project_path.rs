use serde::Deserialize;
use std::{
    env, fs, io,
    path::{Path, PathBuf},
};

use crate::config;

#[derive(Deserialize)]
pub struct Project<'a> {
    pub product: &'a str,
    pub trial: &'a str,
    pub purpose: &'a str,
}

#[tauri::command]
pub fn project_root_path(project: Project) -> Result<PathBuf, String> {
    let root = root_path()?;
    let project_root = root
        .join(project.product)
        .join(project.trial)
        .join("stats")
        .join(project.purpose);
    Ok(project_root)
}

#[tauri::command]
pub fn output_path(project: Project) -> Result<PathBuf, String> {
    let project_root = project_root_path(project)?;
    let output = project_root.join("product").join("output");
    Ok(output)
}

#[tauri::command]
pub fn latest_arcf_filepath(project: Project) -> Result<Option<PathBuf>, String> {
    let root = root_path()?;
    let acrf_dir = root
        .join(project.product)
        .join(project.trial)
        .join("documents")
        .join("crf");
    Ok(find_latest_acrf(acrf_dir).map_err(|e| e.to_string())?)
}

fn find_latest_acrf<P: AsRef<Path>>(dir: P) -> Result<Option<PathBuf>, io::Error> {
    let mut latest_modified_time = None;
    let mut latest_acrf = None;
    for entry in fs::read_dir(dir)? {
        let entry = entry?;
        let metadata = entry.metadata()?;
        let modified_at = metadata.modified()?;
        let name = entry.file_name();
        if !name.to_string_lossy().to_lowercase().contains("acrf") {
            continue;
        }
        match latest_modified_time {
            Some(latest_modified) => {
                if modified_at.ge(&latest_modified) {
                    latest_modified_time = Some(modified_at);
                    latest_acrf = Some(entry.path());
                }
            }
            None => {
                latest_modified_time = Some(modified_at);
                latest_acrf = Some(entry.path());
            }
        }
    }
    Ok(latest_acrf)
}

fn root_path() -> Result<PathBuf, String> {
    let result = env::var(config::PROJECT_ROOT).map_err(|e| e.to_string())?;
    Ok(Path::new(&result).into())
}
