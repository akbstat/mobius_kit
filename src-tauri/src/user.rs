use std::ffi::OsString;
use std::os::windows::prelude::*;
use winapi::um::winbase::GetUserNameW;

#[tauri::command]
pub fn get_current_username() -> Result<String, ()> {
    get_user_id()
}

pub fn get_user_id() -> Result<String, ()> {
    let mut buffer: Vec<u16> = vec![0; 260];
    let mut size = buffer.len() as u32;

    if unsafe { GetUserNameW(buffer.as_mut_ptr(), &mut size as *mut _) } == 0 {
        Err(())
    } else {
        buffer.resize(size as usize, 0);
        unsafe {
            buffer.set_len(size as usize - 1);
        }
        Ok(OsString::from_wide(&buffer).to_string_lossy().to_string())
    }
}
