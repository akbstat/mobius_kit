<script lang="ts" setup>
import { ref } from 'vue';
import ProjectSelector from '../../components/inspector/ProjectSelector.vue';
import ProjectStatus from '../../components/inspector/ProjectStatus.vue';
import { Project } from '../../api/inspector/inspector';
// import { useInspector } from '../../store/inspectorV2';
import { useProjectContext } from '../../store/context';
import { storeToRefs } from 'pinia';

const asideWidth = ref("15%");
// const store = useInspector();
const contextStore = useProjectContext();
const { project } = storeToRefs(contextStore);
// const project: Ref<Project> = ref({ product: "", trial: "", purpose: "" });

function toggleMenu(width: string) {
    asideWidth.value = width;
}

function switchProject(p: Project) {
    project.value = p;
}



</script>

<template>
    <el-container>
        <el-aside :width="asideWidth">
            <ProjectSelector @toggle="toggleMenu" @switch="switchProject" />
        </el-aside>
        <el-main class="main">
            <ProjectStatus />
        </el-main>
    </el-container>
</template>

<style scoped>
.main {
    padding: 0;
}
</style>