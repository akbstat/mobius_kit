use std::{
    fs,
    os::windows::process::CommandExt,
    path::{Path, PathBuf},
    process::Command,
    thread,
};

use void_probe::void_probe;

#[tauri::command]
pub fn probe(paths: Vec<String>) -> Result<(), String> {
    if paths.is_empty() {
        return Ok(());
    }
    let dest_dir = paths.first().unwrap().to_owned();
    let dest_dir = PathBuf::from(Path::new(&dest_dir).parent().unwrap()).join(".temp\\result.json");
    thread::spawn(move || {
        let rtfs = paths
            .iter()
            .map(|p| PathBuf::from(Path::new(p)))
            .collect::<Vec<PathBuf>>();
        match void_probe(rtfs.as_slice()) {
            Ok(reports) => {
                fs::write(dest_dir, serde_json::to_string(&reports).unwrap()).unwrap();
            }
            Err(_) => {}
        }
    });
    Ok(())
}

#[tauri::command]
pub fn open_pdf_page(path: String, page: usize) {
    thread::spawn(move || {
        let mut cmd = Command::new("cmd");
        cmd.creation_flags(0x08000000);
        cmd.arg("/C")
            .arg("C:\\Program Files (x86)\\Foxit Software\\Foxit PhantomPDF\\FoxitPhantomPDF.exe")
            .arg(path)
            .arg("/A")
            .arg(format!("page={}", page));
        cmd.output().unwrap();
    });
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
    let p = PathBuf::from(Path::new(&path)).join(".temp");
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
