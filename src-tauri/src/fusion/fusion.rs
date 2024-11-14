use std::{
    fs,
    path::{Path, PathBuf},
    sync::{mpsc, Arc, Condvar, Mutex},
    thread,
};

use chrono::Local;
use fusion::{
    config::{param::FusionParam, utils::workspace},
    fusion::{controller::FusionController, logger::Logger, source::Source, state::ShareStates},
};
use lazy_static::lazy_static;

lazy_static! {
    static ref CONTROLLER: Mutex<Option<FusionController>> = Mutex::new(None);
    static ref SHARE_STATE: Mutex<Option<ShareStates>> = Mutex::new(None);
    static ref LOGGER: Mutex<Option<Logger>> = Mutex::new(None);
}

#[tauri::command]
pub fn run_fusion_task(mut param: FusionParam) -> Result<(), String> {
    param.fix().unwrap();

    // general
    let id = param.id.clone();
    let workspace = match workspace(id) {
        Ok(p) => p,
        Err(err) => return Err(err.to_string()),
    };
    let log_path = init_log_directory(&workspace);
    let is_convert_complete = Arc::new(Mutex::new(false));
    let source = Source::new(&workspace).unwrap();
    let convert_tasks = source.filter_convert_tasks(&param.to_convert_task(&workspace).unwrap());
    let (pdf_combine_config, rtf_combine_config) = param.to_combine_config(&workspace).unwrap();
    source.update_source(&param.source).unwrap();

    // init channels
    let combine_stage_notifier = Arc::new(Condvar::new());
    let (convert_tx, convert_rx) = mpsc::channel();
    let convert_tx = Arc::new(Mutex::new(convert_tx));
    let (combine_tx, combine_rx) = mpsc::channel();
    let combine_tx = Arc::new(Mutex::new(combine_tx));
    let (log_tx, log_rx) = mpsc::channel();
    let log_tx = Arc::new(Mutex::new(log_tx));

    // init share state
    let share_state = ShareStates::new(
        convert_tasks.len(),
        pdf_combine_config.len() + rtf_combine_config.len(),
        convert_rx,
        combine_rx,
        Arc::clone(&combine_stage_notifier),
    );
    *(SHARE_STATE.lock().unwrap()) = Some(share_state);

    // init logger
    let logger = match Logger::new(log_rx, &log_path) {
        Ok(l) => l,
        Err(err) => return Err(err.to_string()),
    };
    *(LOGGER.lock().unwrap()) = Some(logger);

    // init fusion controller
    let controller = match FusionController::new(&param) {
        Ok(c) => c,
        Err(err) => return Err(err.to_string()),
    };
    *(CONTROLLER.lock().unwrap()) = Some(controller);

    thread::spawn(move || {
        let pdf_config = &pdf_combine_config
            .into_iter()
            .map(|config| {
                let name = config
                    .destination
                    .file_stem()
                    .unwrap()
                    .to_string_lossy()
                    .to_string();
                let config = config.write_config(&config.workspace()).unwrap();
                (name, config)
            })
            .collect::<Vec<(String, PathBuf)>>();
        let rtf_config = &rtf_combine_config
            .into_iter()
            .map(|config| {
                (
                    config.destination,
                    config.files.into_iter().map(|file| file.path).collect(),
                )
            })
            .collect::<Vec<(PathBuf, Vec<PathBuf>)>>();

        if let Some(c) = CONTROLLER.lock().unwrap().as_ref() {
            c.convert(&convert_tasks, convert_tx, Arc::clone(&log_tx))
                .ok();
            let mut is_convert_complete = is_convert_complete.lock().unwrap();
            while *is_convert_complete {
                is_convert_complete = combine_stage_notifier.wait(is_convert_complete).unwrap();
            }
            c.combine(&pdf_config, &rtf_config, combine_tx, log_tx).ok();
        }
    });

    Ok(())
}

#[tauri::command]
pub fn fetch_progress() -> Result<f64, String> {
    match SHARE_STATE.lock().unwrap().as_ref() {
        Some(state) => Ok(state.progress().0),
        None => Ok(0f64),
    }
}

#[tauri::command]
pub fn fetch_log() -> Result<String, String> {
    match LOGGER.lock().unwrap().as_ref() {
        Some(logger) => match logger.read() {
            Ok(content) => Ok(content),
            Err(err) => Err(err.to_string()),
        },
        None => Ok("".into()),
    }
}

#[tauri::command]
pub fn clean_fusion_task() {
    clean();
}

fn clean() {
    SHARE_STATE.lock().unwrap().take();
    LOGGER.lock().unwrap().take();
    CONTROLLER.lock().unwrap().take();
}

fn init_log_directory(workspace: &Path) -> PathBuf {
    let parent = workspace.join("log");
    if !parent.exists() {
        fs::create_dir_all(&parent).expect("Error: failed to create log directory");
    }
    let filename = Local::now()
        .to_string()
        .get(0..19)
        .unwrap()
        .replace(":", "-")
        .replace(" ", "-");
    parent.join(filename)
}
