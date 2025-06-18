use super::dto::{
    ListHistoriesReply, RemoveHistoriesRequest, SaveHistoryReply, SaveHistoryRequest,
};
use crate::config::COMPASS_BASE_URL;
use lazy_static::lazy_static;
use reqwest::blocking::Client;
use std::env;

const COMPASS_USER_KEY: &str = "compass-user";

lazy_static! {
    static ref HTTP_CLIENT: Client = Client::new();
    static ref BASE_URL: String = env::var(COMPASS_BASE_URL).unwrap();
}

#[tauri::command]
pub fn list_histories(user: &str) -> Result<ListHistoriesReply, String> {
    list_histories_by_user(user)
}

#[tauri::command]
pub fn save_history(request: SaveHistoryRequest) -> Result<SaveHistoryReply, String> {
    let url = format!("{}/vestige", *BASE_URL);
    let reply = HTTP_CLIENT
        .post(&url)
        .header(COMPASS_USER_KEY, &request.user)
        .json(&request)
        .send()
        .map_err(|e| e.to_string())?
        .json::<SaveHistoryReply>()
        .map_err(|e| e.to_string())?;
    Ok(reply)
}

#[tauri::command]
pub fn remove_histories(user: String, ids: Vec<i32>) -> Result<ListHistoriesReply, String> {
    let url = format!("{}/vestige/remove", *BASE_URL);
    HTTP_CLIENT
        .post(&url)
        .header(COMPASS_USER_KEY, &user)
        .json(&RemoveHistoriesRequest { ids })
        .send()
        .map_err(|e| e.to_string())?;
    list_histories_by_user(&user)
}

pub fn list_histories_by_user(user: &str) -> Result<ListHistoriesReply, String> {
    let url = format!("{}/vestige", *BASE_URL);
    let reply = HTTP_CLIENT
        .get(&url)
        .header(COMPASS_USER_KEY, user)
        .send()
        .map_err(|e| e.to_string())?
        .json::<ListHistoriesReply>()
        .map_err(|e| e.to_string())?;
    Ok(reply)
}
