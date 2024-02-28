use serde::{Deserialize, Serialize};
use serde_yaml;
use std::{env, error::Error, fs, path::Path};

#[derive(Debug, Serialize, Deserialize)]
pub struct Config {
    pub pdf_reader: String,
    pub word_worker: usize,
    pub template: String,
}

pub fn config_env_init() -> Result<(), Box<dyn Error>> {
    let config_path = if let Ok(path) = env::var("MK_CONFIG") {
        path
    } else {
        r"\\180.0.0.1\Data\Utility\tools\MobiusKit\.config\config.yaml".into()
    };
    let config_path = Path::new(&config_path);
    config_to_env(config_path)
}

/// read config yaml and export into env
pub fn config_to_env(path: &Path) -> Result<(), Box<dyn Error>> {
    let yaml = fs::read_to_string(path)?;
    let mut config: Config = serde_yaml::from_str(&yaml)?;
    env::set_var("MK_PDF_READER", config.pdf_reader);
    env::set_var("MK_TEMPLATE", config.template);
    if config.word_worker < 1 {
        config.word_worker = 5;
    }
    env::set_var("MK_WORD_WORKER", config.word_worker.to_string());
    Ok(())
}

#[cfg(test)]
mod config_test {
    use super::*;
    #[test]
    fn config_to_env_test() {
        env::set_var(
            "MK_CONFIG",
            r"D:\projects\rusty\mobius_kit\.config\config.yaml",
        );
        let result = config_env_init();
        assert!(result.is_ok());
        assert_eq!(
            env::var("MK_PDF_READER").unwrap(),
            "C:\\Program Files (x86)\\Foxit Software\\Foxit PhantomPDF\\FoxitPhantomPDF.exe"
        );
        assert_eq!(
            env::var("MK_TEMPLATE").unwrap(),
            "D:\\projects\\rusty\\mobius_kit\\.mocks\\code\\template"
        );
        assert_eq!(env::var("MK_WORD_WORKER").unwrap(), "5");
    }
}
