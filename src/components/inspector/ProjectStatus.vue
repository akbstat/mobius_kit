<script lang="ts" setup>
import { computed, onMounted, ref, Ref, watch } from 'vue';
import { ArrowRight } from '@element-plus/icons-vue';
import { Search } from '@element-plus/icons-vue';
import { groupColor, statusColor, statusContent, qcStatusTagStyle } from "./display";
import { configIllation, Group, Item, projectKind, ProjectKind, projectStatus } from '../../api/inspector/inspector';
import Sequence from './Sequence.vue';
import Graph from './Graph.vue';
import Log from './Log.vue';
import Config from './Config.vue';
import QcResult from './QcResult.vue';
import { ElMessage } from 'element-plus';
import { debounce } from 'lodash';
import { useInspector } from '../../store/inspectorV2';
import { storeToRefs } from 'pinia';

const store = useInspector();
const { project, selectedKind, configFile, qcIgnore } = storeToRefs(store);
const projectKinds: Ref<ProjectKind[]> = ref([]);
// const selectedKind: Ref<ProjectKind> = ref(ProjectKind.SDTM);
const selectedGroup: Ref<Group> = ref(Group.Production);
const selectedItem = ref("");
// if true, when display qc result detail will display supplymental domain
const selectedQcSupp = ref(false);
const projectItems: Ref<Item[]> = ref([]);
const itemSearch = ref("");
const loading = ref(false);
// const activeItem: Ref<Item | null> = ref(null);

// dialog or drawer display control
const sequenceDisplay = ref(false);
const logDisplay = ref(false);
const graphDisplay = ref(false);
const configDisplay = ref(false);
const qcDisplay = ref(false);

const projectItemDisplay = computed(() => {
    return projectItems.value.filter((item) => item.name.toLowerCase().includes(itemSearch.value.toLowerCase()));
});

function showSequence() {
    sequenceDisplay.value = true;
}

function showLog() {
    logDisplay.value = true;
}

