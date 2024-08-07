use serde::{Deserialize, Serialize};
use std::path::Path;
use voyager::{Annotation, Exporter};

#[tauri::command]
pub fn list_annotations(filepath: String) -> Result<ListAnnotationReply, String> {
    let filepath = Path::new(&filepath);
    match voyager::fetch(filepath) {
        Ok(annotations) => Ok(ListAnnotationReply { data: annotations }),
        Err(err) => return Err(err.to_string()),
    }
}
#[tauri::command]
pub fn export_annotations(acrf: String, dest: String) -> Result<(), String> {
    let acrf = Path::new(&acrf);
    let dest = Path::new(&dest);
    let parent = dest.parent().unwrap();
    if !acrf.exists() {
        return Err(format!("{:?} does not existed", acrf));
    }
    if !parent.exists() {
        return Err(format!("{:?} does not existed", parent));
    }
    let annotations = match voyager::fetch(acrf) {
        Ok(annotations) => annotations,
        Err(err) => return Err(err.to_string()),
    };
    let mut exporter = Exporter::new();
    exporter.add_annotations(&annotations);
    match exporter.save(Path::new(dest)) {
        Ok(_) => Ok(()),
        Err(err) => return Err(err.to_string()),
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ListAnnotationReply {
    data: Vec<Annotation>,
}
