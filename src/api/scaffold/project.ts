import { invoke } from "@tauri-apps/api";
import { ChosenProject, Product } from "../../components/project-list/project";

export async function getProjects(): Promise<Product[]> {
    return JSON.parse(await invoke("get_projects")) as Product[];
}

export async function createProject(param: ChosenProject): Promise<void> {
    await invoke("skeleton_generate", { param: JSON.stringify(param) })
}

export async function buildRootPath(param: ChosenProject): Promise<string> {
    const rootPath: string = await invoke("build_root_path", { param: JSON.stringify(param) });
    return rootPath;
}

export async function openDirectory(path: string): Promise<void> {
    return await invoke(
        "open_directory_with_root",
        {
            path,
        },
    );
}