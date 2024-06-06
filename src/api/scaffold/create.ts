import { invoke } from '@tauri-apps/api/tauri';

export async function createFromTemplate(param: Param): Promise<GeneratedResult> {
    const p = JSON.stringify(param);
    return JSON.parse(await invoke("scaffold_generate", { "param": p })) as GeneratedResult;
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

export interface Param {
    project: string,
    engine: string,
    config: string,
    kind: string,
    dev: boolean,
    qc: boolean,
    dev_dest: string,
    qc_dest: string,
    custom_code: string[],
}

export interface GeneratedResult {
    dev: FileResult[],
    qc: FileResult[],
}

export interface FileResult {
    name: string,
    existed: boolean,
}

export default {
    createFromTemplate,
}

