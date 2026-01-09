// TypeScript equivalent of the OpenProjectFileParam struct

export interface OpenProjectFileParam {
  product: string;
  trial: string;
  purpose: string;
  item: string;
  kind: Kind;
  fileType: FileType;
  supp: boolean;
  group: Group;
}

// Enums for Kind, FileType, and Group
export enum Kind {
  SDTM = "SDTM",
  ADaM = "ADaM",
  TFLs = "TFLs",
}

export enum FileType {
  Code = "Code",
  Log = "Log",
  Data = "Data",
  Xpt = "Xpt",
  Output = "Output",
  Qc = "Qc",
}

export enum Group {
  Production = "Production",
  Validation = "Validation",
}