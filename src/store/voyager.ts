import { defineStore } from "pinia";

export const useVoyager = defineStore("voyager", {
    state: () => ({
        filePath: "",
    }),
});