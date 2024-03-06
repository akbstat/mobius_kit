export enum ProjectKind {
    SDTM = "SDTM",
    ADaM = "ADaM",
    TFLs = "TFLs",
    UNKNOWN = ""
}

export interface Item {
    name: string,
    groups: Group[],
    timeline: File[],
}

export interface Group {
    status: string,
    files: File[],
}

export interface File {
    name: string,
    kind: string,
    status: string,
    modified_at: number,
    modified_at_str: string,
}

export interface FileList {
    dev: File[],
    qc: File[],
}

export function toISODatetimeInCst(time: number): string {
    return new Date((time + 3600 * 8) * 1000).toISOString().slice(0, 19)
}
