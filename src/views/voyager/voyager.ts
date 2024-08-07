import { PageDescription as PageDescriptionRaw, Annotation as AnnotationRaw } from "../../api/voyager/voyager";


export interface PageDescription {
    description: string,
    page: number[]
}

export class Annotation {
    domain: string;
    supp: boolean;
    variable: string;
    page: number[];
    pageDescription: PageDescription[]

    constructor(raw: AnnotationRaw) {
        const { domain, supp, variable, page_description } = raw;
        this.domain = domain;
        this.supp = supp;
        this.variable = variable;
        this.page = [];
        this.pageDescription = [];
        const descriptionSet: Map<string, number[]> = new Map();
        page_description.forEach((page: PageDescriptionRaw) => {
            page.description.forEach((description) => {
                let pages = descriptionSet.get(description)
                if (pages) {
                    pages.push(page.page);
                    descriptionSet.set(description, pages);
                } else {
                    descriptionSet.set(description, [page.page]);
                }
            });
            this.page.push(page.page);
        })
        for (const key of descriptionSet.keys()) {
            if (key.length > 0) {
                const pageDescription = { description: key, page: descriptionSet.get(key) as number[] };
                this.pageDescription.push(pageDescription);
            }
        }
    }
}