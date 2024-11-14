export interface GeneralConfig {
    top: string,
    source: string,
    destination: string,
}


export interface Task {
    language: "EN" | "CN",
    name: string,
    cover: string,
    mode: "PDF" | "RTF",
    files: File[],
    destination: string,
}

export interface File {
    title: string,
    path: string,
    filename: string,
}

