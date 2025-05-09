import { invoke } from "@tauri-apps/api";

export async function listHistories(user: string): Promise<History[]> {
    let reply: ListHistoriesReply = await invoke("list_histories", { user });
    const history = reply.data.reverse();
    return history;
}

export async function saveHistory(param: SaveHistoryRequest): Promise<History[]> {
    let reply: SaveHistoryReply = await invoke("save_history", { request: param });
    const history = reply.data.reverse();
    return history;
}

export async function removeHistories(user: string, ids: number[]): Promise<History[]> {
    let reply: ListHistoriesReply = await invoke("remove_histories", { user, ids });
    const history = reply.data.reverse();
    return history;
}

export interface History {
    id?: number; // optional, since Option<i32> becomes id?: number
    product: string;
    trial: string;
    purpose: string;
}

export interface ListHistoriesRequest {
    user: string;
}

export interface ListHistoriesReply {
    data: History[];
}

export interface SaveHistoryRequest {
    user: string;
    product: string;
    trial: string;
    purpose: string;
}

export interface SaveHistoryReply {
    data: History[];
}

export interface RemoveHistoriesRequest {
    ids: number[];
}

export interface RemoveHistoriesReply { }