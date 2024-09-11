export interface File {
    name: string,
    path: string,
    type: string,
    size: number,
    modifiedAt: string,
}

export function timestampDisplay(source: number): string {
    return (new Date(source * 1000 + 3600 * 8000)).toISOString().slice(0, 19);
}