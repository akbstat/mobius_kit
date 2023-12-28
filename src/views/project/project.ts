export interface Project {
    rawdata_changed_at: number,
    domains: Domain[],
}

export interface Domain {
    name: string,
    dev: Group,
    qc: Group,
    existed: ExistedFile[],
    fileList: FileList,
}

export interface Group {
    status: string,
    code: File[],
    dataset: File[],
    log: File[],
    output: File[],
    qc_result: File[],
}

export interface File {
    name: string,
    kind: string,
    exist: boolean,
    modified_at: number,
}



export interface FileList {
    dev: File[],
    qc: File[],
}

export function allFiles(g: Group): File[] {
    return g.code.concat(g.dataset).concat(g.log).concat(g.output).concat(g.qc_result);
}

export interface ExistedFile extends File {
    modified_time: string,
}

export function FileToExistedFile(file: File): ExistedFile {
    return {
        name: file.name,
        kind: file.kind,
        exist: file.exist,
        modified_at: file.modified_at,
        modified_time: toISODatetimeInCst(file.modified_at),
    }
}

export function toISODatetimeInCst(time: number): string {
    return new Date((time + 3600 * 8) * 1000).toISOString().slice(0, 19)
}

export function tagAttr(tag: string) {
    switch (tag) {
        case "SasCode":
            return {
                backgroundColor: "#4d94ff",
                color: "#ffffff",
                width: '70px',
            };
        case "SasData":
            return {
                backgroundColor: "#666699",
                color: "#ffffff",
                width: '70px',
            };
        case "Xpt":
            return {
                backgroundColor: "#ff661a",
                color: "#ffffff",
                width: '70px',
            };
        case "SasLog":
            return {
                backgroundColor: "#d1d1e0",
                color: "#3d3d5c",
                width: '70px',
            };
        case "QcResult":
            return {
                backgroundColor: "#bb33ff",
                color: "#ffffff",
                width: '70px',
            };
        case "Raw":
            return {
                backgroundColor: "#996633",
                color: "#ffffff",
                width: '70px',
            };
        case "Building":
            return {
                backgroundColor: "#4d94ff",
                color: "#ffffff",
                width: '100px',
            };
        case "Comparing":
            return {
                backgroundColor: "#4d94ff",
                color: "#ffffff",
                width: '100px',
            };
        case "Ready":
            return {
                backgroundColor: "#00cc00",
                color: "#ffffff",
                width: '100px',
            };
        case "Compared":
            return {
                backgroundColor: "#00cc00",
                color: "#ffffff",
                width: '100px',
            };
        default:
    }
    return {
        backgroundColor: "#996633",
        color: "#ffffff",
        width: '70px',
    }
}

