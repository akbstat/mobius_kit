import { defineStore } from "pinia";
import { Item } from '../views/inspector/project';

export const useInspector = defineStore("inspector", {
    state: () => ({
        project: [] as Item[]
    }),
});