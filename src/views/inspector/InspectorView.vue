<script lang="ts" setup>
import { Ref, ref } from 'vue';
import ProjectSelector from '../../components/inspector/ProjectSelector.vue';
import ProjectStatus from '../../components/inspector/ProjectStatus.vue';
import { Project } from '../../api/inspector/inspector';

const asideWidth = ref("15%");
const project: Ref<Project> = ref({ product: "ak101", trial: "101", purpose: "csr" });

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
            <ProjectStatus :project="project" />
        </el-main>
    </el-container>
</template>

<style scoped>
.main {
    padding: 0;
}
</style>