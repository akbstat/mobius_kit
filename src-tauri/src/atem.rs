use atem::{
    AtemUsecase, ListAnnotationByFormReply, ListAnnotationByFormRequest, ListFormsReply,
    ListFormsRequest, ListItemsReply, ListItemsRequest, ListProjectVersionReply,
    ListProjectVersionRequest,
};
use lazy_static::lazy_static;

lazy_static! {
    static ref ATEM_USECASE: AtemUsecase =
        AtemUsecase::new("http://localhost:9000/api/sdtm/rawdata/");
}

#[tauri::command]
pub async fn list_project_version(
    request: ListProjectVersionRequest,
) -> Result<ListProjectVersionReply, String> {
    let versions = ATEM_USECASE.list_project_version(&request).await.unwrap();
    Ok(versions.into())
}

#[tauri::command]
pub async fn list_forms(request: ListFormsRequest) -> Result<ListFormsReply, String> {
    let forms = ATEM_USECASE.list_forms(&request).await.unwrap();
    Ok(forms.into())
}

#[tauri::command]
pub async fn list_items(request: ListItemsRequest) -> Result<ListItemsReply, String> {
    let items = ATEM_USECASE.list_items(&request).await.unwrap();
    Ok(items.into())
}

#[tauri::command]
pub async fn list_annotation_by_form(
    request: ListAnnotationByFormRequest,
) -> Result<ListAnnotationByFormReply, String> {
    let items = ATEM_USECASE
        .list_annotation_by_form(&request)
        .await
        .unwrap();
    Ok(items.into())
}
