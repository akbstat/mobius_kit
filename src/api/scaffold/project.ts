import { invoke } from "@tauri-apps/api";
import { ChosenProject, Product } from "../../components/project-list/project";

interface TaskItem {
    name: string,
    supp: boolean,
    qc_required: boolean,
}

export async function saveTrace(trace: string[]) {
    await invoke("save_trace", { trace });
}

export async function readTrace(): Promise<string[]> {
    let trace: string[] = await invoke("read_trace", {});
    return trace;
}

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

export async function listItems(kind: string, path: string): Promise<string[]> {
    const items: TaskItem[] = await invoke(
        "list_task_items",
        {
            kind,
            path,
        },
    );
    const domains: string[] = [];
    items.forEach((item) => {
        domains.push(`${item.name}|dev`);
        if (item.qc_required) {
            domains.push(`${item.name}|qc`);
        }
    });
    return domains;
}