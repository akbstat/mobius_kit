import { defineStore } from "pinia";
import { FilterOption, ProjectKind } from "../api/inspector/inspector";

export const useInspector = defineStore("inspectorV2", {
    state: () => ({
        configFile: "",
        trackerFile: "",
        selectedKind: ProjectKind.SDTM,
        qcIgnore: [] as string[],
        filterConfigMap: new Map<string, FilterOption>(),
        externalLogPatterns: {
            issue: [] as string[],
            whiteList: [] as string[],
        }
    }),
});