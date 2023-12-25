import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import Inspector from "../views/inspector/Inspector.vue";
import Combiner from "../views/Combiner.vue"
import Divider from "../views/divider/Divider.vue"


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
    }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;