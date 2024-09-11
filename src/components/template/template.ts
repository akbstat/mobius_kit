export interface Version {
    name: string,
    offical: boolean,
}

export interface VersionSelected {
    dev: string;
    qc: string;
}


export interface TemplateSelected {
    dev: string;
    qc: string;
}

export function mapKind(kind: string): string {
    switch (kind) {
        case "ADaM":
            return "ADAM";
        case "TFLs":
            return "TFL";
        default:
            return kind;
    }
}