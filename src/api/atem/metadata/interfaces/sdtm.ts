export interface Language {
    id: number;
    name: string;
}

export interface ListLanguageReply {
    data: Language[];
}

export interface SdtmVersion {
    id: number;
    name: string;
}

export interface ListSdtmVersionRequest {
    langId: number;
}

export interface ListSdtmVersionReply {
    data: SdtmVersion[];
}

export interface SdtmDomain {
    id?: number;
    name: string;
    description: string;
}

export interface ListSdtmDomainsRequest {
    versionId: number;
}

export interface ListSdtmDomainsReply {
    data: SdtmDomain[];
}

export interface SdtmVariable {
    id: number;
    name: string;
    label: string;
    variableType: string;
    codelist: string;
    variableCore: string;
    variableRole: string;
    variableOrder: number;
}

export interface ListSdtmVariableRequest {
    domainId: number;
}

export interface ListSdtmVariableReply {
    data: SdtmVariable[];
}

