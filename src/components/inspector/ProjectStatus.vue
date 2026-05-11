<script lang="ts" setup>
import { computed, onMounted, ref, Ref, watch } from 'vue';
import { Filter, Search } from '@element-plus/icons-vue';
import { groupColor, statusColor, statusContent, qcStatusTagStyle } from "./display";
import { configIllation, FilterOption, Group, GroupOption, Item, ItemGroup, projectKind, ProjectKind, projectStatus, StatusKind } from '../../api/inspector/inspector';
import Sequence from './Sequence.vue';
import Graph from './Graph.vue';
import Log from './Log.vue';
import Config from './Config.vue';
import QcResult from './QcResult.vue';
import { ElMessage } from 'element-plus';
import { debounce } from 'lodash';
import { useInspector } from '../../store/inspectorV2';
import { storeToRefs } from 'pinia';
import { useProjectContext } from '../../store/context';
import FilterConfig from './FilterConfig.vue';
import { getTrackerInformation, trackerIllation, TrackerItem } from '../../api/inspector/tracker';

const store = useInspector();
const contextStore = useProjectContext();
const { selectedKind, configFile, trackerFile, tflTrackerFile, qcIgnore, filterConfigMap, externalLogPatterns } = storeToRefs(store);
const { project } = storeToRefs(contextStore);
const projectKinds: Ref<ProjectKind[]> = ref([]);
const selectedGroup: Ref<Group> = ref(Group.Production);
const selectedItem = ref("");
// if true, when display qc result detail will display supplymental domain
const selectedQcSupp = ref(false);
const projectItems: Ref<Item[]> = ref([]);
const trackerItems = ref(new Map<string, string>());
const sourcers = ref<string[]>([]);
const itemSearch = ref("");
const loading = ref(false);
const defaultFilterOption = {
    sourcers: [],
    groupOption: GroupOption.Both,
    onlyFailedLog: false,
    onlyFailedQc: false,
    onlyFailedSequence: false,
    itemDisplay: true,
    groupisplay: true,
    logDisplay: true,
    qcResultDisplay: true,
    sequenceDisplay: true,
};
const filterConfig = ref<FilterOption>(defaultFilterOption);

// dialog or drawer display control
const sequenceDisplay = ref(false);
const logDisplay = ref(false);
const graphDisplay = ref(false);
const configDisplay = ref(false);
const qcDisplay = ref(false);
const filterDisplay = ref(false);

const projectItemDisplay = computed(() => {
    const { groupOption, onlyFailedLog, onlyFailedQc, onlyFailedSequence, sourcers } = filterConfig.value;
    const copyItem: Item[] = JSON.parse(JSON.stringify(projectItems.value));
    const display: Item[] = [];
    // applying filter config
    copyItem.forEach(item => {
        let includeItem = true;
        let includeSourcer = false;
        let hasLogFailed = false;
        let hasSequenceFailed = false;
        const hasQcFailed = item.qcResult.filter(qc => [StatusKind.Failed, StatusKind.Missing].includes(qc.kind)).length > 0;
        const groups: ItemGroup[] = item.group.filter(g => groupOption === GroupOption.Both || groupOption === GroupOption.Production && g.group === Group.Production || groupOption === GroupOption.Validation && g.group === Group.Validation);
        groups.forEach(g => {
            hasLogFailed = hasLogFailed || g.log.kind !== StatusKind.Pass;
            hasSequenceFailed = hasSequenceFailed || g.sequence.kind !== StatusKind.Pass;
            if (sourcers.length > 0) {
                const sourcer = findSourcer({ name: item.name, group: g.group });
                if (sourcer) {
                    includeSourcer = includeSourcer || sourcers.includes(sourcer);
                } else {
                    includeItem = includeSourcer || false;
                }
            } else {
                includeSourcer = true;
            }
        });
        includeItem = (!onlyFailedLog && !onlyFailedSequence && !onlyFailedQc) ?
            true :
            includeItem && ((onlyFailedLog && hasLogFailed) || (onlyFailedSequence && hasSequenceFailed) || (onlyFailedQc && hasQcFailed));
        if (includeItem && includeSourcer && groups.length > 0) {
            item.group = groups;
            display.push(item);
        }
    });
    return display.filter((item) => item.name.toLowerCase().includes(itemSearch.value.toLowerCase()));
});

function findSourcer({ name, group }: { name: string, group: Group }): string | undefined {
    const key = `${name}-${group === Group.Production ? "dev" : "qc"}`;
    const sourcer = trackerItems.value.get(key);
    return sourcer;
}

function sourceDisplay({ name, group }: { name: string, group: Group }): string {
    const sourcer = findSourcer({ name, group });
    return sourcer ? `: ${sourcer}` : ": NA";
}

function getSources(items: TrackerItem[]): string[] {
    const memberSet = new Set<string>();
    items.forEach(item => {
        memberSet.add(item.dever);
        memberSet.add(item.qcer);
    });
    return Array.from(memberSet);
}

