import { invoke } from "@tauri-apps/api";

export async function isProdEnv(): Promise<boolean> {
    return await invoke("is_prod_env", {})
}