use std::{
    fs,
    os::windows::fs::MetadataExt,
    path::Path,
    time::{SystemTime, UNIX_EPOCH},
};

use serde::{Deserialize, Serialize};
const RTF_EXTENTION: &str = "rtf";

#[derive(Debug, Deserialize, Serialize, PartialEq, PartialOrd)]
enum Kind {
    Figure,
    Listing,
    Table,
}

impl Kind {
    pub fn new(name: &str) -> Option<Kind> {
        if name.ends_with(RTF_EXTENTION) {
            let prefix = name.as_bytes().get(0).unwrap();
            match prefix {
                108u8 => return Some(Kind::Listing),
                76u8 => return Some(Kind::Listing),
                116u8 => return Some(Kind::Table),
                84u8 => return Some(Kind::Table),
                102u8 => return Some(Kind::Figure),
                70u8 => return Some(Kind::Figure),
                _ => return None,
            }
        }
        None
    }
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Rtf {
    name: String,
    size: u64,
    kind: Kind,
    modified_at: u64,
}

/// convert SystemTime struct into unix timestamp
fn sys_to_unix(st: SystemTime) -> Result<u64, Box<dyn std::error::Error>> {
    Ok(st.duration_since(UNIX_EPOCH)?.as_secs())
}

pub fn list_rtfs(p: &Path) -> Result<Vec<Rtf>, Box<dyn std::error::Error>> {
    let mut rtf = vec![];
    for f in fs::read_dir(p)? {
        let f = f?;
        if f.file_type()?.is_dir() {
            continue;
        }
        let filename = f.file_name().to_string_lossy().to_string();
        let meta = f.metadata()?;
        let modified_at = sys_to_unix(meta.modified()?)?;
        if let Some(kind) = Kind::new(&filename) {
            rtf.push(Rtf {
                name: filename,
                size: meta.file_size(),
                kind,
                modified_at,
            });
        }
    }
    rtf.sort_by(|x, y| x.kind.partial_cmp(&y.kind).unwrap());
    Ok(rtf)
}
