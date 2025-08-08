import { ItemType } from "../../rawdata/apis/rawdata";

export interface CreateOrUpdateAnnotationRequest {
    annotationVersionId: number,
    formId: number,
    id?: number;
    location: AnnotationLocation;
    assign: boolean;
    annotationDisplay: string;
    newVariable?: NewAnnotationVariable;
    notSubmit: boolean,
    logSpread?: boolean,
}

export interface AnnotationVariable {
    id: number;
    domainId: number;
    name: string;
    supp: boolean;
}

export interface Annotation {
    id: number;
    annotationVersionId: number;
    formId: number;
    variable?: AnnotationVariable;
    sourceId: number;
    kind: AnnotationKind | string;
    annotationDisplay: string;
    assign: boolean;
}

export interface AnnotationContent {
    id: number;
    variable?: AnnotationVariable;
    assign: boolean;
    value: string;
}

export interface AnnotationLocation {
    sourceId: number;
    kind: AnnotationKind | string;
}

export interface NewAnnotationVariable {
    domainId: number;
    variableName: string;
    supp: boolean;
}

export interface CreateAnnotationRequest {
    annotationVersionId: number;
    formId: number;
    location: {
        sourceId: number,
        kind: string,
    };
    assign: boolean;
    annotationDisplay: string;
    variable?: NewAnnotationVariable;
}

export interface UpdateAnnotationRequest {
    variable?: NewAnnotationVariable;
    annotationDisplay: string;
    assign: boolean;
    notSubmit: boolean;
}

export enum AnnotationKind {
    Form,
    Item,
    ItemValue,
    Unit,
    Option,
}

export interface AnnotationCollection {
    form: Annotation[];
    item: Annotation[];
    value: Annotation[];
    unit: Annotation[];
    option: Annotation[];
}

export interface ItemAnnotation {
    id: number;
    name: string;
    label: string;
    itemOrder: number;
    itemOption: ItemOptionAnnotation[];
    itemUnit: ItemUnitAnnotation[];
    itemType?: ItemType;
    itemRepeatIndex: number;
    itemDefualtValue: ItemValueAnnotation;
    annotation: Annotation[];
}

export interface ItemOptionAnnotation {
    id: number;
    optionValue: string,
    optionDisplay: string,
    optionOrder: number,
    annotation: Annotation[];
}

export interface ItemOptionAnnotation {
    id: number;
    optionValue: string,
    optionDisplay: string,
    optionOrder: number,
    annotation: Annotation[];
}

export interface ItemUnitAnnotation {
    id: number,
    name: string,
    unitOrder: number,
    annotation: Annotation[];
}

export interface ItemValueAnnotation {
    value: string,
    annotation: Annotation[];
}

export interface AnnotationVersion {
    id: number;
    projectVersionId: number;
    name: string;
    description: string;
}

export interface CreateAnnotationVersionRequest {
    projectVersionId: number;
    name: string;
    description: string;
}