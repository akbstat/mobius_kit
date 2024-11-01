import { invoke } from "@tauri-apps/api";

export interface Rtf {
    kind: string,
    modified_at: number,
    name: string,
    size: number,
}

export async function listRtfs(dir: string): Promise<Rtf[]> {
    let data: Rtf[] = await invoke("list_rtfs", { dir });
    return data;
}