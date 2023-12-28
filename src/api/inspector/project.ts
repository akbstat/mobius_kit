import { invoke } from '@tauri-apps/api/tauri'

export async function fetchProject(config: string, root: string): Promise<string> {
    return await invoke("fetch_project", { "config": config, "root": root });
}

export default {
    fetchProject,
}