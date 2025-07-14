import { invoke } from "@tauri-apps/api";
import { AnnotationCollection, AnnotationKind, AnnotationVersion, CreateAnnotationRequest, CreateAnnotationVersionRequest, CreateOrUpdateAnnotationRequest, UpdateAnnotationRequest } from "../interfaces/annotation";

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
    const { id, annotationVersionId, formId, location, assign, annotationDisplay, newVariable, notSubmit } = request;
    const { sourceId, kind } = location;
    if (id) {
        await updateAnnotation(id, {
            assign: assign,
            annotationDisplay: annotationDisplay,
            variable: notSubmit ? undefined : newVariable,
            notSubmit,
        });
        return;
    }
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

export async function removeAnnotation(id: number): Promise<void> {
    await invoke("remove_annotation", { id });
}

export async function createAnnotationVersion(request: CreateAnnotationVersionRequest): Promise<void> {
    await invoke("create_annotation_version", { request });
}

export async function modifyAnnotationVersion(request: AnnotationVersion) {
    console.log(`Modify annotation version: ${request}`);
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