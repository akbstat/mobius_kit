export interface Config {
    top: Top,
    output: string,
    destination: string,
}

export interface Top {
    filename: string,
    path: string
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

