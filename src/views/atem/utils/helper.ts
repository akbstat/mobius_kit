import { storeToRefs } from "pinia";
import { EpPropMergeType } from "element-plus/es/utils/index.mjs";
import { useAtem } from "../../../store/atem";
import { Annotation, AnnotationCollection } from "../../../api/atem/annotation/interfaces/annotation";
import { ItemAnnotation, ItemOptionAnnotation, ItemUnitAnnotation } from "./interfaces";
import { FormInfo, Item } from "../../../api/atem/rawdata/apis/rawdata";
import { listLanguages, listSdtmVersion } from "../../../api/atem/metadata/apis/sdtm";

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
