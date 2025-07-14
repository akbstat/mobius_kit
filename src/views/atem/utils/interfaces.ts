import { Annotation } from "../../../api/atem/annotation/interfaces/annotation";
import { Domain } from "../../../api/atem/annotation/interfaces/domain";
import { ItemType } from "../../../api/atem/rawdata/apis/rawdata";

export interface ItemAnnotation {
    id: number;
    name: string;
    label: string;
    itemOrder: number;
    itemOption?: ItemOptionAnnotation[];
    itemUnit: ItemUnitAnnotation[];
    itemType?: ItemType;
    itemRepeatIndex: number;
    itemDefualtValue: ItemValueAnnotation;
    annotation?: Annotation[];
}

export interface ItemOptionAnnotation {
    id: number;
    optionValue: string,
    optionDisplay: string,
    optionOrder: number,
    annotation?: Annotation[];
}

export interface ItemOptionAnnotation {
    id: number;
    optionValue: string,
    optionDisplay: string,
    optionOrder: number,
    annotation?: Annotation[];
}

export interface ItemUnitAnnotation {
    id: number,
    name: string,
    unitOrder: number,
    annotation?: Annotation[];
}

export interface ItemValueAnnotation {
    value: string,
    annotation?: Annotation[];
}

export interface Config {
    selectedVersionId: number;
    selectedLangId: number;
    logSpread: boolean;
}

export interface FormDetail {
    domain: Domain[],
    annotation: Annotation[],
    item: ItemAnnotation[]
}
