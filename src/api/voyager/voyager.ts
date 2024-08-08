import { invoke } from "@tauri-apps/api/tauri";

export interface ListAnnotationReply {
    data: Annotation[],
}

export interface Annotation {
    domain: string,
    supp: boolean,
    variable: string,
    page_description: PageDescription[]
}

export interface PageDescription {
    page: number,
    description: string[],
}

export async function listAnnotations(filePath: string): Promise<Annotation[]> {
    const reply: ListAnnotationReply = await invoke("list_annotations", { filepath: filePath });
    return reply.data;
}

export async function exportAnnotations(acrf: string, dest: string): Promise<void> {
    await invoke("export_annotations", { acrf, dest });
}

export async function openPDF(dir: string, page: number) {
    page = Math.round(page);
    if (!page || page < 1) {
        page = 1;
    }
    return await invoke("open_pdf_page", { path: dir, page });
}

export async function openFile(path: string) {
    await invoke("open_file", { path })
}