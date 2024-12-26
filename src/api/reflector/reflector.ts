import { invoke } from "@tauri-apps/api";


export async function listEvents(param: listEventsParam): Promise<{ form: Form[], visit: Visit[], binding: Binding[] }> {
    return await invoke("read_db", { param });
}

export async function listPreviousEvents(id: string): Promise<RenderData> {
    return await invoke("get_db_config", { id });
}

export async function renderAcrf(param: RenderAcrfParam) {
    return await invoke("render_acrf", { param });
}

export async function listConfig(): Promise<ConfigList[]> {
    return await invoke("list_db_config");
}

export async function saveConfig(id: null | string, name: string, data: RenderData) {
    return await invoke("save_db_config", { id, name, config: data });
}

export async function removeConfig(id: string) {
    return await invoke("remove_db_config", { id });
}

export interface listEventsParam {
    ecrf: string,
    db: string,
}

export interface Form {
    id: number,
    name: string,
    page: number,
    order: number,
}

export interface Visit {
    id: number,
    name: string,
    order: number,
}

export interface Binding {
    parent: number,
    children: number[],
}

export interface RenderData {
    form: Form[],
    visit: Visit[],
    binding: Binding[],
}

export interface RenderAcrfParam {
    event: RenderData,
    source: string,
    destination: string,
}

export interface ConfigList {
    id: string,
    name: string,
}