import { defineStore } from "pinia";

export const useProjectContext = defineStore("projectContext", {
    state: () => ({
        project: undefined as { product: string; trial: string, purpose: string } | undefined,
    }),
});