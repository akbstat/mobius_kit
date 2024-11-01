import { invoke } from "@tauri-apps/api";

export async function openDirectory(path: string) {
    await invoke("open_directory", { path });
}