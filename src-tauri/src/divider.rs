use std::path::Path;

use rtf_divider::RTFDivider;

#[tauri::command]
pub fn divide_rtf(files: Vec<String>, pagesize: usize, dest: String) {
    if files.len() == 0 {
        return;
    }
    let files: Vec<&Path> = files.iter().map(|f| Path::new(f.as_str())).collect();
    for f in files {
        let divider = RTFDivider::new(f).unwrap();
        match divider {
            Some(d) => {
                d.set_pagesize(pagesize).divide(Path::new(&dest)).unwrap();
            }
            _ => {}
        }
    }
}

// #[tauri::command]
// pub fn open_directory(path: &str) {
//     Command::new("cmd")
//         .arg("/C")
//         .arg("start")
//         .arg(path)
//         .output()
//         .unwrap();
// }

#[cfg(test)]
mod divider_test {
    use super::*;

    #[test]
    fn divide_test() {
        let filelist: Vec<String> = vec![
            r"D:\网页下载文件\dingtalk\test-lyh\test\l-16-02-08-05-ecg-ss.rtf".into(),
            r"D:\网页下载文件\dingtalk\test-lyh\test\l-16-02-07-11-dd-ss.rtf".into(),
            r"D:\网页下载文件\dingtalk\test-lyh\test\t-14-01-04-04-02-antu-pt-ss.rtf".into(),
        ];
        let dest = String::from(r"D:\网页下载文件\dingtalk\test-lyh\test\rtf_divided");
        divide_rtf(filelist, 10, dest);
    }
}
