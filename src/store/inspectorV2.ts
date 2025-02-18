import { defineStore } from "pinia";
import { ProjectKind } from "../api/inspector/inspector";

export const useInspector = defineStore("inspectorV2", {
    state: () => ({
        configFile: "",
        project: { product: "", trial: "", purpose: "" },
        selectedKind: ProjectKind.SDTM,
        qcIgnore: [] as string[],
    }),
});