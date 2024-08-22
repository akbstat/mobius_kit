use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct TranslationResult {
    pub source: Vec<String>,
    pub translation: Vec<String>,
}

#[derive(Debug, Deserialize)]
pub struct ExtractTranslateRequest {
    pub workspace: String,
    pub destination_dir: String,
    pub outputs: Vec<String>,
}

#[derive(Debug, Serialize)]
pub struct ExtractTranslateReply {
    pub log_path: String,
    pub progress_env: String,
}

#[derive(Debug, Serialize)]
pub struct FetchLogReply {
    pub data: Vec<String>,
}

#[derive(Debug, Serialize)]
pub struct FetchTranslationReply {
    pub data: Vec<Translation>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Translation {
    pub source: String,
    pub translation: String,
}

#[derive(Debug, Serialize)]
pub struct FetchProgressReply {
    pub progress: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RtfCellData {
    pub id: usize,
    pub lines: Vec<String>,
    pub translated_lines: Vec<String>,
    pub styles: String,
    pub footnote: bool,
}
