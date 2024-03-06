import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/home/Home.vue";
// import Inspector from "../views/inspector/Inspector.vue";
import Inspector from "../views/inspector/Inspector.vue";
// import Combiner from "../views/Combiner.vue"
import Divider from "../views/divider/Divider.vue"
import Scaffold from "../views/scaffold/Scaffold.vue"
import VoidProbe from "../views/voidprobe/VoidProbe.vue"


export const routes: RouteRecordRaw[] = [
    {
        path: "/",
        name: "Home",
        component: Home,
    },
    // {
    //     path: "/combiner",
    //     name: "combiner",
    //     component: Combiner,
    // },
    {
        path: "/divider",
        name: "Divider",
        component: Divider,
    },
    {
        path: "/inspector",
        name: "Inspector",
        component: Inspector,
    },
    // {
    //     path: "/project",
    //     name: "project",
    //     component: Project,
    // },
    {
        path: "/scaffold",
        name: "Scaffold",
        component: Scaffold,
    },
    {
        path: "/void-probe",
        name: "Void Probe",
        component: VoidProbe,
    },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;