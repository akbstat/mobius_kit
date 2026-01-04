import { storeToRefs } from "pinia";
import { EpPropMergeType } from "element-plus/es/utils/index.mjs";
import { useAtem } from "../../../store/atem";
import { Annotation, AnnotationCollection } from "../../../api/atem/annotation/interfaces/annotation";
import { ItemAnnotation, ItemOptionAnnotation, ItemUnitAnnotation } from "./interfaces";
import { FormInfo, Item, listProjectVersions } from "../../../api/atem/rawdata/apis/rawdata";
import { listLanguages, listSdtmVersion } from "../../../api/atem/metadata/apis/sdtm";
import { listAnnotationVersion } from "../../../api/atem/annotation/apis/annotation";




export async function fetchDefaultProjectVersionId(project: { product: string, trial: string } | undefined): Promise<number | undefined> {
    if (!project) {
        return undefined;
    }
    const { product, trial } = project;
    const versions = (await listProjectVersions({ product, trial })).data;
    if (versions.length === 0) { return undefined; }
    versions.sort((x, y) => x.id - y.id > 0 ? -1 : 1);
    return versions[0].id;
}

export async function fetchDefaultAnnotationVersionId(proejctVersionId: number): Promise<number | undefined> {
    const versions = (await listAnnotationVersion(proejctVersionId))
    if (versions.length === 0) { return undefined; }
    versions.sort((x, y) => x.id - y.id > 0 ? -1 : 1);
    return versions[0].id;
}


export function tagStyle(order: number): EpPropMergeType<StringConstructor, "success" | "warning" | "info" | "primary" | "danger", unknown> | undefined {
    switch (order) {
        case 0:
            return "primary";
        case 1:
            return "warning";
        case 2:
            return "success";
        case 3:
            return "danger";
        default:
            return "info";
    }
}

export function getDomainOrderNumber(domainId: number | undefined): number {
    if (!domainId) {
        return 0;
    }
    const store = useAtem();
    const { domainOrder } = storeToRefs(store);
    let order = domainOrder.value.get(domainId);
    return (typeof (order) !== "undefined") ? order as number : -1;
}

export function buildFormAnnotation(annotations?: AnnotationCollection): Annotation[] {
    if (!annotations) {
        return [];
    }
    const form = annotations.form;
    form.sort((x, y) => {
        const variableX = x.variable;
        const variableY = y.variable;
        if (variableX && variableY) {
            return variableX.domainId - variableY.domainId;
        }
        return 0;
    });
    return form;
}

export function buildItemsAnnotation(items: Item[], annotations?: AnnotationCollection): ItemAnnotation[] {
    if (!annotations) {
        return itemToItemAnnotation(items);
    }
    const itemAnnotations = buildAnnotationMap(annotations.item);
    const valueAnnotations = buildAnnotationMap(annotations.value);
    const unitAnnotations = buildAnnotationMap(annotations.unit);
    const optionAnnotations = buildAnnotationMap(annotations.option);
    const result = items.map(item => {
        const {
            id,
            name,
            label,
            itemType,
            itemOrder,
            itemDefualtValue,
            itemOption,
            itemUnit,
            itemRepeatIndex,
        } = item;
        return {
            id,
            name,
            label,
            itemType,
            itemOrder,
            itemRepeatIndex: itemRepeatIndex,
            itemDefualtValue: { value: itemDefualtValue, annotation: valueAnnotations.get(id) },
            itemUnit: itemUnit?.map(u => {
                const unit: ItemUnitAnnotation = u;
                unit.annotation = unitAnnotations.get(u.id);
                return unit;
            }),
            itemOption: itemOption?.map(opt => {
                const option: ItemOptionAnnotation = opt;
                option.annotation = optionAnnotations.get(option.id);
                return option;
            }),
            annotation: itemAnnotations.get(id),
        } as ItemAnnotation;
    })
    return result;
}

function itemToItemAnnotation(items: Item[]): ItemAnnotation[] {
    const itemAnnotation = items.map(item => {
        const {
            id,
            name,
            label,
            itemType,
            itemOrder,
            itemDefualtValue,
            itemOption,
            itemUnit,
            itemRepeatIndex,
        } = item;
        return {
            id,
            name,
            label,
            itemType,
            itemOrder,
            itemRepeatIndex: itemRepeatIndex,
            itemDefualtValue: { value: itemDefualtValue },
            itemUnit: itemUnit,
            itemOption: itemOption,
        } as ItemAnnotation;
    })
    return itemAnnotation;
}



function buildAnnotationMap(source: Annotation[]): Map<number, Annotation[]> {
    const mapper = new Map<number, Annotation[]>();
    source?.forEach(annotation => {
        const { sourceId } = annotation;
        const list = mapper.get(sourceId);
        if (list) {
            list.push(annotation);
            list.sort((x, y) => {
                const variableX = x.variable;
                const variableY = y.variable;
                if (variableX && variableY) {
                    return variableX.domainId - variableY.domainId;
                }
                return 0;
            });
            mapper.set(sourceId, list);
        } else {
            mapper.set(sourceId, [annotation]);
        }
    });
    return mapper;
}

export function getFirstFormId(forms: FormInfo[] | undefined): number | undefined {
    if ((!forms) || forms.length === 0) {
        return undefined;
    }
    return forms[0].id;
}

export async function getDefaultSdtmVersionAndLanguageId(): Promise<{ sdtmVersion: number | undefined, language: number | undefined }> {
    const languages = await listLanguages();
    const language = languages.length > 0 ? languages[0].id : undefined;
    const sdtmVersion = language ? (await listSdtmVersion(language as number))[0].id : undefined;
    return { language, sdtmVersion }
}


export function loglineTracing(annotations: ItemAnnotation[]): Map<string, number[]> {
    const mapper = new Map<string, number[]>();
    annotations.forEach(annotation => {
        const ids = mapper.get(annotation.name);
        if (ids) {
            ids.push(annotation.id);
        } else {
            mapper.set(annotation.name, [annotation.id]);
        }
        annotation.itemOption?.forEach(option => {
            const optionName = `${annotation.name}|O|${option.optionOrder}`;
            const optionIds = mapper.get(optionName);
            if (optionIds) {
                optionIds.push(option.id);
            } else {
                mapper.set(optionName, [option.id]);
            }
        });
        annotation.itemUnit?.forEach(unit => {
            const unitName = `${annotation.name}|U|${unit.unitOrder}`;
            const unitIds = mapper.get(unitName);
            if (unitIds) {
                unitIds.push(unit.id);
            } else {
                mapper.set(unitName, [unit.id]);
            }
        });
    });
    return mapper;
}

const ANNOTATION_DISPLAY_REGEX = /^([A-Z]{2,8})(\s=\s(?<value>.+?))?(\s(when\s(?<whenVariable>[A-Z]{2,8})\s=\s(?<whenValue>(.+))|in\sSUPP[A-Z]{2})|$)/;

export function annotationDisplayAnalyse(content: string): { value: string, whenVariable: string, whenValue: string } {
    const match = content.match(ANNOTATION_DISPLAY_REGEX);
    if (match && match.groups) {
        const { value, whenVariable, whenValue } = match.groups;
        return {
            value: value || "",
            whenVariable: whenVariable || "",
            whenValue: whenValue || "",
        }
    }
    return { value: "", whenVariable: "", whenValue: "" };
}