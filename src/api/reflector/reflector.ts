import { invoke } from "@tauri-apps/api";


export async function listEvents(param: listEventsParam): Promise<{ form: Form[], visit: Visit[], binding: Binding[] }> {
    if (param.db.length > 0 && param.ecrf.length > 0) {
        return await invoke("read_db", { param });
    }
    return {
        form: [],
        visit: [],
        binding: [],
    }
}

export async function renderAcrf(param: RenderAcrfParam) {
    return await invoke("render_acrf", { param });
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