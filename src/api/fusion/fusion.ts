import { invoke } from "@tauri-apps/api";
import { FusionConfig } from "./config";

export async function runFusionTask(param: FusionConfig) {
    await invoke("run_fusion_task", { param })
}

export async function fetchLog(): Promise<string[]> {
    const logs: string[] = [];
    let origin: string = await invoke("fetch_log", {});
    let originSlice = origin && origin.length > 0 ? origin.split('\n') : [];
    originSlice.forEach((log) => {
        if (!(log.startsWith("[INFO") || log.startsWith("[WARN") || log.startsWith("[ERR"))) {
            logs.push(`${logs.pop()}\n${log}`);
        } else {
            logs.push(log);
        }
    });
    return logs;
}

export async function fetchPreviousLog(): Promise<string[]> {
    const logs: string[] = [];
    let origin: string = await invoke("fetch_previous_log", {});
    let originSlice = origin && origin.length > 0 ? origin.split('\n') : [];
    originSlice.forEach((log) => {
        if (!(log.startsWith("[INFO") || log.startsWith("[WARN") || log.startsWith("[ERR"))) {
            logs.push(`${logs.pop()}\n${log}`);
        } else {
            logs.push(log);
        }
    });
    return logs;
}

export async function fetcProgress(previous: number): Promise<number> {
    let progress: number = await invoke("fetch_progress", {});
    progress = progress > 1 ? 100 : progress * 100;
    return progress > previous ? progress > 100 ? 100 : progress : previous;
}


export async function clearFusionTask() {
    await invoke("clean_fusion_task", {});
}