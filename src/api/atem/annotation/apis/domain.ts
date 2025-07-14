import { invoke } from "@tauri-apps/api";
import { Domain } from "../interfaces/domain";

/**
 * list domains which is mapped to specified form, sort by domain id
 * @param formId 
 * @returns 
 */
export async function listDomainByForm(request: { formId: number, annotationVersionId?: number }): Promise<Domain[]> {
    if (!request.annotationVersionId) {
        return [];
    }
    const domains = await invoke<Domain[]>("list_form_domain", { request });
    domains.sort((x, y) => {
        if (x.id && y.id) {
            return x.id - y.id;
        }
        return 0;
    })
    return domains;
}

export async function createOrUpdateDomainForForm(request: { formId: number, annotationVersionId: number, domain: Domain }): Promise<void> {
    const { formId, annotationVersionId, domain } = request;
    if (domain.id) {
        await updateDomainForForm(formId, domain);
    } else {
        const { name, description } = domain;
        await createDomainForForm({ formId, annotationVersionId, name, description });
    }
}

export async function removeDomainForForm(id: number): Promise<void> {
    await invoke("remove_form_domain", { id })
}

async function createDomainForForm(request: { formId: number, annotationVersionId: number, name: string, description: string }): Promise<void> {
    await invoke("create_form_domain", { request });
}

async function updateDomainForForm(formId: number, domain: Domain): Promise<void> {
    console.log("[Not Implement] Updating domain for form: ", formId, domain);
}

