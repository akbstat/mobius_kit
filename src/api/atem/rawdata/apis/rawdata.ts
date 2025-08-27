import { invoke } from "@tauri-apps/api";

export async function listProjectVersions(request: ListProjectVersionRequest): Promise<ListProjectVersionReply> {
    const result: ListProjectVersionReply = await invoke("list_project_version", { request });
    return result;
}

export async function listForms(versionId: number): Promise<FormInfo[]> {
    const result: { data: FormInfo[] } = await invoke("list_forms", { request: { versionId } });
    return result.data.sort((a, b) => a.formOrder - b.formOrder);
}

export async function getFormById(id: number): Promise<FormInfo | null> {
    const result: { data: FormInfo | null } = await invoke("get_form_by_id", { id });
    return result.data;
}

export async function getItemById(sourceId: number): Promise<Item | undefined> {
    return await invoke<Item | undefined>("get_item_by_id", { id: sourceId });
}

export async function getOptionById(sourceId: number): Promise<ItemOption | undefined> {
    return await invoke<ItemOption | undefined>("get_option_by_id", { id: sourceId });
}

export async function getUnitById(sourceId: number): Promise<ItemUnit | undefined> {
    return await invoke<ItemUnit | undefined>("get_unit_by_id", { id: sourceId });
}

export async function listItems(formId: number): Promise<Item[]> {
    const itemReply: ListItemReply = await invoke("list_items", { request: { formId } });
    const data = itemReply.data.sort((a, b) => a.itemOrder - b.itemOrder);
    data.forEach(item => {
        item.itemOption?.sort((a, b) => a.optionOrder - b.optionOrder);
        item.itemUnit?.sort((a, b) => a.unitOrder - b.unitOrder);
    });
    return data;
}

export async function removeProjectVersion(id: number) {
    console.log(`Removeing project version: ${id}`);
}

export async function modifyProjectVersion(version: ProjectVersion) {
    await invoke("modify_project_version", { id: version.id, request: { name: version.name } });
}

export interface FormInfo {
    id: number;
    name: string;
    description: string;
    formOrder: number;
}

export interface ListProjectVersionRequest {
    product: string;
    trial: string;
}

export interface ListProjectVersionReply {
    projectId: number;
    data: ProjectVersion[];

}

export interface ProjectVersion {
    id: number,
    name: string,
}

export interface ListItemReply {
    data: Item[];
}

export interface Item {
    id: number;
    name: string;
    label: string;
    itemOrder: number;
    itemOption?: ItemOption[];
    itemUnit?: ItemUnit[];
    itemType?: ItemType;
    itemRepeatIndex: number,
    itemDefualtValue: string,
}

export interface ItemOption {
    id: number;
    itemId: number;
    optionValue: string,
    optionDisplay: string,
    optionOrder: number,
}

export interface ItemUnit {
    id: number,
    name: string,
    itemId: number;
    unitOrder: number,
}

export interface ItemType {
    id: number,
    name: string,
}