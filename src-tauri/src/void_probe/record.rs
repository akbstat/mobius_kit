use std::{
    cell::RefCell,
    collections::HashMap,
    error::Error,
    fs,
    path::Path,
    time::{SystemTime, UNIX_EPOCH},
};

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Default, Clone)]
pub struct Record {
    pub id: String,
    pub modified_at: u64,
    pub file: String,
    pub void: Vec<usize>,
}

pub struct RecordManager {
    map: RefCell<HashMap<String, Record>>,
}

impl RecordManager {
    pub fn new(result: &Path) -> Result<RecordManager, Box<dyn Error>> {
        let map = match result.exists() {
            true => {
                let json = fs::read_to_string(result)?;
                let records: Vec<Record> = serde_json::from_str(&json)?;
                records
                    .into_iter()
                    .map(|record| (record.id.clone(), record))
                    .collect()
            }
            false => HashMap::new(),
        };
        Ok(RecordManager {
            map: RefCell::new(map),
        })
    }
    pub fn modified_at(&self, id: &str) -> Option<u64> {
        match self.map.borrow().get(id) {
            Some(record) => Some(record.modified_at),
            None => None,
        }
    }
    pub fn update_modified_at(&self, id: &str, modified_at: u64) {
        if let Some(record) = self.map.borrow_mut().get_mut(id) {
            record.modified_at = modified_at;
        }
    }
    pub fn update_result(&self, id: &str, file: &str, void: &[usize]) {
        if let Some(record) = self.map.borrow_mut().get_mut(id) {
            record.file = file.to_owned();
            record.void = void.to_owned();
        }
    }
    pub fn insert_record(&self, id: &str, modified_at: u64) {
        let id = id.to_owned();
        self.map.borrow_mut().insert(
            id.clone(),
            Record {
                id,
                modified_at,
                ..Default::default()
            },
        );
    }
    pub fn result(&self) -> Vec<Record> {
        let mut reports = self
            .map
            .borrow()
            .clone()
            .into_iter()
            .map(|(_, v)| v)
            .collect::<Vec<Record>>();
        reports.sort_by(|x, y| x.id.partial_cmp(&y.id).unwrap());
        reports
    }
}

pub fn sys_to_unix(st: SystemTime) -> Result<u64, Box<dyn Error>> {
    Ok(st.duration_since(UNIX_EPOCH)?.as_secs())
}
