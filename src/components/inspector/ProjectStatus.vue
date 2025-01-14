<script lang="ts" setup>
import { defineProps, onMounted, ref, Ref } from 'vue';
import { ArrowRight } from '@element-plus/icons-vue';
import { Search } from '@element-plus/icons-vue';
import { groupColor, statusColor, statusContent } from "./display";
import { Item, Project, projectKind, ProjectKind, projectStatus } from '../../api/inspector/inspector';
import Sequence from './Sequence.vue';
import Graph from './Graph.vue';
import Log from './Log.vue';
import Config from './Config.vue';

const { project } = defineProps<{
    project: Project
}>();
const projectKinds: Ref<ProjectKind[]> = ref([]);
const selectedKind: Ref<ProjectKind> = ref(ProjectKind.SDTM);
const projectItems: Ref<Item[]> = ref([]);
const itemSearch = ref("");
// const activeItem: Ref<Item | null> = ref(null);

// dialog or drawer display control
const sequenceDisplay = ref(false);
const logDisplay = ref(false);
const graphDisplay = ref(false);
const configDisplay = ref(false);

function showSequence() {
    // activeItem.value = item;
    sequenceDisplay.value = true;
}

function showLog() {
    logDisplay.value = true;
}

function showGraph() {
    graphDisplay.value = true;
}

function showConfig() {
    configDisplay.value = true;
}

function closeConfig() {
    configDisplay.value = false;
}

function updateConfig(config: string) {
    console.log(config);
    closeConfig()
}

onMounted(async () => {
    projectKinds.value = await projectKind();
    projectItems.value = await projectStatus();
});
</script>

<template>
    <el-container>
        <el-header class="header">
            <div v-if="project.purpose">
                <el-breadcrumb style="margin-top: 7px;float: left;" :separator-icon="ArrowRight">
                    <el-breadcrumb-item>
                        <span class="breadcrumb-span">{{ project.product }}</span>
                    </el-breadcrumb-item>
                    <el-breadcrumb-item>
                        <span class="breadcrumb-span">{{ project.trial }}</span>
                    </el-breadcrumb-item>
                    <el-breadcrumb-item>
                        <span class="breadcrumb-span">{{ project.purpose }}</span>
                    </el-breadcrumb-item>
                </el-breadcrumb>
                <el-select v-model="selectedKind" size="small" class="kind">
                    <el-option v-for="kind in projectKinds" :value="kind" :label="kind" />
                </el-select>
                <div class="config">
                    <el-input size="small" class="item-search" :prefix-icon="Search" v-model="itemSearch" />
                    <el-button size="small" class="config-button" plain type="primary">
                        <el-icon>
                            <Refresh />
                        </el-icon>
                    </el-button>
                    <el-button @click="showConfig" size="small" class="config-button" plain type="primary">
                        <el-icon>
                            <Setting />
                        </el-icon>
                    </el-button>
                    <el-button @click="showGraph" size="small" class="config-button" plain type="primary">
                        <el-icon>
                            <Histogram />
                        </el-icon>
                    </el-button>
                </div>
            </div>
        </el-header>

        <el-main class="main">
            <el-table :data="projectItems" height="625px">
                <el-table-column show-overflow-tooltip prop="name" label="Item" />
                <el-table-column label="Group" width="110">
                    <template #default="scope">
                        <div>
                            <el-tag class="group-tag" style="margin-bottom: 10px;"
                                :type="groupColor(scope.row.group[0])">
                                {{ scope.row.group[0].group }}
                            </el-tag>
                        </div>
                        <div v-if="scope.row.group.length === 2">
                            <el-tag class="group-tag" :type="groupColor(scope.row.group[1])">
                                {{ scope.row.group[1].group }}
                            </el-tag>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="Log">
                    <template #default="scope">
                        <div>
                            <el-tag @click="showLog" class="status-tag" style="margin-bottom: 10px;"
                                :type="statusColor(scope.row.group[0].log)">
                                {{ statusContent(scope.row.group[0].log) }}
                            </el-tag>
                        </div>
                        <div v-if="scope.row.group.length === 2">
                            <el-tag @click="showLog" class="status-tag" :type="statusColor(scope.row.group[1].log)">
                                {{ statusContent(scope.row.group[1].log) }}
                            </el-tag>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="Qc Result">
                    <template #default="scope">
                        <el-tag class="status-tag" style="margin-bottom: 10px;" :type="statusColor(scope.row.qcResult)">
                            {{ statusContent(scope.row.qcResult) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="Sequence">
                    <template #default="scope">
                        <el-tag @click="showSequence" class="status-tag" style="margin-bottom: 10px;"
                            :type="statusColor(scope.row.sequence)">
                            {{ statusContent(scope.row.sequence) }}
                        </el-tag>
                    </template>
                </el-table-column>
            </el-table>
        </el-main>
    </el-container>
    <el-drawer v-model="sequenceDisplay" :with-header="false" size="60%" destroy-on-close>
        <Sequence />
    </el-drawer>
    <el-drawer v-model="logDisplay" :with-header="false" size="40%" destroy-on-close>
        <Log />
    </el-drawer>
    <el-dialog v-model="graphDisplay" destroy-on-close draggable width="80%">
        <Graph />
    </el-dialog>
    <el-drawer title="Configuration" v-model="configDisplay" size="50%" destroy-on-close>
        <Config @update="updateConfig" @close="closeConfig" />
    </el-drawer>
</template>

<style scoped>
.breadcrumb-span {
    color: #409EFF;
}

.header {
    height: 30px;
    padding: 3px 3px 3px 10px;
    margin-bottom: 2px;
}

.main {
    padding: 0 2px 0 2px;
}

.kind {
    margin-left: 15px;
    width: 15%;
}

.item-search {
    width: 50%;
}

.config {
    float: right;
    justify-items: right;
    display: flex;
    justify-content: right;
}

.config-button {
    margin: 0 0 0 2px;
}

.group-tag {
    width: 85px;
}

.status-tag {
    width: 180px
}
</style>