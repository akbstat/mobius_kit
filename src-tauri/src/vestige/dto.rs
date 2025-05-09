use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct History {
    pub id: Option<i32>,
    pub product: String,
    pub trial: String,
    pub purpose: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ListHistoriesReply {
    pub data: Vec<History>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SaveHistoryRequest {
    /// user id from aactive directory service of akeso
    pub user: String,
    /// product name, for example: "ak101"
    pub product: String,
    /// trial name, for example: "101"
    pub trial: String,
    /// purpose name, for example: "dryrun"
    pub purpose: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SaveHistoryReply {
    pub data: Vec<History>,
}

#[derive(Debug, Serialize)]
pub struct RemoveHistoriesRequest {
    /// user history id
    pub ids: Vec<i32>,
}
