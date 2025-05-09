use std::{
    env, fs,
    path::{Path, PathBuf},
    process::Command,
    thread,
};

use scaffold::{
    list_projects, new_reader, read_assignment_from_top, Assignment, ConfigItem, DocumentSkeleton,
    FileResult, Generator, Group, Kind, Param, StatSkeleton, STAT,
};
use serde::{Deserialize, Serialize};

use crate::config;

pub mod template;

const NEW_LINE: char = '\n';

#[tauri::command]
pub fn get_projects() -> Result<String, String> {
    let project_root = env::var(config::PROJECT_ROOT).expect(&format!(
        "expect environment variable: {}",
        config::PROJECT_ROOT
    ));
    let project_root = Path::new(&project_root);
    match list_projects(project_root) {
        Ok(projects) => match serde_json::to_string(&projects) {
            Ok(data) => Ok(data),
            Err(e) => Err(e.to_string()),
        },
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn skeleton_generate(param: String) -> Result<(), String> {
    let param: GenerateSkeletonParam = serde_json::from_str(&param).unwrap();
    let skeleton_document = env::var(config::SKELETON_DOCUMENT).unwrap();
    let skeleton_stat = env::var(config::SKELETON_STAT).unwrap();
    let project_root = env::var(config::PROJECT_ROOT).unwrap();
    let skeleton_document_template = fs::read(Path::new(&skeleton_document)).unwrap();
    let skeleton_document = DocumentSkeleton::new(&skeleton_document_template).unwrap();
    let skeleton_stat_template = fs::read(Path::new(&skeleton_stat)).unwrap();
    let skeleton_stat = StatSkeleton::new(&param.purpose, &skeleton_stat_template).unwrap();
    let project_root = Path::new(&project_root);
    let builder = scaffold::Builder::new(project_root);
    builder
        .set_product_id(&param.product)
        .set_trial_id(&param.trial);
    builder.build(skeleton_document).unwrap();
    builder.build(skeleton_stat).unwrap();
    Ok(())
}

#[tauri::command]
pub fn scaffold_generate(param: Parameter) -> Result<String, String> {
    let config = Path::new(&param.config);
    let kind = kind_match(&param.kind);
    // did not assign task in tfl generation, try to get assignment from top
    let assignment = if Kind::TFL.eq(&kind) && param.assignment.is_empty() {
        if let Ok(assignment) = read_assignment_from_top(&config) {
            assignment
        } else {
            param.assignment
        }
    } else {
        param.assignment
    };
    let mut result = GenerateResult::default();
    let kind = kind_match(&param.kind);
    let generator = match Generator::new(config, kind, assignment, param.force) {
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
                template: param.template.dev,
                path: path_display(&param.dev_dest),
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
                custom_code: param.custom_code,
                template: param.template.qc,
                path: path_display(&param.qc_dest),
            },
        ) {
            Ok(data) => result.qc = data,
            Err(e) => return Err(e.to_string()),
        }
    }
    Ok(serde_json::to_string(&result).unwrap())
}

#[tauri::command]
pub fn build_root_path(param: String) -> Result<String, String> {
    let param: GenerateSkeletonParam = serde_json::from_str(&param).unwrap();
    let project_root = env::var(config::PROJECT_ROOT).unwrap();
    let project_root = Path::new(&project_root)
        .join(param.product)
        .join(param.trial)
        .join(STAT)
        .join(param.purpose);
    Ok(project_root.to_string_lossy().to_string())
}

#[tauri::command]
pub fn open_directory_with_root(path: String) -> Result<(), String> {
    let project_root = env::var(config::PROJECT_ROOT).unwrap();
    let path = Path::new(&project_root).join(path);
    match Command::new("cmd")
        .arg("/C")
        .arg("start")
        .arg(path)
        .output()
    {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn list_task_items(kind: String, path: String) -> Result<Vec<ConfigItem>, String> {
    let reader = new_reader(&kind_match(&kind), Path::new(&path));
    match reader.read(true) {
        Ok(items) => Ok(items),
        Err(err) => Err(err.to_string()),
    }
}

#[tauri::command]
pub fn save_trace(trace: Vec<String>) -> Result<(), String> {
    let trace_file = env::var(config::TRACE).unwrap();
    let trace_file = PathBuf::new().join(trace_file);
    let data = trace.join("\n");
    thread::spawn(move || {
        fs::write(trace_file, data.as_bytes()).unwrap();
    });
    Ok(())
}

#[tauri::command]
pub fn read_trace() -> Result<Vec<String>, String> {
    let trace_file = env::var(config::TRACE).unwrap();
    let trace_file = Path::new(&trace_file);
    match fs::read_to_string(&trace_file) {
        Ok(data) => Ok(data
            .split(NEW_LINE)
            .map(|s| s.to_string())
            .collect::<Vec<_>>()),
        Err(_) => Ok(vec![]),
    }
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

fn path_display(source: &str) -> String {
    let paths = source.split("\\").collect::<Vec<_>>();
    if paths.len().gt(&7) {
        format!("..\\\\{}", paths.get(paths.len() - 7..).unwrap().join("\\"))
    } else {
        source.into()
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Parameter {
    pub project: String,
    pub engine: String,
    pub config: String,
    pub kind: String,
    pub dev: bool,
    pub qc: bool,
    pub dev_dest: String,
    pub qc_dest: String,
    pub custom_code: Vec<String>,
    pub template: Template,
    pub assignment: Vec<Assignment>,
    pub force: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Template {
    pub dev: String,
    pub qc: String,
}

#[derive(Debug, Serialize, Deserialize, Default)]
struct GenerateResult {
    pub dev: Vec<FileResult>,
    pub qc: Vec<FileResult>,
}

#[derive(Debug, Serialize, Deserialize)]
struct GenerateSkeletonParam {
    pub product: String,
    pub trial: String,
    pub purpose: String,
}
