import { invoke } from "@tauri-apps/api";

export interface Output {
    filename: string,
}

interface ExtractTranslateRequest {
    workspace: string,
    destination_dir: string,
    outputs: string[],
}

interface FetchTranslationReply {
    data: Translation[],
}

export interface Translation {
    id: number,
    source: string,
    translation: string,
}

export async function listRtfs(dir: string): Promise<Output[]> {
    let data: string = await invoke("list_rtfs", { dir });
    let result = JSON.parse(data).map((item: any) => { return { filename: item.name } });
    return result;
}

export async function extractTranslate(param: ExtractTranslateRequest) {
    await invoke("extract_translate", { param });
}

export async function fetchLog(): Promise<string[]> {
    const reply: { data: string[] } = await invoke("fetch_log", {});
    return reply.data;
}

export async function fetchProgress(): Promise<number> {
    const reply: { progress: number } = await invoke("fetch_progress", {});
    let progress = Math.round(reply.progress * 10000) / 100;
    return progress;
}

export async function fetchTranslation(): Promise<FetchTranslationReply> {
    const reply: { data: Translation[] } = await invoke("fetch_translation", {});
    const data = reply.data.map((translation, index) => { return { id: index, source: translation.source, translation: translation.translation } });
    reply.data = data;
    return reply;
}

export async function stuff(alterTranslation: Translation[]) {
    await invoke("stuff", { alterTranslation });
}

export async function clearProgress() {
    await invoke("clear_progress", {});
}

export async function openDirectory(path: string) {
    await invoke("open_directory", { path });
}