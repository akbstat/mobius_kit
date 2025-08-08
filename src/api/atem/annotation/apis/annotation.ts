import { invoke } from "@tauri-apps/api";
import { AnnotationCollection, AnnotationKind, AnnotationVersion, CreateAnnotationRequest, CreateAnnotationVersionRequest, CreateOrUpdateAnnotationRequest, UpdateAnnotationRequest } from "../interfaces/annotation";
import { useAtem } from "../../../../store/atem";
import { Item, ItemOption, ItemUnit } from "../../rawdata/apis/rawdata";

export async function listAnnotationVersion(projectVersionId: number): Promise<AnnotationVersion[]> {
    const versions = await invoke<AnnotationVersion[]>("list_annotation_version", { request: { projectVersionId } });
    return versions;
}

export async function listAnnotationByForm(request: { formId: number, annotationVersionId?: number }): Promise<AnnotationCollection> {
    const annotations = await invoke<AnnotationCollection>("list_annotation_by_form", { request });
    [annotations.form, annotations.item, annotations.value, annotations.unit, annotations.option].forEach(target => {
        target.forEach(annotation => {
            annotation.kind = annotationKindConvert(annotation.kind as string);
        });
    });
    return annotations;
}

export async function createOrUpdateAnnotation(request: CreateOrUpdateAnnotationRequest): Promise<void> {
    const { id, annotationVersionId, formId, location, assign, annotationDisplay, newVariable, notSubmit, logSpread } = request;
    const { sourceId, kind } = location;

    // update annotation
    if (id) {
        await updateAnnotation(id, {
            assign: assign,
            annotationDisplay: annotationDisplay,
            variable: notSubmit ? undefined : newVariable,
            notSubmit,
        });
        return;
    }

    // create annotation
    const sourceIdList = logSpread ? await traceLoglineIds(sourceId, kind as AnnotationKind) : [sourceId];
    for (const sourceId of sourceIdList) {
        await createAnnotation({
            annotationVersionId,
            formId,
            location: {
                sourceId,
                kind: annotationKindToString(kind as AnnotationKind),
            },
            assign,
            annotationDisplay,
            variable: notSubmit ? undefined : newVariable,
        });
    }
}

export async function removeAnnotation(id: number): Promise<void> {
    await invoke("remove_annotation", { id });
}

export async function createAnnotationVersion(request: CreateAnnotationVersionRequest): Promise<void> {
    await invoke("create_annotation_version", { request });
}

export async function modifyAnnotationVersion(request: AnnotationVersion) {
    await invoke("modify_annotation_version", { id: request.id, request: { name: request.name, description: request.description } });
}

export async function removeAnnotationVersion(id: number) {
    console.log(`Removeing annotation version: ${id}`);
}

async function createAnnotation(request: CreateAnnotationRequest): Promise<void> {
    await invoke("create_annotation", { request });
}

async function updateAnnotation(id: number, request: UpdateAnnotationRequest): Promise<void> {
    await invoke("update_annotation", { id, request });
}

async function traceLoglineIds(sourceId: number, kind: AnnotationKind): Promise<number[]> {
    if (kind === AnnotationKind.Form) {
        return [sourceId]
    }
    const traceKey = await buildTraceKey(sourceId, kind);
    const loglineTracer = useAtem().loglineTracer;
    return loglineTracer.get(traceKey) || [];
}

async function buildTraceKey(sourceId: number, kind: AnnotationKind): Promise<string> {
    if (kind === AnnotationKind.Item || kind === AnnotationKind.ItemValue) {
        const item = await getItemById(sourceId);
        return item ? item.name : "";
    }
    if (kind === AnnotationKind.Option) {
        const option = await getOptionById(sourceId);
        if (!option) {
            return "";
        }
        const item = await getItemById(option.itemId);
        return `${item?.name}|O|${option.optionOrder}`;
    }
    if (kind === AnnotationKind.Unit) {
        const unit = await getUnitById(sourceId);
        if (!unit) {
            return "";
        }
        const item = await getItemById(unit.itemId);
        return `${item?.name}|U|${unit.unitOrder}`;
    }
    return "";
}

async function getItemById(sourceId: number): Promise<Item | undefined> {
    return await invoke<Item | undefined>("get_item_by_id", { id: sourceId });
}

async function getOptionById(sourceId: number): Promise<ItemOption | undefined> {
    return await invoke<ItemOption | undefined>("get_option_by_id", { id: sourceId });
}

async function getUnitById(sourceId: number): Promise<ItemUnit | undefined> {
    return await invoke<ItemUnit | undefined>("get_unit_by_id", { id: sourceId });
}

function annotationKindConvert(kind: string): AnnotationKind {
    switch (kind) {
        case "Form":
            return AnnotationKind.Form;
        case "Item":
            return AnnotationKind.Item;
        case "Value":
            return AnnotationKind.ItemValue;
        case "Unit":
            return AnnotationKind.Unit;
        case "Option":
            return AnnotationKind.Option;
        default:
            throw new Error(`Unknown annotation kind: ${kind}`);
    }
}

function annotationKindToString(kind: AnnotationKind): string {
    return ["Form", "Item", "Value", "Unit", "Option"][kind];
}