function showQc(supp: boolean) {
    selectedQcSupp.value = supp;
    qcDisplay.value = true;
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

function updateConfig(config: string, ignore: string[]) {
    qcIgnore.value = ignore;
    configFile.value = config;
    closeConfig();
    updateProjectStatus()
}

async function updateProjectKind() {
    const { product, trial, purpose } = project.value;
    configFile.value = await configIllation({ product, trial, purpose, kind: selectedKind.value });
    await updateProjectStatus();
}

async function updateProjectStatus() {
    const { product, trial, purpose } = project.value;
    if (configFile.value.length === 0) {
        configFile.value = await configIllation({ product, trial, purpose, kind: selectedKind.value });
    }
    if (!(product && trial && purpose && configFile.value && configFile.value)) {
        return;
    }
    loading.value = true;
    try {
        projectItems.value = await projectStatus({
            product, trial, purpose, kind: selectedKind.value, config: configFile.value, qcIgnore: qcIgnore.value
        });
    } catch (e) {
        ElMessage.error(`Failed to update project status: ${e}`);
    }
    loading.value = false;
}

onMounted(async () => {
    projectKinds.value = await projectKind();
    await updateProjectStatus();
});

watch(() => project.value, debounce(() => {
    configFile.value = "";
    updateProjectStatus()
}, 500));

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
                <el-select @change="updateProjectKind" v-model="selectedKind" size="small" class="kind">
                    <el-option v-for="kind in projectKinds" :value="kind" :label="kind" />
                </el-select>
                <div class="config">
                    <el-input size="small" class="item-search" :prefix-icon="Search" v-model="itemSearch" clearable />
                    <el-button @click="updateProjectStatus" size="small" class="config-button" plain type="primary">
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
            <el-table v-loading="loading" :data="projectItemDisplay" height="625px">
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
                            <el-tag @click="() => {
                                selectedGroup = Group.Production;
                                selectedItem = scope.row.name;
                                showLog();
                            }" class="status-tag" style="margin-bottom: 10px;"
                                :type="statusColor(scope.row.group[0].log)">
                                {{ statusContent(scope.row.group[0].log, true) }}
                            </el-tag>
                        </div>
                        <div v-if="scope.row.group.length === 2">
                            <el-tag @click="() => {
                                selectedGroup = Group.Validation;
                                selectedItem = scope.row.name;
                                showLog();
                            }" class="status-tag" :type="statusColor(scope.row.group[1].log)">
                                {{ statusContent(scope.row.group[1].log, true) }}
                            </el-tag>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="Qc Result">
                    <template #default="scope">
                        <el-tag @click="() => { selectedItem = scope.row.name; showQc(false); }"
                            :class="qcStatusTagStyle(scope.row.qcResult)" style="margin-bottom: 10px;"
                            :type="statusColor(scope.row.qcResult[0])">
                            {{ statusContent(scope.row.qcResult[0], scope.row.qcResult.length === 1) }}
                        </el-tag>
                        <el-tag v-if="scope.row.qcResult.length > 1"
                            @click="() => { selectedItem = scope.row.name; showQc(true); }" class="qc-status-tag"
                            style="margin-bottom: 10px; margin-left: 5px;" :type="statusColor(scope.row.qcResult)">
                            {{ statusContent(scope.row.qcResult[1], false) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="Sequence">
                    <template #default="scope">
                        <div>
                            <el-tag @click="() => {
                                selectedGroup = Group.Production;
                                selectedItem = scope.row.name;
                                selectedQcSupp = scope.row.qcResult.length > 1;
                                showSequence();
                            }" class="status-tag" style="margin-bottom: 10px;"
                                :type="statusColor(scope.row.group[0].sequence)">
                                {{ statusContent(scope.row.group[0].sequence, true) }}
                            </el-tag>
                        </div>
                        <div v-if="scope.row.group.length === 2">
                            <el-tag @click="() => {
                                selectedGroup = Group.Validation;
                                selectedItem = scope.row.name;
                                selectedQcSupp = scope.row.qcResult.length > 1;
                                showSequence();
                            }" class="status-tag" :type="statusColor(scope.row.group[1].sequence)">
                                {{ statusContent(scope.row.group[1].sequence, true) }}
                            </el-tag>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </el-main>
    </el-container>
    <el-drawer v-model="sequenceDisplay" :with-header="false" size="60%" destroy-on-close>
        <Sequence :param="{
            product: project.product,
            trial: project.trial,
            purpose: project.purpose,
            kind: selectedKind,
            item: selectedItem,
            supp: selectedQcSupp,
        }" :group="selectedGroup" />
    </el-drawer>
    <el-drawer v-model="logDisplay" :with-header="false" size="73%" destroy-on-close>
        <Log :param="{
            product: project.product,
            trial: project.trial,
            purpose: project.purpose,
            kind: selectedKind,
            item: selectedItem,
            group: selectedGroup,
        }" />
    </el-drawer>
    <el-dialog v-model="graphDisplay" destroy-on-close draggable width="80%">
        <Graph :param="{
            product: project.product,
            trial: project.trial,
            purpose: project.purpose,
            kind: selectedKind,
            config: configFile,
            qcIgnore: qcIgnore,
        }" />
    </el-dialog>
    <el-drawer title="Configuration" v-model="configDisplay" size="50%" destroy-on-close>
        <Config :project="project" :kind="selectedKind" :config-file="configFile" :qc-ignore="qcIgnore"
            @update="updateConfig" @close="closeConfig" />
    </el-drawer>
    <el-dialog :title="`Qc Result of ${selectedQcSupp ? 'SUPP' : ''}${selectedItem}`" v-model="qcDisplay"
        destroy-on-close draggable>
        <QcResult :param="{
            product: project.product,
            trial: project.trial,
            purpose: project.purpose,
            kind: selectedKind,
            item: selectedItem,
            ignore: qcIgnore,
        }" :supp="selectedQcSupp" />
    </el-dialog>
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

.qc-status-tag {
    width: 87px;
}
</style>