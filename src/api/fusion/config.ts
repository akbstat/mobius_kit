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
    tocHeaders: string[],
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
    let tasks = data.tasks.map(t => {
        // @ts-ignore
        t.tocHeaders = t["toc_headers"];
        return t;
    });
    data.tasks = tasks;
    return data;
}

export async function saveConfig(id: string | null, name: string, param: FusionConfig): Promise<string> {
    let tasks = param.tasks.map(t => {
        // @ts-ignore
        t["toc_headers"] = t.tocHeaders;
        return t;
    });
    param.tasks = tasks;
    let return_id: string = await invoke("save_config", { config: { id, name }, param });
    return return_id;
}

export function checkTitleMissing(config: FusionConfig): { name: string, files: string[] }[] {
    const result: { name: string, files: string[] }[] = [];
    for (const task of config.tasks) {
        const titleMissingFiles = task.files.filter(t => t.title.length === 0);
        if (titleMissingFiles.length > 0) {
            result.push({ name: task.name, files: titleMissingFiles.map(f => f.filename) })
        }
    }
    return result;
}