import { invoke } from "@tauri-apps/api";
import { ProjectKind } from "./inspector";

export type TrackerItem = {
    item: string,
    dever: string,
    qcer: string,
}

export async function trackerIllation(param: {
    product: string,
    trial: string,
    purpose: string,
    kind: ProjectKind,
}): Promise<string> {
    const filepath: string = await invoke("tracker_illation", { param });
    return filepath;
}

export async function getTrackerInformation({ filepath, kind }: { filepath: string, kind: ProjectKind }): Promise<TrackerItem[]> {
    try {
        const result = await invoke<TrackerItem[]>("get_tracker_information", { filepath, kind });
        return result;
    } catch (error) {
        return []
    }
}