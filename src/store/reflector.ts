import { defineStore } from "pinia";
import { Event, EventMode } from "../views/reflector/entity/reflector";

export const useReflector = defineStore("reflector", {
    state: () => ({
        event: new Event([], [], [], EventMode.FORM),
    }),
});