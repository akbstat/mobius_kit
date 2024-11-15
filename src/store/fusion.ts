import { defineStore } from "pinia";
import { FusionConfig } from "../api/fusion/config";

export const useFusion = defineStore("fusion", {
    state: (): { fusionConfig: FusionConfig, previousTaskStartTime: number } => ({
        fusionConfig: {
            id: null,
            source: "",
            destination: "",
            top: "",
            tasks: [],
        },
        previousTaskStartTime: 0,
    }),
});