import { invoke } from "@tauri-apps/api";
import { open } from '@tauri-apps/api/dialog';

export interface SelectFileParam {
    extensions: string[],
    filter: string,
}

export async function openDirectory(path: string) {
    await invoke("open_directory", { path });
}

export async function openFile(path: string) {
    await invoke("open_file", { path })
}

export async function selectDirectory(): Promise<string> {
    return (await open({
        directory: true,
        defaultPath: undefined,
    })) as string;
}

export async function selectFile(param: SelectFileParam): Promise<string> {
    const { extensions, filter: name } = param;
    return (await open({
        filters: [{
            extensions,
            name,
        }]
    })) as string;
}

