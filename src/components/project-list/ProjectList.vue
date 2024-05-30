<script setup lang="ts">
import { ref, watch } from "vue";
import { Product, Trail, Purpose } from "./project";
import { ElMenu } from "element-plus";
import { debounce } from "lodash";

const searchText = ref("");
const { projects } = defineProps<{ projects: Product[] }>();
const projectDisplay = ref<Product[]>(projects);



function filterProject() {
    if (searchText.value.trim().length === 0) {
        projectDisplay.value = projects;
        return;
    }
    projectDisplay.value = projects.map((project: Product) => trimProject(project, searchText.value)).filter((product: Product | undefined) => product) as Product[]
}

function trimProject(project: Product, keyword: string): Product | undefined {
    const trails = project.trails.map((trail: Trail) => {
        const purpose = trail.purpose.filter((purpose: Purpose) => purpose.id.toUpperCase().includes(keyword.toUpperCase()));
        return purpose.length === 0 ? undefined : { id: trail.id, name: trail.name, purpose };
    }).filter((trail: Trail | undefined) => trail) as Trail[];
    return trails.length === 0 ? undefined : { id: project.id, name: project.name, trails };
}

watch(searchText, debounce(filterProject, 100));

</script>

<template>
    <el-container>
        <el-header style="padding: 0;height: auto">
            <el-input v-model="searchText" placeholder="Search Project" clearable></el-input>
        </el-header>
        <el-main style="padding: 0">
            <el-scrollbar max-height="580px">
                <el-menu style="height: 100%;">
                    <el-sub-menu v-for="product in projectDisplay" :index="product.id">
                        <template #title>
                            <span>{{ product.name }}</span>
                        </template>
                        <el-sub-menu v-for="trail in product.trails" :index="trail.id">
                            <template #title>
                                <span>{{ trail.name }}</span>
                            </template>
                            <el-menu-item v-for="purpose in trail.purpose" :index="purpose.id">{{ purpose.name
                                }}</el-menu-item>
                        </el-sub-menu>
                    </el-sub-menu>
                </el-menu>
            </el-scrollbar>
        </el-main>

    </el-container>
</template>