import { invoke } from '@tauri-apps/api/tauri'

export async function fetchSdtm(config: string, root: string): Promise<string> {
    return await invoke("fetch_sdtm", { "config": config, "root": root });
}

export async function fetchAdam(config: string, root: string): Promise<string> {
    return await invoke("fetch_adam", { "config": config, "root": root });
}

export async function fetchTfls(config: string, root: string): Promise<string> {
    return await invoke("fetch_tfls", { "config": config, "root": root });
}

export async function inferPathSdtm(path: string): Promise<string> {
    return await invoke("infer_path_sdtm", { path });
}

export async function inferPathAdam(path: string): Promise<string> {
    return await invoke("infer_path_adam", { path });
}

export async function inferPathTfls(path: string): Promise<string> {
    return await invoke("infer_path_tfls", { path });
}


export default {
    fetchSdtm,
    fetchAdam,
    fetchTfls,
    inferPathSdtm,
    inferPathAdam,
    inferPathTfls,
}