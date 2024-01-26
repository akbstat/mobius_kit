import { invoke } from '@tauri-apps/api/tauri';

export async function createFromTemplate(param: Param) {
    const p = JSON.stringify(param);
    return await invoke("scaffold_generate", { "param": p });
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
}

export default {
    createFromTemplate,
}

