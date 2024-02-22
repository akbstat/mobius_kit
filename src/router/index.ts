import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import Inspector from "../views/inspector/Inspector.vue";
import Project from "../views/project/Project.vue";
import Combiner from "../views/Combiner.vue"
import Divider from "../views/divider/Divider.vue"
import Scaffold from "../views/Scaffold.vue"
import VoidProbe from "../views/voidprobe/VoidProbe.vue"


const routes: RouteRecordRaw[] = [
    {
        path: "/",
        name: "home",
        component: Home,
    },
    {
        path: "/combiner",
        name: "combiner",
        component: Combiner,
    },
    {
        path: "/inspector",
        name: "inspector",
        component: Inspector,
    },
    {
        path: "/divider",
        name: "divider",
        component: Divider,
    },
    {
        path: "/project",
        name: "project",
        component: Project,
    },
    {
        path: "/scaffold",
        name: "scaffold",
        component: Scaffold,
    },
    {
        path: "/void-probe",
        name: "void-probe",
        component: VoidProbe,
    }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;