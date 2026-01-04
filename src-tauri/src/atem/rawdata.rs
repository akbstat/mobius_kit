use crate::atem::usecase::ATEM_USECASE;
use atem::dto::{
    annotation::CreateAnnotationVersionRequest,
    rawdata::{
        CreateEDCVersionRequest, GetFormByIdReply, Item, ItemOption, ItemUnit, ListFormsReply,
        ListFormsRequest, ListItemsReply, ListItemsRequest, ListProjectVersionReply,
        ListProjectVersionRequest, ModifyProjectVersionRequest, SearchInFormRequest, SearchResult,
    },
};
use serde::Serialize;

#[tauri::command]
/// Create project version, after create successfully, then create an annotation version in the same time
pub async fn create_project_version(
    request: CreateEDCVersionRequest,
) -> Result<CreateVersionReply, String> {
    let Some(project_version) = ATEM_USECASE
        .create_project_version(&request)
        .await
        .map_err(|e| e.to_string())?
    else {
        return Ok(CreateVersionReply::default());
    };
    let annotation_version = ATEM_USECASE
        .create_annotation_version(&CreateAnnotationVersionRequest {
            project_version_id: project_version.id,
            name: project_version.name.to_string(),
            description: "".to_string(),
            source_version_id: None,
        })
        .await
        .map_err(|e| e.to_string())?;
    Ok(CreateVersionReply {
        project_version_id: Some(project_version.id),
        annotation_version_id: Some(annotation_version.id),
    })
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
pub async fn get_item_by_id(id: i32) -> Result<Option<Item>, String> {
    let item = ATEM_USECASE
        .get_item_by_id(id)
        .await
        .map_err(|e| e.to_string())?;
    Ok(item)
}

#[tauri::command]
pub async fn get_option_by_id(id: i32) -> Result<Option<ItemOption>, String> {
    let option = ATEM_USECASE
        .get_option_by_id(id)
        .await
        .map_err(|e| e.to_string())?;
    Ok(option)
}

#[tauri::command]
pub async fn get_unit_by_id(id: i32) -> Result<Option<ItemUnit>, String> {
    let unit = ATEM_USECASE
        .get_unit_by_id(id)
        .await
        .map_err(|e| e.to_string())?;
    Ok(unit)
}

#[tauri::command]
pub async fn list_items(request: ListItemsRequest) -> Result<ListItemsReply, String> {
    let items = ATEM_USECASE
        .list_items(&request)
        .await
        .map_err(|e| e.to_string())?;
    Ok(items.into())
}

#[tauri::command]
pub async fn search_in_form(request: SearchInFormRequest) -> Result<Vec<SearchResult>, String> {
    let results = ATEM_USECASE
        .search_in_form(request)
        .await
        .map_err(|e| e.to_string())?;
    Ok(results)
}

#[derive(Debug, Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CreateVersionReply {
    project_version_id: Option<i32>,
    annotation_version_id: Option<i32>,
}
