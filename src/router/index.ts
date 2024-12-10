import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/home/Home.vue";
// import Inspector from "../views/inspector/Inspector.vue";
import Inspector from "../views/inspector/Inspector.vue";
// import Combiner from "../views/Combiner.vue"
import Divider from "../views/divider/Divider.vue";
import Scaffold from "../views/scaffold/Scaffold.vue";
import VoidProbe from "../views/voidprobe/VoidProbe.vue";
import CodeFlow from "../views/codeflow/CodeFlow.vue";
import Voyager from "../views/voyager/Voyager.vue";
import Fusion from "../views/fusion/Fusion.vue";
import Reflector from "../views/reflector/Reflector.vue";


export const routes: RouteRecordRaw[] = [
    {
        path: "/",
        name: "Home",
        component: Home,
    },
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
    {
        path: "/code-flow",
        name: "Encoding",
        component: CodeFlow,
    },
    {
        path: "/voyager",
        name: "Voyager",
        component: Voyager,
    },
    {
        path: "/fusion",
        name: "Fusion",
        component: Fusion,
    },
    {
        path: "/reflector",
        name: "Reflector",
        component: Reflector,
    },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;