<script setup lang="ts">
import { ref, watch } from "vue";
import { Product, Trial, Purpose, ChosenProject } from "./project";
import { ElMenu } from "element-plus";
import { debounce } from "lodash";

const searchText = ref("");
const props = defineProps<{ projects: Product[] }>();
let { projects } = props;
const emit = defineEmits<{
    (e: string, project: ChosenProject): void
}>();
const projectDisplay = ref<Product[]>(projects);

watch(() => props.projects, (data) => {
    projects = data;
    filterProject();
})

function filterProject() {
    if (searchText.value.trim().length === 0) {
        projectDisplay.value = projects;
        return;
    }
    projectDisplay.value = projects.map((project: Product) => trimProject(project, searchText.value)).filter((product: Product | undefined) => product) as Product[]
}

function trimProject(project: Product, keyword: string): Product | undefined {
    const trials = project.trials.map((trial: Trial) => {
        const purpose = trial.purpose.filter((purpose: Purpose) => purpose.id.toUpperCase().includes(keyword.toUpperCase()));
        return purpose.length === 0 ? undefined : { id: trial.id, name: trial.name, purpose };
    }).filter((trial: Trial | undefined) => trial) as Trial[];
    return trials.length === 0 ? undefined : { id: project.id, name: project.name, trials };
}

function onSelect(index: string) {
    let id: string[] = index.split("-");
    if (id.length > 2) {
        const chosenProject = {
            product: id[0],
            trial: id[1],
            purpose: id[2],
        };
        emit("project-change", chosenProject);
    }
}

watch(searchText, debounce(filterProject, 100));

</script>

<template>
    <el-container>
        <el-header style="padding: 0px 0px 5px 0px; height: auto">
            <el-input v-model="searchText" placeholder="Search Project" clearable></el-input>
        </el-header>
        <el-main style="padding: 0">
            <el-scrollbar max-height="565px" height="565px" style="background-color: #213d5b;">
                <el-menu @select="onSelect" style="height: 100%; border: none;">
                    <el-sub-menu v-for="product in projectDisplay" :index="product.id">
                        <template #title>
                            <span>{{ product.name }}</span>
                        </template>
                        <el-sub-menu v-for="trial in product.trials" :index="trial.id">
                            <template #title>
                                <span>{{ trial.name }}</span>
                            </template>
                            <el-menu-item v-for="purpose in trial.purpose" :index="purpose.id">
                                {{ purpose.name }}
                            </el-menu-item>
                        </el-sub-menu>
                    </el-sub-menu>
                </el-menu>
            </el-scrollbar>
        </el-main>
    </el-container>
</template>