function buildTrackerItemMap(items: TrackerItem[]): Map<string, string> {
    const mapper = new Map();
    items.forEach(i => {
        const { dever, qcer, item } = i;
        mapper.set(`${item}-dev`, dever);
        mapper.set(`${item}-qc`, qcer);
    });
    return mapper;
}

function showFilter() {
    filterDisplay.value = true;
}

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

function closeFilterConfig(option: FilterOption | undefined) {
    if (option) {
        filterConfig.value = option;
        if (project.value) {
            const { product, trial, purpose } = project.value;
            const key = `${product}-${trial}-${purpose}-${selectedKind.value}`;
            filterConfigMap.value.set(key, filterConfig.value);
        }
        filterConfig.value = option;
    }
    filterDisplay.value = false;
}

async function updateFilterOptions() {
    if (project.value) {
        const { product, trial, purpose } = project.value;
        const updatedTracker = await trackerIllation({ product, trial, purpose, kind: selectedKind.value });
        if (selectedKind.value === ProjectKind.TFLs) {
            tflTrackerFile.value = updatedTracker;
        } else {
            trackerFile.value = updatedTracker;
        }
        const key = `${product}-${trial}-${purpose}-${selectedKind.value}`;
        const config = filterConfigMap.value.get(key);
        if (config) {
            filterConfig.value = config;
        } else {
            filterConfig.value = defaultFilterOption;
            filterConfigMap.value.set(key, filterConfig.value);
        }
    }
}

function updateConfig(config: string, tracker: string, ignore: string[], logExternal: { whiteList: string[], issue: string[] }) {
    qcIgnore.value = ignore;
    configFile.value = config;
    if (selectedKind.value === ProjectKind.TFLs) {
        tflTrackerFile.value = tracker;
    } else {
        trackerFile.value = tracker;
    }
    externalLogPatterns.value = logExternal;
    closeConfig();
    updateProjectStatus()
}

async function updateProjectKind() {
    if (!project.value) {
        return;
    }
    const { product, trial, purpose } = project.value;
    configFile.value = await configIllation({ product, trial, purpose, kind: selectedKind.value });
    await updateProjectStatus();
    updateFilterOptions();
}

async function updateProjectStatus() {
    if (!project.value) {
        return;
    }
    const { product, trial, purpose } = project.value;
    if (configFile.value.length === 0) {
        configFile.value = await configIllation({ product, trial, purpose, kind: selectedKind.value });
    }

    if (selectedKind.value === ProjectKind.TFLs) {
        if (tflTrackerFile.value.length === 0) {
            tflTrackerFile.value = await trackerIllation({ product, trial, purpose, kind: selectedKind.value });
        }
    } else {
        if (trackerFile.value.length === 0) {
            trackerFile.value = await trackerIllation({ product, trial, purpose, kind: selectedKind.value });
        }
    }


    if (!(product && trial && purpose && configFile.value && configFile.value)) {
        return;
    }
    loading.value = true;
    try {
        projectItems.value = await projectStatus({
            product, trial, purpose, kind: selectedKind.value, config: configFile.value, qcIgnore: qcIgnore.value, externalLogPatterns: externalLogPatterns.value
        });
        const trackerItemList = await getTrackerInformation({ filepath: selectedKind.value === ProjectKind.TFLs ? tflTrackerFile.value : trackerFile.value, kind: selectedKind.value });
        sourcers.value = getSources(trackerItemList);
        trackerItems.value = buildTrackerItemMap(trackerItemList);
    } catch (e) {
        ElMessage.error(`Failed to update project status: ${e}`);
    }
    loading.value = false;
}

onMounted(async () => {
    updateFilterOptions();
    projectKinds.value = await projectKind();
    await updateProjectStatus();
});

watch(() => project.value, debounce(() => {
    configFile.value = "";
    updateProjectStatus();
    updateFilterOptions();
}, 500));

</script>

