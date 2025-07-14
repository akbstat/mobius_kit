use crate::atem::usecase::ATEM_USECASE;
use atem::{
    dto::annotation::{
        AnnotationVersion, CreateAnnotationRequest, CreateAnnotationVersionRequest,
        CreateFormDomainRequest, FormDomain, ListAnnotationByFormRequest,
        ListAnnotationVersionRequest, ListFormDomainRequest, UpdateAnnootationRequest,
    },
    entity::annotation::AnnotationCollection,
};

#[tauri::command]
pub async fn list_annotation_by_form(
    request: ListAnnotationByFormRequest,
) -> Result<AnnotationCollection, String> {
    let annotations = ATEM_USECASE
        .list_annotation_by_form(request)
        .await
        .map_err(|e| e.to_string())?;
    Ok(annotations.into())
}

#[tauri::command]
pub async fn create_annotation(request: CreateAnnotationRequest) -> Result<(), String> {
    ATEM_USECASE
        .create_annotation(request)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn update_annotation(id: i32, request: UpdateAnnootationRequest) -> Result<(), String> {
    ATEM_USECASE
        .update_annotation(id, request)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn remove_annotation(id: i32) -> Result<(), String> {
    ATEM_USECASE
        .remove_annotation(id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn list_annotation_version(
    request: ListAnnotationVersionRequest,
) -> Result<Vec<AnnotationVersion>, String> {
    let versions = ATEM_USECASE
        .list_annotation_version(request)
        .await
        .map_err(|e| e.to_string())?;
    Ok(versions)
}

#[tauri::command]
pub async fn create_annotation_version(
    request: CreateAnnotationVersionRequest,
) -> Result<(), String> {
    ATEM_USECASE
        .create_annotation_version(&request)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn list_form_domain(request: ListFormDomainRequest) -> Result<Vec<FormDomain>, String> {
    let domains = ATEM_USECASE
        .list_form_domains(request)
        .await
        .map_err(|e| e.to_string())?;
    Ok(domains)
}

#[tauri::command]
pub async fn create_form_domain(request: CreateFormDomainRequest) -> Result<FormDomain, String> {
    let domain = ATEM_USECASE
        .create_form_domain(request)
        .await
        .map_err(|e| e.to_string())?;
    Ok(domain)
}

#[tauri::command]
pub async fn remove_form_domain(id: i32) -> Result<(), String> {
    ATEM_USECASE
        .remove_form_domain(id)
        .await
        .map_err(|e| e.to_string())
}
