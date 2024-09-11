import { ChosenProject } from "../../components/project-list/project";

export interface CreateProjectForm {
    product: string,
    trail: string,
    purpose: string,
    from: string,
}

export function inferChosenProject(rootPath: string): ChosenProject | undefined {
    const paths = rootPath.split("\\");
    const size = paths.length;
    if (size < 4) {
        return undefined;
    }
    return {
        product: paths[size - 4],
        trail: paths[size - 3],
        purpose: paths[size - 1],
    }
}

export enum ProjectKind {
    SDTM = "SDTM",
    ADaM = "ADaM",
    TFLs = "TFLs",
    UNKNOWN = ""
}

export const purposes = [
    "draft",
    "csr",
    "idmc",
    "final",
    "nda",
    "dryrun",
    "adhoc",
    "cde",
    "interim",
    "ind",
].sort((x, y) => x.toUpperCase().localeCompare(y.toUpperCase())).map(p => {
    return { value: p };
});

export interface Item {
    name: string,
    developer: string,
}