<template>
    <el-container>
        <el-header class="header">
            <div v-if="project">
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
                    <el-button @click="showFilter" size="small" class="config-button" plain type="primary">
                        <el-icon>
                            <Filter />
                        </el-icon>
                    </el-button>
                </div>
            </div>
        </el-header>

        <el-main class="main">
            <el-table v-loading="loading" :data="projectItemDisplay" height="625px">
                <el-table-column v-if="filterConfig.itemDisplay" show-overflow-tooltip prop="name" label="Item" />
                <el-table-column v-if="filterConfig.groupisplay" label="Group" width="220">
                    <template #default="scope">
                        <div>
                            <el-tag class="group-tag" style="margin-bottom: 10px; width: 100%;"
                                :type="groupColor(scope.row.group[0])">
                                <span>{{ scope.row.group[0].group }}</span>
                                <span>
                                    {{ sourceDisplay({
                                        name: scope.row.name, group:
                                            scope.row.group[0].group
                                    }) }}
                                </span>
                            </el-tag>
                        </div>
                        <div v-if="scope.row.group.length === 2">
                            <el-tag class="group-tag" :type="groupColor(scope.row.group[1])" style="width: 100%" ;>
                                <span>{{ scope.row.group[1].group }}</span>
                                <span>
                                    {{ sourceDisplay({
                                        name: scope.row.name, group:
                                            scope.row.group[1].group
                                    }) }}
                                </span>
                            </el-tag>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column v-if="filterConfig.logDisplay" label="Log">
                    <template #default="scope">
                        <div>
                            <el-tag @click="() => {
                                selectedGroup = scope.row.group[0].group;
                                selectedItem = scope.row.name;
                                showLog();
                            }" class="status-tag" style="margin-bottom: 10px;"
                                :type="statusColor(scope.row.group[0].log)">
                                {{ statusContent(scope.row.group[0].log, true) }}
                            </el-tag>
                        </div>
                        <div v-if="scope.row.group.length === 2">
                            <el-tag @click="() => {
                                selectedGroup = scope.row.group[1].group;
                                selectedItem = scope.row.name;
                                showLog();
                            }" class="status-tag" :type="statusColor(scope.row.group[1].log)">
                                {{ statusContent(scope.row.group[1].log, true) }}
                            </el-tag>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column v-if="filterConfig.qcResultDisplay" label="Qc Result">
                    <template #default="scope">
                        <el-tag @click="() => { selectedItem = scope.row.name; showQc(false); }"
                            :class="qcStatusTagStyle(scope.row.qcResult)" style="margin-bottom: 10px;"
                            :type="statusColor(scope.row.qcResult[0])">
                            {{ statusContent(scope.row.qcResult[0], scope.row.qcResult.length === 1) }}
                        </el-tag>
                        <el-tag v-if="scope.row.qcResult.length > 1"
                            @click="() => { selectedItem = scope.row.name; showQc(true); }" class="qc-status-tag"
                            style="margin-bottom: 10px; margin-left: 5px;" :type="statusColor(scope.row.qcResult[1])">
                            {{ statusContent(scope.row.qcResult[1], false) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column v-if="filterConfig.sequenceDisplay" label="Sequence">
                    <template #default="scope">
                        <div>
                            <el-tag @click="() => {
                                selectedGroup = scope.row.group[0].group;
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
                                selectedGroup = scope.row.group[1].group;
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
    <el-drawer v-if="project" v-model="sequenceDisplay" :with-header="false" size="60%" destroy-on-close>
        <Sequence :param="{
            product: project.product,
            trial: project.trial,
            purpose: project.purpose,
            kind: selectedKind,
            item: selectedItem,
            supp: selectedQcSupp,
        }" :group="selectedGroup" />
    </el-drawer>
    <el-drawer v-if="project" v-model="logDisplay" :with-header="false" size="73%" destroy-on-close>
        <Log :param="{
            product: project.product,
            trial: project.trial,
            purpose: project.purpose,
            kind: selectedKind,
            item: selectedItem,
            group: selectedGroup,
            externalLogPatterns: externalLogPatterns,
        }" />
    </el-drawer>
    <el-dialog v-if="project" v-model="graphDisplay" destroy-on-close draggable width="80%">
        <Graph :param="{
            product: project.product,
            trial: project.trial,
            purpose: project.purpose,
            kind: selectedKind,
            config: configFile,
            qcIgnore: qcIgnore,
            externalLogPatterns: externalLogPatterns
        }" />
    </el-dialog>
    <el-drawer v-if="project" title="Configuration" v-model="configDisplay" size="50%" destroy-on-close>
        <Config :project="project" :kind="selectedKind" :config-file="configFile" :qc-ignore="qcIgnore" ,
            :tracker="selectedKind === ProjectKind.TFLs ? tflTrackerFile : trackerFile"
            :external-log-patterns="externalLogPatterns" @update="updateConfig" @close="closeConfig" />
    </el-drawer>
    <el-dialog :title="`Qc Result of ${selectedQcSupp ? 'SUPP' : ''}${selectedItem}`" v-model="qcDisplay"
        destroy-on-close draggable>
        <QcResult v-if="project" :param="{
            product: project.product,
            trial: project.trial,
            purpose: project.purpose,
            kind: selectedKind,
            item: selectedItem,
            ignore: qcIgnore,
        }" :supp="selectedQcSupp" />
    </el-dialog>
    <el-drawer size="40%" v-model="filterDisplay" title="Filter Configuration" destroy-on-close>
        <FilterConfig @close="closeFilterConfig" :option="{ ...filterConfig }" :sourcers="sourcers" />
    </el-drawer>
</template>

<style scoped>
.breadcrumb-span {
    color: #409EFF;
}

.header {
    height: 30px;
    padding: 3px 3px 3px 3px;
    margin-bottom: 2px;
}

.main {
    padding: 0 2px 0 2px;
}

.kind {
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