import { invoke } from "@tauri-apps/api"
import { CreateEDCVersionRequest, Language, SdtmDomain, SdtmVariable, SdtmVersion } from "../interfaces/sdtm"

export async function listSdtmDomains(versionId?: number): Promise<SdtmDomain[]> {
    if (!versionId) {
        return [];
    }
    const domains = invoke<SdtmDomain[]>("list_sdtm_domains", { request: { versionId } });
    return domains;
}

export async function listSdtmVariables(domainId?: number): Promise<SdtmVariable[]> {
    if (!domainId) {
        return [];
    }
    const variables = invoke<SdtmVariable[]>("list_sdtm_variables", { request: { domainId } });
    return variables;
}

export async function listLanguages(): Promise<Language[]> {
    const languages = await invoke<Language[]>("list_languages");
    return languages.sort((x, y) => x.id - y.id)
}

export async function listSdtmVersion(langId: number): Promise<SdtmVersion[]> {
    const versions = await invoke<SdtmVersion[]>("list_sdtm_version", { request: { langId } });
    return versions.sort((x, y) => x.id - y.id);
}

export async function createProjectVersion(request: CreateEDCVersionRequest): Promise<void> {
    await invoke("create_project_version", { request });
}
