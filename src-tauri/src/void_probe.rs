use std::{
    fs,
    os::windows::process::CommandExt,
    path::{Path, PathBuf},
    process::Command,
    thread,
};

use serde_json::json;
use void_probe::void_probe;

use crate::user::get_user_id;

use self::record::{sys_to_unix, RecordManager};

mod record;

#[tauri::command]
pub fn probe(paths: Vec<String>) -> Result<(), String> {
    if paths.is_empty() {
        return Ok(());
    }
    let dest_dir = paths.first().unwrap().to_owned();
    let runner = get_user_id().unwrap();
    let temp_dir = PathBuf::from(Path::new(&dest_dir).parent().unwrap()).join(".temp");
    if !temp_dir.exists() {
        fs::create_dir_all(&temp_dir).unwrap();
    }
    fs::write(temp_dir.join("lock"), runner).unwrap();
    let dest_dir = temp_dir.join("result.json");
    let previous = temp_dir.join("previous.json");

    if dest_dir.exists() {
        if previous.exists() {
            fs::remove_file(&previous).unwrap();
        }
        fs::rename(&dest_dir, &previous).unwrap();
    }

    let mut modified_outputs = vec![];

    // try to read latest result, build to hash map, if result does not exist, build a empty map
    let record_manager = RecordManager::new(&previous).unwrap();
    // let mut map = build_record_map(&dest_dir).unwrap();

    // get the modified time of source output
    for path in paths.iter() {
        let path = Path::new(&path);
        if !path.exists() {
            continue;
        }
        let modified_at = sys_to_unix(fs::metadata(path).unwrap().modified().unwrap()).unwrap();
        let id = path.file_stem().unwrap().to_string_lossy().to_string();
        // filter source output if modified time is the same in latest result, if modified. update modified time in map
        if let Some(original) = record_manager.modified_at(&id) {
            if original.ne(&modified_at) {
                modified_outputs.push(PathBuf::from(path));
                record_manager.update_modified_at(&id, modified_at);
            }
        } else {
            modified_outputs.push(PathBuf::from(path));
            record_manager.insert_record(&id, modified_at);
        }
    }
    thread::spawn(move || {
        let rtfs = modified_outputs
            .iter()
            .map(|p| PathBuf::from(Path::new(p)))
            .collect::<Vec<PathBuf>>();
        // get probe result
        match void_probe(rtfs.as_slice()) {
            Ok(reports) => {
                // update probe result in map
                for report in reports {
                    let id = Path::new(&report.file())
                        .file_stem()
                        .unwrap()
                        .to_string_lossy()
                        .to_string();
                    record_manager.update_result(&id, &report.file(), &report.void());
                }
                // turn map into slice, and sort then by id
                let reports = record_manager.result();
                // return result to client end
                fs::write(dest_dir, serde_json::to_string(&reports).unwrap()).unwrap();
            }
            Err(_) => {}
        }
        fs::remove_file(&temp_dir.join("lock")).unwrap();
    });
    Ok(())
}

#[tauri::command]
pub fn open_pdf_page(path: String, page: usize) {
    thread::spawn(move || {
        let mut cmd = Command::new(
            "C:\\Program Files (x86)\\Foxit Software\\Foxit PhantomPDF\\FoxitPhantomPDF.exe",
        );
        cmd.creation_flags(0x08000000);
        // cmd.arg("/C")
        // .arg("C:\\Program Files (x86)\\Foxit Software\\Foxit PhantomPDF\\FoxitPhantomPDF.exe")
        cmd.arg(path).arg("/A").arg(format!("page={}", page));
        cmd.output().unwrap();
    });
}

#[tauri::command]
pub fn probe_running(path: String) -> Result<String, String> {
    let temp_dir = Path::new(&path).join(".temp");
    if temp_dir.exists() {
        let lock = temp_dir.join("lock");
        if lock.exists() {
            let locker = fs::read_to_string(&lock).unwrap();
            return Ok(json!({"running": true, "locker": locker}).to_string());
        }
    }
    Ok(json!({"running": false}).to_string())
}

#[tauri::command]
pub fn get_probe_result(path: String) -> Result<String, String> {
    let dest_dir = PathBuf::from(Path::new(&path)).join(".temp\\result.json");
    Ok(fs::read_to_string(dest_dir).unwrap())
}

#[tauri::command]
pub fn remove_temp_dir(path: String) -> Result<(), String> {
    let dest_dir = PathBuf::from(Path::new(&path)).join(".temp");
    if dest_dir.exists() {
        if fs::remove_dir_all(dest_dir).is_err() {
            return Err("Failed to clear temp directory, please try to kill the \"Microsoft Word\" or \"WPS Printer\" in task manager and retry ".into());
        };
    }
    Ok(())
}

#[tauri::command]
pub fn task_progress(path: String) -> Result<f64, String> {
    let p = PathBuf::from(Path::new(&path)).join(".temp\\process");
    if !p.exists() {
        return Ok(0f64);
    }
    let dest_dir = PathBuf::from(Path::new(&path)).join(".temp\\result.json");
    if dest_dir.exists() {
        return Ok(100f64);
    }
    let mut pdfs = vec![];
    let mut rtfs = vec![];
    fs::read_dir(p).unwrap().into_iter().for_each(|entry| {
        let entry = entry.unwrap();
        let name = entry.file_name().to_string_lossy().to_string();
        let meta = entry.metadata().unwrap();
        if meta.is_dir() {
            return;
        }
        if name.ends_with(".rtf") {
            rtfs.push(name);
            return;
        }

        if name.ends_with(".pdf") {
            pdfs.push(name);
            return;
        }
    });
    let pdf_count = pdfs.len();
    let rtf_count = rtfs.len();
    let result = if rtf_count == 0 {
        0f64
    } else if pdf_count == 0 {
        5f64
    } else {
        let progress = pdf_count as f64 / rtf_count as f64 * 100f64;
        if progress < 94f64 {
            progress + 5f64
        } else {
            99f64
        }
    };
    Ok(result)
}
