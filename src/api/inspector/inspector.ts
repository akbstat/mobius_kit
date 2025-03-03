import { invoke } from "@tauri-apps/api";
import { currentUser } from "../mobiuskit/user";

/**
 * to get the configuration file according project code and project kind
 */
export async function configIllation(param: {
    product: string,
    trial: string,
    purpose: string,
    kind: ProjectKind,
}): Promise<string> {
    const filepath: string = await invoke("config_illation", { param });
    return filepath;
}


export async function configRootDir(param: {
    product: string,
    trial: string,
    purpose: string,
    kind: ProjectKind,
}): Promise<string> {
    const dir: string = await invoke("config_root", { param });
    return dir;
}

export async function listAllProjects(): Promise<Product[]> {
    const products: Product[] = await invoke("list_products", {});
    return products;
}


export async function listHistoryProjects(): Promise<string[]> {
    let user = await currentUser();
    const projects: string[] = await invoke("list_historical_trials", { user });
    return projects;
}


export async function createHistory(param: { product: string, trial: string, purpose: string }): Promise<void> {
    let user = await currentUser();
    let { product, trial, purpose: kind } = param;
    await invoke("create_history", { param: { product, trial, kind, user } });
}

export async function projectKind(): Promise<ProjectKind[]> {
    return [
        ProjectKind.SDTM,
        ProjectKind.ADaM,
        ProjectKind.TFLs,
    ]
}

export async function projectStatus(param: {
    product: string,
    trial: string,
    purpose: string,
    kind: ProjectKind,
    config: string,
    qcIgnore: string[],
}): Promise<Item[]> {
    const result: InspectionResult[] = await invoke("inspect_summary", { param });
    return result.map((r: InspectionResult) => {
        const { item, productionResult, validationResult, qc, qcSupp } = r;
        const qcResult: Status[] = [status(qc)];
        if (qcSupp) {
            qcResult.push(status(qcSupp));
        }
        return {
            name: item,
            group: [{
                startCoding: r.productionResult.startCoding,
                group: Group.Production,
                log: status(productionResult.log),
                sequence: status(productionResult.sequence),
            }, {
                startCoding: r.validationResult.startCoding,
                group: Group.Validation,
                log: status(validationResult.log),
                sequence: status(validationResult.sequence),
            }],
            qcResult,
        };
    });
}

export async function sequenceStatus(param: SequenceDetailRequest): Promise<SequenceStatus> {
    const sequenceResult: AuditSequenceResult[] = await invoke("sequence_detail", { param });
    console.log(sequenceResult);
    return {
        timeline: buildTimeline(sequenceResult),
        detail: buildSequenceDetail(sequenceResult),
    };
}

function buildSequenceDetail(sequenceResult: AuditSequenceResult[]): SequenceDetail[] {
    const production = sequenceResult[0].sequences;
    const validation = sequenceResult[1].sequences;
    const convert = (s: SequenceResult[]): SequenceGroup[] => {
        return s.map(s => {
            return {
                item: s.name,
                group: s.group,
                status: status(s.status),
            }
        });
    };
    const code: SequenceDetail = {
        kind: "Code",
        group: convert(production.filter(s => s.kind === "Code").concat(validation.filter(s => s.kind === "Code")))
    };
    const mainData: SequenceDetail = {
        kind: "Data",
        group: convert(production.filter(s => s.kind === "Data" && !s.name.includes("supp")).concat(validation.filter(s => s.kind === "Data" && !s.name.includes("supp")))),
    };
    const suppData: SequenceDetail = {
        kind: "Data",
        group: convert(production.filter(s => s.kind === "Data" && s.name.includes("supp")).concat(validation.filter(s => s.kind === "Data" && s.name.includes("supp")))),
    };
    const mainXpt: SequenceDetail = {
        kind: "Xpt",
        group: convert(production.filter(s => s.kind === "Xpt" && !s.name.includes("supp"))),
    };
    const suppXpt: SequenceDetail = {
        kind: "Xpt",
        group: convert(production.filter(s => s.kind === "Xpt" && s.name.includes("supp"))),
    };

    const log: SequenceDetail = {
        kind: "Log",
        group: convert(production.filter(s => s.kind === "Log").concat(validation.filter(s => s.kind === "Log"))),
    };
    const mainQc: SequenceDetail = {
        kind: "Qc",
        group: convert(validation.filter(s => s.kind === "Qc" && !s.name.includes("supp"))),
    };
    const suppQc: SequenceDetail = {
        kind: "Qc",
        group: convert(validation.filter(s => s.kind === "Qc" && s.name.includes("supp"))),
    };
    const output: SequenceDetail = {
        kind: "Output",
        group: convert(production.filter(s => s.kind === "Output")),
    };
    return [code, mainData, suppData, mainXpt, suppXpt, output, mainQc, suppQc, log].filter(d => d.group.length > 0);
}

function buildTimeline(auditResult: AuditSequenceResult[]): Timeline[] {
    const sequences = [];
    for (const result of auditResult) {
        sequences.push(...result.sequences);
    }
    return sequences.filter(s => s.status !== "Missing").map(s => {
        return {
            timestamp: s.modifiedAt ? s.modifiedAt.slice(0, 22) : s.modifiedAt,
            item: s.name,
            kind: s.kind,
            group: s.group,
            pass: s.status === "Pass",
        }
    }).sort((x, y) => x.timestamp.localeCompare(y.timestamp));
}

