import { invoke } from "@tauri-apps/api";

export interface ConfigRecord {
    id: string,
    name: string,
    path: string,
}

export interface FusionConfig {
    id: string | null,
    source: string,
    destination: string,
    top: string,
    tasks: Task[]
}

export interface Task {
    name: string,
    language: "EN" | "CN",
    cover: string | null,
    destination: string,
    mode: "RTF" | "PDF",
    files: File[],
}


export interface File {
    filename: string,
    title: string,
    path: string,
    size: number,
}

export async function listConfigs(): Promise<ConfigRecord[]> {
    let configs: ConfigRecord[] = await invoke("list_configs", {});
    return configs;
}


export async function findConfig(id: string): Promise<FusionConfig> {
    let data: FusionConfig = await invoke("find_config", { id });
    return data;
}

export async function saveConfig(id: string | null, name: string, param: FusionConfig): Promise<string> {
    let return_id: string = await invoke("save_config", { config: { id, name }, param });
    return return_id;
}