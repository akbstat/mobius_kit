import { invoke } from "@tauri-apps/api";

export interface Project {
    product: string,
    trial: string,
    purpose: string,
}

export async function projectRootPath(project: Project): Promise<string> {
    const result: string = await invoke("project_root_path", { project });
    return result;
}

export async function outputPath(project: Project): Promise<string> {
    const result: string = await invoke("output_path", { project });
    return result;
}

export async function latestAcrfFilepath(project: Project): Promise<string> {
    const result: string | null = await invoke("latest_arcf_filepath", { project });
    return result ? result : "";
}