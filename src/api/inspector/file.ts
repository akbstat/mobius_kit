import { invoke } from '@tauri-apps/api/tauri'

export async function listFile(dir: string): Promise<string> {
    return await invoke("inspect", { "dir": dir });
}

export default {
    listFile,
}