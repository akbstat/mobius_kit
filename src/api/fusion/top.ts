import { invoke } from "@tauri-apps/api"
import { listRtfs } from "../utils/rtf";

export interface Config {
    top: string[],
    output: string,
    destination: string,
}

export interface Top {
    filename: string,
    title: string,
}

export interface Rtf {
    kind: string,
    modified_at: number,
    name: string,
    size: number,
    title: string,
}


export async function configInfer(dir: string): Promise<Config> {
    const result: Config = await invoke("config_infer", { dir })
    return result;
}

export async function listRtfsWithTitle(output: string, top: string): Promise<Rtf[]> {
    if (output.length === 0 || top.length === 0) {
        return [];
    }
    const topInfo: Top[] = await invoke("top_info", { filepath: top });
    const topInfoMap = new Map();
    topInfo.forEach(top => { topInfoMap.set(top.filename, top.title) });
    const outputs = await listRtfs(output);
    return outputs.map(output => {
        let { kind, modified_at, name, size } = output;
        return {
            kind, modified_at, name, size,
            title: topInfoMap.get(name.toLowerCase()),
        }
    });
}