export const rtfExtention = ".rtf";

export enum KindName {
    Listing = "Listing",
    Table = "Table",
    Figure = "Figure",
}

enum KindColor {
    Listing = "#0000ff",
    Table = "#ff3300",
    Figure = "#9900ff",
    Unknown = "#ffffff",
}

export class Rtf {
    constructor(name: string, path: string, kind: string, size: number) {
        this.name = name.slice(0, name.length - 4);
        this.path = path;
        this.size = Math.ceil(size / 1024 / 1024 * 100) / 100;
        this.kind = kind;
        switch (this.kind) {
            case KindName.Table:
                this.color = KindColor.Table;
                break;
            case KindName.Listing:
                this.color = KindColor.Listing;
                break;
            case KindName.Figure:
                this.color = KindColor.Figure;
                break;
            default:
                this.color = KindColor.Unknown;
        }
    }
    kind: string;
    path: string;
    name: string;
    color: KindColor;
    size: number;
}


