import { invoke } from "@tauri-apps/api";

export async function listAllProjects(): Promise<Product[]> {
    const products = await invoke("list_products", {});
    console.log(products);
    return products;
    // return [
    //     {
    //         id: "ak101", name: "ak101", trials: [
    //             {
    //                 id: "ak101-101",
    //                 name: "101",
    //                 purposes: [
    //                     { id: "ak101-101-csr", name: "csr" },
    //                     { id: "ak101-101-dryrun", name: "dryrun" },
    //                     { id: "ak101-101-finalrun", name: "finalrun" },
    //                 ],
    //             }, {
    //                 id: "ak101-102",
    //                 name: "102",
    //                 purposes: [
    //                     { id: "ak101-102-csr", name: "csr" },
    //                     { id: "ak101-102-dryrun", name: "dryrun" },
    //                     { id: "ak101-102-finalrun", name: "finalrun" },
    //                 ],
    //             }
    //         ]
    //     },
    //     {
    //         id: "ak102", name: "ak102", trials: [
    //             {
    //                 id: "ak102-101",
    //                 name: "101",
    //                 purposes: [
    //                     { id: "ak102-101-csr", name: "csr" },
    //                     { id: "ak102-101-cdryrun", name: "dryrun" },
    //                     { id: "ak102-101-cfinalrun", name: "finalrun" },
    //                 ],
    //             }, {
    //                 id: "ak102-102",
    //                 name: "102",
    //                 purposes: [
    //                     { id: "ak102-102-ccsr", name: "csr" },
    //                     { id: "ak102-102-dryrun", name: "dryrun" },
    //                     { id: "ak102-102-finalrun", name: "finalrun" },
    //                 ],
    //             }
    //         ]
    //     },
    //     {
    //         id: "ak103", name: "ak103", trials: [
    //             {
    //                 id: "ak103-101",
    //                 name: "101",
    //                 purposes: [
    //                     { id: "ak103-101-csr", name: "csr" },
    //                     { id: "ak103-101-dryrun", name: "dryrun" },
    //                     { id: "ak103-101-finalrun", name: "finalrun" },
    //                 ],
    //             }, {
    //                 id: "ak103-102",
    //                 name: "102",
    //                 purposes: [
    //                     { id: "ak103-102-csr", name: "csr" },
    //                     { id: "ak103-102-dryrun", name: "dryrun" },
    //                     { id: "ak103-102-finalrun", name: "finalrun" },
    //                 ],
    //             }
    //         ]
    //     },
    //     {
    //         id: "ak104", name: "ak104", trials: [
    //             {
    //                 id: "ak104-101",
    //                 name: "101",
    //                 purposes: [
    //                     { id: "ak104-101-csr", name: "csr" },
    //                     { id: "ak104-101-dryrun", name: "dryrun" },
    //                     { id: "ak104-101-finalrun", name: "finalrun" },
    //                 ],
    //             }, {
    //                 id: "ak104-102",
    //                 name: "102",
    //                 purposes: [
    //                     { id: "ak104-102-csr", name: "csr" },
    //                     { id: "ak104-102-dryrun", name: "dryrun" },
    //                     { id: "ak104-102-finalrun", name: "finalrun" },
    //                 ],
    //             }
    //         ]
    //     },
    // ];
}


export async function listHistoryProjects(): Promise<string[]> {
    return [
        "ak104-102-csr",
        "ak104-101-dryrun",
        "ak103-102-finalrun",
        "ak102-102-dryrun",
    ];
}

export async function projectKind(): Promise<ProjectKind[]> {
    return [
        ProjectKind.SDTM,
        ProjectKind.ADaM,
        ProjectKind.TFLs,
    ]
}

export async function projectStatus(): Promise<Item[]> {
    return [
        {
            name: "AE",
            group: [
                {
                    group: Group.Production,
                    log: {
                        kind: StatusKind.Pass,
                        message: ""
                    },
                    missing: false,
                },
                {
                    group: Group.Validation,
                    log: {
                        kind: StatusKind.Failed,
                        message: "Error"
                    },
                    missing: false,
                }
            ],
            qcResult: {
                kind: StatusKind.Pass,
                message: ""
            },
            sequence: {
                kind: StatusKind.Failed,
                message: "File missing"
            }
        },
        {
            name: "LB",
            group: [
                {
                    group: Group.Production,
                    log: {
                        kind: StatusKind.Failed,
                        message: "Warning"
                    },
                    missing: false,
                },
                {
                    group: Group.Validation,
                    log: {
                        kind: StatusKind.Pass,
                        message: ""
                    },
                    missing: false,
                }
            ],
            qcResult: {
                kind: StatusKind.Failed,
                message: "Attribute Difference"
            },
            sequence: {
                kind: StatusKind.Pass,
                message: ""
            }
        },
        {
            name: "EX",
            group: [
                {
                    group: Group.Production,
                    log: {
                        kind: StatusKind.Missing,
                        message: ""
                    },
                    missing: true,
                },
                {
                    group: Group.Validation,
                    log: {
                        kind: StatusKind.Missing,
                        message: ""
                    },
                    missing: true,
                }
            ],
            qcResult: {
                kind: StatusKind.Missing,
                message: ""
            },
            sequence: {
                kind: StatusKind.Failed,
                message: "File missing"
            }
        },
    ];
}

export async function sequenceStatus(_item: string): Promise<SequenceStatus> {
    return {
        timeline: [
            { item: "ae", timestamp: "2024-01-09T14:26:49.000", kind: "SasCode", group: Group.Production, pass: true, },
            { item: "ae", timestamp: "2024-01-09T14:26:49.001", kind: "SasData", group: Group.Validation, pass: false, },
            { item: "ae", timestamp: "2024-01-09T14:26:49.002", kind: "Xpt", group: Group.Production, pass: true, },
        ],
        detail: [
            {
                item: "ae", kind: "SasCode", group: [
                    { group: Group.Production, status: { kind: StatusKind.Missing, message: "" } },
                    { group: Group.Validation, status: { kind: StatusKind.Failed, message: "" } },
                ]
            },
            {
                item: "ae", kind: "SasData", group: [
                    { group: Group.Production, status: { kind: StatusKind.Missing, message: "" } },
                    { group: Group.Validation, status: { kind: StatusKind.Failed, message: "" } },
                ]
            },
            {
                item: "ae", kind: "Log", group: [
                    { group: Group.Production, status: { kind: StatusKind.Pass, message: "" } },
                    { group: Group.Validation, status: { kind: StatusKind.Failed, message: "" } },
                ]
            }
        ],
    };
}

export async function logDetail(item: string): Promise<LogDetail> {
    return {
        item,
        status: { kind: StatusKind.Failed, message: "" },
        group: Group.Production,
        failures: [
            { row: 11, content: "Error" },
            { row: 22, content: "Warning" },
            { row: 33, content: "Uninitalize" },
        ],
    }
}

export async function graphData(): Promise<GraphData> {
    return {
        logPassPercentage: 70,
        qcPassPercentage: 20,
        complete: 9,
        building: 21,
        notStart: 2,
    }
}

export interface GraphData {
    logPassPercentage: number,
    qcPassPercentage: number,
    complete: number,
    building: number,
    notStart: number,
}

export interface LogDetail {
    item: string,
    status: Status,
    group: Group,
    failures: LogFailure[]
}

export interface LogFailure {
    row: number,
    content: string,
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
    item: string,
    kind: string,
    group: SequenceGroup[],
}

export interface SequenceGroup {
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
    qcResult: Status,
    sequence: Status,
}

export interface ItemGroup {
    group: Group,
    log: Status,
    missing: boolean,
}