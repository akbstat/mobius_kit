import { defineStore } from "pinia";
import { Domain } from "../api/atem/annotation/interfaces/domain";

export const useAtem = defineStore("atem", {
    state: () => ({
        domainOrder: new Map<number, number>(),
        activeProjectVersionId: undefined as number | undefined,
        activeFormId: undefined as number | undefined,
        activeAnnoationVersionId: undefined as number | undefined,
        activeFormDomains: [] as Domain[],
        languageId: 0 as number | undefined,
        sdtmVersionId: 0 as number | undefined,
        scrollValue: 0,
        logSpread: true,
        loglineTracer: new Map<string, number[]>(),
        multiOperation: false,
        multiSelector: new MultiSelector(),
    }),
});

export class MultiSelector {
    itemId: Set<number> = new Set();
    itemValueId: Set<number> = new Set();
    optionId: Set<number> = new Set();
    unitId: Set<number> = new Set();
    constructor() { }
    reset() {
        this.itemId.clear();
        this.itemValueId.clear();
        this.optionId.clear();
        this.unitId.clear();
    }
}

