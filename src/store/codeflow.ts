import { defineStore } from "pinia";

export const useCodeFlow = defineStore("codeflow", {
    state: () => ({
        directory: "",
    }),
});