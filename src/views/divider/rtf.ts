export const rtfExtention = ".rtf";

export enum Prefix {
    Listing = "L",
    Table = "T",
    Figure = "F",
}

export enum Kind {
    Listing,
    Table,
    Figure,
    Unknown
}

enum KindColor {
    Listing = "#0000ff",
    Table = "#ff3300",
    Figure = "#9900ff",
    Unknown = "#ffffff",
}

export class Rtf {
    constructor(name: string, path: string) {
        this.name = name.slice(0, name.length - 4);
        this.path = path;
        const prefix = name[0].toUpperCase();
        switch (prefix) {
            case Prefix.Table:
                this.kind = Kind.Table;
                this.color = KindColor.Table;
                break;
            case Prefix.Listing:
                this.kind = Kind.Listing;
                this.color = KindColor.Listing;
                break;
            case Prefix.Figure:
                this.kind = Kind.Figure;
                this.color = KindColor.Figure;
                break;
            default:
                this.kind = Kind.Unknown;
                this.color = KindColor.Unknown;
        }
    }
    kind: Kind;
    path: string;
    name: string;
    color: KindColor;

    kindValue(): string {
        if (this.kind === Kind.Listing) {
            return "Listing";
        }
        if (this.kind === Kind.Table) {
            return "Table";
        }
        if (this.kind === Kind.Figure) {
            return "Figure";
        }
        return "Unknown";
    }
}


