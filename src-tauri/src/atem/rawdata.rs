use crate::atem::usecase::ATEM_USECASE;
use atem::dto::rawdata::{
    CreateEDCVersionRequest, GetFormByIdReply, ListFormsReply, ListFormsRequest, ListItemsReply,
    ListItemsRequest, ListProjectVersionReply, ListProjectVersionRequest,
    ModifyProjectVersionRequest,
};

#[tauri::command]
pub async fn create_project_version(request: CreateEDCVersionRequest) -> Result<(), String> {
    ATEM_USECASE
        .create_project_version(&request)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn modify_project_version(
    id: i32,
    request: ModifyProjectVersionRequest,
) -> Result<(), String> {
    ATEM_USECASE
        .modify_project_version(id, &request)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn list_project_version(
    request: ListProjectVersionRequest,
) -> Result<ListProjectVersionReply, String> {
    let versions = ATEM_USECASE
        .list_project_version(&request)
        .await
        .map_err(|e| e.to_string())?;
    Ok(versions.into())
}

#[tauri::command]
pub async fn list_forms(request: ListFormsRequest) -> Result<ListFormsReply, String> {
    let forms = ATEM_USECASE
        .list_forms(&request)
        .await
        .map_err(|e| e.to_string())?;
    Ok(forms.into())
}

#[tauri::command]
pub async fn get_form_by_id(id: i32) -> Result<GetFormByIdReply, String> {
    let forms = ATEM_USECASE
        .get_form_by_id(id)
        .await
        .map_err(|e| e.to_string())?;
    Ok(forms)
}

#[tauri::command]
pub async fn list_items(request: ListItemsRequest) -> Result<ListItemsReply, String> {
    let items = ATEM_USECASE
        .list_items(&request)
        .await
        .map_err(|e| e.to_string())?;
    Ok(items.into())
}
