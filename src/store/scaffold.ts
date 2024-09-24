import { defineStore } from "pinia";
import { ChosenProject } from "../components/project-list/project";
import { ProjectKind } from "../views/scaffold/scaffold";

export const useScaffold = defineStore("scaffold", {
    state: () => ({
        chosenProject: {} as ChosenProject,
        openedTab: "builder",
        projectKind: ProjectKind.SDTM,
        trace: [] as string[]
    }),
});