import { invoke } from "@tauri-apps/api";

export async function listTemplate(kind: String): Promise<Version[]> {
    let result: ListTemplateReply = await invoke("list_templates", { kind });
    return result.data;
}

export async function readTemplate(version: Version, kind: string): Promise<string> {
    let result: ReadTemplateReply = await invoke("read_template", { version, kind });
    return result.data;
}

export async function saveTemplate(version: Version, kind: string, template: string) {
    await invoke("save_template", { version, kind, template });
}

export async function fetchOfficalTemplate(kind: string): Promise<{ dev: string, qc: string }> {
    kind = mapKind(kind);
    const versions = await listTemplate(kind);
    const officalDev = versions.filter(v => v.offical && v.role === "dev");
    const officalQc = versions.filter(v => v.offical && v.role === "qc");
    const devVersion = officalDev[officalDev.length - 1].name;
    const qcVersion = officalQc[officalQc.length - 1].name;
    const dev = await readTemplate({ name: devVersion, offical: true, role: "dev" }, kind);
    const qc = await readTemplate({ name: qcVersion, offical: true, role: "qc" }, kind);
    return { dev, qc };
}

function mapKind(kind: string): string {
    switch (kind) {
        case "ADaM":
            return "ADAM";
        case "TFLs":
            return "TFL";
        default:
            return kind;
    }
}


export interface ListTemplateReply {
    data: Version[]
}

export interface ReadTemplateReply {
    data: string
}

export interface Version {
    name: string,
    role: string,
    offical: boolean,
}