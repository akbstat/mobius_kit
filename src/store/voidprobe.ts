import { defineStore } from "pinia";
import { Result } from '../views/voidprobe/result';

export const useVoidProbeStore = defineStore("voidProbe", {
    state: () => ({
        directory: "",
        result: [] as Result[],
    }),
});