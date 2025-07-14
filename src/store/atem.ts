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
    }),
});