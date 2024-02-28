import { invoke } from '@tauri-apps/api/tauri';

export async function currentUser(): Promise<string> {
    return await invoke("get_current_username");
}

export default {
    currentUser,
}

