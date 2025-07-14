use crate::atem::usecase::ATEM_USECASE;
use atem::dto::metadata::{
    Language, ListSdtmDomainsRequest, ListSdtmVariableRequest, ListSdtmVersionRequest, SdtmDomain,
    SdtmVariable, SdtmVersion,
};

#[tauri::command]
pub async fn list_languages() -> Result<Vec<Language>, String> {
    Ok(ATEM_USECASE
        .list_languages()
        .await
        .map_err(|e| e.to_string())?)
}

#[tauri::command]
pub async fn list_sdtm_version(
    request: ListSdtmVersionRequest,
) -> Result<Vec<SdtmVersion>, String> {
    Ok(ATEM_USECASE
        .list_sdtm_version(request)
        .await
        .map_err(|e| e.to_string())?)
}

#[tauri::command]
pub async fn list_sdtm_domains(request: ListSdtmDomainsRequest) -> Result<Vec<SdtmDomain>, String> {
    Ok(ATEM_USECASE
        .list_sdtm_domains(request)
        .await
        .map_err(|e| e.to_string())?)
}

#[tauri::command]
pub async fn list_sdtm_variables(
    request: ListSdtmVariableRequest,
) -> Result<Vec<SdtmVariable>, String> {
    Ok(ATEM_USECASE
        .list_sdtm_variables(request)
        .await
        .map_err(|e| e.to_string())?)
}
