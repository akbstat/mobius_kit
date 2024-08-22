use lazy_static::lazy_static;
use std::collections::HashMap;
use std::env;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use transient::{Worker, WorkerParam};

use super::model::{
    ExtractTranslateReply, ExtractTranslateRequest, FetchLogReply, FetchProgressReply,
    FetchTranslationReply, Translation,
};

lazy_static! {
    static ref WORKER: Mutex<Option<Worker>> = Mutex::new(None);
}

fn init_worker(param: &WorkerParam) {
    let outputs = param
        .outputs
        .into_iter()
        .map(|output| Path::new(&output).into())
        .collect::<Vec<PathBuf>>();
    let worker = Worker::new(&WorkerParam {
        workspace: Path::new(&param.workspace).into(),
        destination_dir: Path::new(&param.destination_dir).into(),
        outputs: &outputs,
        llm_api_key: &param.llm_api_key,
    })
    .unwrap();
    let mut instance = WORKER.lock().unwrap();
    *instance = Some(worker);
}

#[tauri::command]
pub fn extract_translate(param: ExtractTranslateRequest) -> Result<ExtractTranslateReply, String> {
    let llm_api_key = env::var("MK_LLM_API_KEY").expect("api key does not existed in environment");
    let outputs = param
        .outputs
        .into_iter()
        .map(|output| Path::new(&output).into())
        .collect::<Vec<PathBuf>>();
    init_worker(&WorkerParam {
        workspace: Path::new(&param.workspace).into(),
        destination_dir: Path::new(&param.destination_dir).into(),
        outputs: &outputs,
        llm_api_key: &llm_api_key,
    });

    let worker = WORKER.lock().unwrap();

    match worker.as_ref() {
        Some(worker) => worker.extract_translate(),
        None => {}
    }

    Ok(ExtractTranslateReply {
        log_path: "".into(),
        progress_env: "".into(),
    })
}

#[tauri::command]
pub fn fetch_translation() -> Result<FetchTranslationReply, String> {
    let instance = WORKER.lock().unwrap();
    match instance.as_ref() {
        Some(worker) => {
            let term_set = worker.term_set();

            let data = term_set
                .into_iter()
                .map(|(source, translation)| Translation {
                    source,
                    translation,
                })
                .collect();
            Ok(FetchTranslationReply { data })
        }
        None => Ok(FetchTranslationReply { data: vec![] }),
    }
}

#[tauri::command]
pub fn stuff(alter_translation: Vec<Translation>) -> Result<(), String> {
    let mut alter_translation_map = HashMap::with_capacity(alter_translation.len());
    alter_translation.iter().for_each(
        |Translation {
             source,
             translation,
         }| {
            alter_translation_map.insert(source.to_owned(), translation.to_owned());
        },
    );
    let instance = WORKER.lock().unwrap();
    match instance.as_ref() {
        Some(worker) => {
            worker.stuff(&alter_translation_map);
            Ok(())
        }
        None => Ok(()),
    }
}

#[tauri::command]
pub fn fetch_log() -> Result<FetchLogReply, String> {
    let instance = WORKER.lock().unwrap();
    match instance.as_ref() {
        Some(worker) => {
            let (data, _) = worker.read_log().unwrap();
            let data = data.split("\n").map(|log| log.to_owned()).collect();
            Ok(FetchLogReply { data })
        }
        None => Ok(FetchLogReply { data: vec![] }),
    }
}

#[tauri::command]
pub fn fetch_progress() -> Result<FetchProgressReply, String> {
    let instance = WORKER.lock().unwrap();
    let progress = match instance.as_ref() {
        Some(worker) => worker.progress(),
        None => 0f64,
    };
    Ok(FetchProgressReply { progress })
}

#[tauri::command]
pub fn clear_progress() -> Result<(), String> {
    let instance = WORKER.lock().unwrap();
    if let Some(worker) = instance.as_ref() {
        worker.clear_progress();
    }
    Ok(())
}
