import { defineStore } from "pinia";
import { ProjectKind } from "../views/inspector/project";

export const useInspector = defineStore("inspector", {
    state: () => ({
        config: "",
        configFileList: [] as string[],
        root: "",
        projectKind: ProjectKind.SDTM
    }),
});