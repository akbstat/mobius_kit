import { invoke } from '@tauri-apps/api/tauri'

export interface TreeNode {
    label: string
    path: string,
    children: TreeNode[],
    is_file: boolean,
    encoding: string,
}

export async function listFiles(path: string): Promise<TreeNode[]> {
    const result = JSON.parse(await invoke("list_file_tree", { path })) as TreeNode;
    return [result];
}

export async function ConvertEncodingToUTF8BOM(files: TreeNode[]) {
    await invoke("convert", { path: files.map(node => node.path) })
}