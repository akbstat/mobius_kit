import { defineStore } from "pinia";
import { Item } from '../views/project/project';

export const useInspector = defineStore("inspector", {
    state: () => ({
        project: [] as Item[]
    }),
});