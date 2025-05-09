<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { createHistory, listAllProjects, listHistoryProjects, Product, Project, Purpose, Trial } from '../../api/inspector/inspector';
import { useDark } from '@vueuse/core';

const emit = defineEmits<{ (e: "toggle", width: string): void; (e: "switch", project: Project): void }>();
const menuCollapsed = ref(false);
const searchProject = ref("");
const menuMode = computed(() => isHistoryMode.value ? "History" : "All Studies");
const allProjects = ref<Product[]>([]);
const historyProjects = ref<string[]>([]);
const isHistoryMode = ref(false);
const allProjectDisplay = computed(() => {
    const projects: Product[] = [];
    allProjects.value.forEach(project => {
        const trials: Trial[] = [];
        project.trials.forEach(trial => {
            const purposes: Purpose[] = trial.purposes.filter(purpose => purpose.id.toUpperCase().includes(searchProject.value.toUpperCase()));
            if (purposes.length > 0) {
                trials.push({ id: trial.id, name: trial.name, purposes });
            }
        });
        if (trials.length > 0) {
            projects.push({ id: project.id, name: project.name, trials });
        }
    });
    return projects;
});

const historyProjectsDisplay = computed(() => {
    return historyProjects.value.filter((project) => {
        return project.toLowerCase().includes(searchProject.value.toLowerCase());
    });
});


function toggleMenu() {
    menuCollapsed.value = !menuCollapsed.value;
    if (menuCollapsed.value) {
        emit("toggle", "2%");
    } else {
        emit("toggle", "15%");
    }
}

function scrollbarStyle() {
    const isDark = useDark();
    if (!isDark.value) {
        return {
            backgroundColor: "#ffffff",
        };
    }
    return {};
}


function onSelect(project: String) {
    const slice = project.split("-");
    const product = slice[0];
    const trial = slice[1];
    const purpose = slice[2];
    createHistory({ product, trial, purpose }).then(() => {
        listHistoryProjects().then((projects) => {
            historyProjects.value = projects;
        });
    });
    emit("switch", {
        product: slice[0],
        trial: slice[1],
        purpose: slice[2],
    });
}

async function switchMenuMode() {
    isHistoryMode.value = !isHistoryMode.value;
    if (isHistoryMode.value) {
        historyProjects.value = await listHistoryProjects();
    } else {
        allProjects.value = await listAllProjects();
    }
    searchProject.value = "";
}

onMounted(async () => {
    allProjects.value = await listAllProjects();
    historyProjects.value = await listHistoryProjects();
})
</script>

<template>
    <div v-if="menuCollapsed">
        <el-button link size="small" type="primary" plain @click="toggleMenu" class="extend-button">
            <el-icon size="small">
                <DArrowRight />
            </el-icon>
        </el-button>
    </div>
    <div v-else>
        <el-input v-model="searchProject" :suffix-icon="Search" />
        <el-tag class="function-tag" type="primary">
            <el-button type="primary" plain link @click="toggleMenu" class="collaspe-button">
                <el-icon size="small">
                    <DArrowLeft />
                </el-icon>
            </el-button>
            <el-button @click="switchMenuMode" type="primary" link plain class="menu-switch">{{ menuMode
                }}</el-button>
        </el-tag>
        <el-scrollbar :style="scrollbarStyle()" class="scroll" height="589px" max-height="589px">
            <el-menu @select="onSelect" v-if="isHistoryMode">
                <el-menu-item v-for="project in historyProjectsDisplay" :index="project">
                    <template #title>
                        <span>{{ project }}</span>
                    </template>
                </el-menu-item>
            </el-menu>
            <el-menu @select="onSelect" v-else class="menu">
                <el-sub-menu v-for="project in allProjectDisplay" :index="project.id">
                    <template #title>
                        <span>{{ project.name }}</span>
                    </template>
                    <el-sub-menu v-for="trial in project.trials" :index="trial.id">
                        <template #title>
                            <span>{{ trial.name }}</span>
                        </template>
                        <el-menu-item v-for="purpose in trial.purposes" :index="purpose.id">
                            <span>{{ purpose.name }}</span>
                        </el-menu-item>
                    </el-sub-menu>
                </el-sub-menu>
            </el-menu>
        </el-scrollbar>
    </div>
</template>

<style scoped>
.function-tag {
    width: 100%;
    height: 39px;
}

.menu {
    height: 598px;
}

.collaspe-button {
    width: 10%;
    margin: 0 5px 0 0;
}

.menu-switch {
    width: 100px;
    margin-top: 3px;
}

.extend-button {
    width: 100%;
    height: 660px;
}

.scroll {
    background-color: #213d5b;
}
</style>