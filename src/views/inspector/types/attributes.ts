export class TypeLabelAttribute {
    public constructor(value: string, backgroundColor: string, fontColor: string) {
        this.value = value;
        this.fontColor = fontColor;
        this.backgroundColor = backgroundColor;
    }
    value: string;
    fontColor: string;
    backgroundColor: string;
}

const FileTypeLabelAttrs = {
    "sas": new TypeLabelAttribute("SasCode", "#4d94ff", "#ffffff"),
    "sas7bdat": new TypeLabelAttribute("SasData", "#666699", "#ffffff"),
    "log": new TypeLabelAttribute("SasLog", "#d1d1e0", "#3d3d5c"),
    "xpt": new TypeLabelAttribute("XPT", "#ff661a", "#ffffff"),
    "rtf": new TypeLabelAttribute("RTF", "#bb33ff", "#ffffff"),
    "pdf": new TypeLabelAttribute("PDF", "#ff0000", "#ffffff"),
    "sas7bcat": new TypeLabelAttribute("SasMacro", "#ffff1a", "#1a1a00"),
    "xlsx": new TypeLabelAttribute("Excel", "#00cc00", "#ffffff"),
    "xls": new TypeLabelAttribute("Excel", "#00cc00", "#ffffff"),
    "csv": new TypeLabelAttribute("Excel", "#00cc00", "#ffffff"),
    "docx": new TypeLabelAttribute("Word", "#0000ff", "#ffffff"),
    "txt": new TypeLabelAttribute("TXT", "#d1d1e0", "#3d3d5c"),
    "vbs": new TypeLabelAttribute("Other", "#996633", "#ffffff"),
    "other": new TypeLabelAttribute("Other", "#996633", "#ffffff"),
}

type FileTypeLabelAttrsKey = keyof typeof FileTypeLabelAttrs;

export function getType(extention: string): TypeLabelAttribute {
    for (let key of Object.keys(FileTypeLabelAttrs)) {
        if (extention === key) {
            return FileTypeLabelAttrs[key as FileTypeLabelAttrsKey]
        }
    }
    return FileTypeLabelAttrs["other"]
}