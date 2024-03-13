import { invoke } from "@tauri-apps/api/tauri";

export interface Running {
    running: boolean,
    locker: string,
}

export async function probe(files: string[]): Promise<string> {
    return await invoke("probe", { paths: files });
}

export async function getProgress(dir: string): Promise<number> {
    return await invoke("task_progress", { path: dir });
}

export async function getProbeResult(dir: string): Promise<string> {
    return await invoke("get_probe_result", { path: dir });
}

export async function removeTempDir(dir: string): Promise<string> {
    return await invoke("remove_temp_dir", { path: dir });
}

export async function openPDF(dir: string, page: number) {
    page = Math.round(page);
    if (!page || page < 1) {
        page = 1;
    }
    return await invoke("open_pdf_page", { path: dir, page });
}

export async function probeRunning(path: string): Promise<Running> {
    let result = await invoke("probe_running", { path });
    let response: Running = JSON.parse(result as string)
    return response;
}


export default {
    probe,
    getProgress,
    getProbeResult,
    removeTempDir,
    openPDF,
    probeRunning,
}