export async function logDetail(param: LogDetailRequest): Promise<LogDetail> {
    const result: LogDetailResult = await invoke("log_detail", { param });
    return {
        status: status(result.status),
        details: result.details,
    }
}

export async function qcDetailMain(param: QcDetailRequest): Promise<QcDetail> {
    const result = await qcDetail(param);
    return result[0];
}

export async function qcDetailSupp(param: QcDetailRequest): Promise<QcDetail> {
    const result = await qcDetail(param);
    return result[1];
}

export async function openQcFile(param: OpenQcDetailParam) {
    await invoke("open_qc_file", { param })
}

async function qcDetail(param: QcDetailRequest): Promise<QcDetail[]> {
    const result: QcDetailResult[] = await invoke("qc_detail", { param });
    return result.map(row => {
        return {
            itemType: row.itemType,
            status: status(row.status),
        }
    });
}

export async function graphData(param: {
    product: string,
    trial: string,
    purpose: string,
    kind: ProjectKind,
    config: string,
    qcIgnore: string[]
}): Promise<GraphData> {
    const items = await projectStatus(param);
    let logPass = 0;
    let qcPass = 0;
    let logTotal = 0;
    let qcTotal = 0;
    let notStart = 0;
    let building = 0;
    let complete = 0;
    for (const item of items) {
        let isComplete = true;
        item.group.forEach(group => {
            logTotal++;
            group.startCoding ? null : notStart++;
            if (group.log.kind === StatusKind.Pass) {
                logPass++;
            } else {
                isComplete = false;
            }
        });
        item.qcResult.forEach(qc => {
            qcTotal++;
            if (qc.kind === StatusKind.Pass) {
                qcPass++;
            } else {
                isComplete = false;
            }
        });
        isComplete ? complete++ : building++;
    }
    return {
        logPassPercentage: Math.round((logPass / logTotal * 10000)) / 100,
        qcPassPercentage: Math.round((qcPass / qcTotal * 10000)) / 100,
        complete,
        building,
        notStart,
    }
}

export interface GraphData {
    logPassPercentage: number,
    qcPassPercentage: number,
    complete: number,
    building: number,
    notStart: number,
}

export interface QcDetail {
    itemType: string,
    status: Status,
}

export interface LogDetail {
    status: Status,
    details: LogRow[],
}

export interface LogRow {
    row: number,
    content: string,
    pass: boolean,
}

export interface LogDetailResult {
    status: ItemStatus,
    details: LogRow[]
}

export interface QcDetailResult {
    itemType: string,
    status: ItemStatus,
}

export interface SequenceStatus {
    timeline: Timeline[],
    detail: SequenceDetail[],
}


export interface Timeline {
    timestamp: string,
    item: string,
    kind: string,
    group: Group,
    pass: boolean,
}

export interface SequenceDetail {
    kind: string,
    group: SequenceGroup[],
}

export interface SequenceGroup {
    item: string,
    group: Group,
    status: Status,
}

export interface Product {
    id: string,
    name: string,
    trials: Trial[],
}

export interface Trial {
    id: string,
    name: string,
    purposes: Purpose[],
}

export interface Purpose {
    id: string,
    name: string,
}

export interface Project {
    product: string,
    trial: string,
    purpose: string,
}

export enum ProjectKind {
    SDTM = "SDTM",
    ADaM = "ADaM",
    TFLs = "TFLs",
    UNKNOWN = ""
}

export enum StatusKind {
    Pass = "Pass",
    Failed = "Failed",
    Missing = "Missing",
}

export interface Status {
    kind: StatusKind,
    message: string,
}

export enum Group {
    Production = "Production",
    Validation = "Validation",
}

export interface Item {
    name: string,
    group: ItemGroup[],
    qcResult: Status[],
}

export interface ItemGroup {
    group: Group,
    startCoding: boolean,
    log: Status,
    sequence: Status,
}

interface InspectionResult {
    item: string,
    qc: ItemStatus,
    qcSupp: ItemStatus | null,
    productionResult: IndividualResult,
    validationResult: IndividualResult,
}

interface IndividualResult {
    startCoding: boolean,
    log: ItemStatus;
    sequence: ItemStatus;
}

type ItemStatus = "Pass" | { Failed: string } | "Missing";

export interface LogDetailRequest {
    product: string,
    trial: string,
    purpose: string,
    kind: ProjectKind,
    item: string,
    group: Group,
}

export interface QcDetailRequest {
    product: string,
    trial: string,
    purpose: string,
    kind: ProjectKind,
    item: string,
    ignore: string[],
}

export interface OpenQcDetailParam {
    product: string,
    trial: string,
    purpose: string,
    item: string,
    kind: ProjectKind,
    supp: boolean,
}

export interface AuditSequenceResult {
    status: ItemStatus,
    sequences: SequenceResult[],
}

export interface SequenceDetailRequest {
    product: string,
    trial: string,
    purpose: string,
    kind: ProjectKind,
    item: string,
    supp: boolean,
}

export interface SequenceResult {
    name: string,
    kind: string,
    status: ItemStatus,
    group: Group,
    modifiedAt: string,
}

function status(source: ItemStatus): Status {
    if (source === "Pass") {
        return { kind: StatusKind.Pass, message: "" };
    } else if (source === "Missing") {
        return { kind: StatusKind.Missing, message: "" };
    } else {
        return { kind: StatusKind.Failed, message: source.Failed };
    }
}

