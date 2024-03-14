export enum ProjectKind {
    SDTM = "SDTM",
    ADaM = "ADaM",
    TFLs = "TFLs",
    UNKNOWN = ""
}

export enum GroupKind {
    Production,
    Validation,
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

export function popContent(status: string): string {
    switch (status) {
        case "Building":
            return "The item is building, perhaps some required files are missing";
        case "Changed":
            return "One or more files have a modification that is earlier than the input data";
        case "Unexpected":
            return "The file modification order is wrong, please check out the timeline";
        case "Ready":
            return "The item is ready";
        case "Missing":
            return "The file is missing";
        case "Fine":
            return "The file is fine";
        case "Pass":
            return "The item passed validation";
        case "NotMatch":
            return "The item did not pass validation";
        case "NotApplicable":
            return "Validation items are not applicable";
        case "NotStart":
            return "Seems like code file of item is just initialized by template tools";
    }
    return "default"
};

export function statusFilter(kind: GroupKind): { text: string, value: string }[] {
    let status = ["Building", "Changed", "Unexpected", "NotStart"];
    if (kind === GroupKind.Production) {
        status.push("Ready");
    } else {
        status.push("Pass");
        status.push("NotMatch");
        status.push("NotApplicable");
    }
    return status.map(item => { return { text: item, value: item } });
}