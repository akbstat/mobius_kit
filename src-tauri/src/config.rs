use serde::{Deserialize, Serialize};
use serde_yaml;
use std::{
    env,
    error::Error,
    fs,
    path::{Path, PathBuf},
};

use crate::{user::get_user_id, utils};

const CONFIG: &str = "MK_CONFIG";
const PDF_READER: &str = "MK_PDF_READER";
const TEMPLATE: &str = "MK_TEMPLATE";
pub const PROJECT_ROOT: &str = "MK_PROJECT_ROOT";
pub const SKELETON_DOCUMENT: &str = "MK_SKELETON_DOCUMENT";
pub const SKELETON_STAT: &str = "MK_SKELETON_STAT";
const TEMP_SCRIPT: &str = "MK_TEMP_SCRIPT";
const WORD_WORKER: &str = "MK_WORD_WORKER";

#[derive(Debug, Serialize, Deserialize)]
pub struct Config {
    pub pdf_reader: String,
    pub word_worker: usize,
    pub template: String,
    pub user_temp: String,
    pub skeleton_document: String,
    pub skeleton_stat: String,
    pub project_root: String,
}

pub fn config_env_init() -> Result<(), Box<dyn Error>> {
    let config_path = if let Ok(path) = env::var(CONFIG) {
        path
    } else {
        r"\\180.0.0.1\Data\Utility\tools\MobiusKit\.config\config.yaml".into()
    };
    let config_path = Path::new(&config_path);
    config_to_env(config_path)
}

/// read config yaml and export into env
pub fn config_to_env(path: &Path) -> Result<(), Box<dyn Error>> {
    let user_id = get_user_id().unwrap();
    let yaml = fs::read_to_string(path)?;
    let mut config: Config = serde_yaml::from_str(&yaml)?;
    env::set_var(PDF_READER, config.pdf_reader);
    env::set_var(TEMPLATE, config.template);
    env::set_var(PROJECT_ROOT, config.project_root);
    env::set_var(SKELETON_DOCUMENT, config.skeleton_document);
    env::set_var(SKELETON_STAT, config.skeleton_stat);

    let user_temp_path = build_temp_script_path(&config.user_temp, &user_id);
    if !user_temp_path.exists() {
        fs::create_dir_all(&user_temp_path)?;
        utils::hide_directory(&user_temp_path)?;
    }
    let script_path = user_temp_path.join(r"app\mobiuskit\void_probe");
    if !script_path.exists() {
        fs::create_dir_all(&script_path)?;
    }
    env::set_var(TEMP_SCRIPT, script_path.to_string_lossy().to_string());
    if config.word_worker < 1 {
        config.word_worker = 5;
    }
    env::set_var(WORD_WORKER, config.word_worker.to_string());
    Ok(())
}

fn build_temp_script_path(template: &str, user_id: &str) -> PathBuf {
    PathBuf::from(Path::new(&template.replace(r"{user_id}", user_id)))
}

#[cfg(test)]
mod config_test {
    use super::*;
    #[test]
    fn config_to_env_test() {
        env::set_var(CONFIG, r"D:\projects\rusty\mobius_kit\.config\config.yaml");
        let result = config_env_init();
        assert!(result.is_ok());
        assert_eq!(
            env::var(PDF_READER).unwrap(),
            "C:\\Program Files (x86)\\Foxit Software\\Foxit PhantomPDF\\FoxitPhantomPDF.exe"
        );
        assert_eq!(
            env::var(TEMPLATE).unwrap(),
            "D:\\projects\\rusty\\mobius_kit\\.mocks\\code\\template"
        );
        assert_eq!(env::var(WORD_WORKER).unwrap(), "5");
    }
    #[test]
    fn build_temp_script_path_test() {
        let template = r"D:\Users\{user_id}\.temp\app\mobiuskit\void_probe";
        let user_id = "yuqi01.chen";
        let expect = r"D:\Users\yuqi01.chen\.temp\app\mobiuskit\void_probe";
        assert_eq!(
            Path::new(expect),
            build_temp_script_path(template, user_id).as_path()
        );
    }
}
