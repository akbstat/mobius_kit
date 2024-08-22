<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { Output } from "./transient";
import { listRtfs, extractTranslate, fetchProgress, fetchLog, fetchTranslation, stuff, clearProgress, openDirectory, Translation } from "../../api/transient/transient";
import { ElMessage, ElNotification, ElScrollbar } from "element-plus";
import { Search } from "@element-plus/icons-vue";
import { open } from "@tauri-apps/api/dialog";
import { debounce } from 'lodash';

// phase 0: stands for extracting and translation
// phase 1: stands for stuffering translation into rtf
const phase = ref(0);
const dir = ref("");
const workspace = ref("");
const resultDir = ref("");
const filenameFilter = ref("");
const translationFilter = ref("");
const configDialogShow = ref(false);
const translateDialogShow = ref(false);
const translationReviewDialogShow = ref(false);
const translationReviewDrawerShow = ref(false);
const translationReviewDialogLoading = ref(false);
const currentTranslationPair = ref<Translation>({
    id: 0,
    source: "",
    translation: ""
});
const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>();
const outputs = ref<Output[]>([]);
const outputDisplay = computed(() => {
    const filter_value = filenameFilter.value;
    if (filter_value.length > 0) {
        return outputs.value.filter((item: Output) => item.filename.includes(filter_value));
    }
    return outputs.value;
});
const selectedOutput = ref<Output[]>([]);
const logs = ref<string[]>([]);
const progress = ref(0);


const translationData = ref<Translation[]>([]);
const translationDataDisplay = computed(() => {
    const filter = translationFilter.value;
    if (filter.length > 0) {
        return translationData.value.filter((item: Translation) => item.source.includes(filter));
    }
    return translationData.value;
});

function showConfigDialog() {
    configDialogShow.value = true;
}

function showTranslationReviewDrawer(row: Translation) {
    const { id, source, translation } = row;
    currentTranslationPair.value = { id, source, translation };
    translationReviewDrawerShow.value = true;
}

function updateTranslation() {
    const pair = currentTranslationPair.value;
    if (pair.id < translationData.value.length) {
        translationData.value[pair.id] = pair;
    }
    translationReviewDrawerShow.value = false;
}

function translationDialogTitle(): string {
    if (!phase.value) {
        return "Phase 1: Extracting and translating";
    }
    return "Phase 2: Generating outputs";
}

async function extractTranslateStep() {
    phase.value = 0;
    progress.value = 0;
    logs.value = [];
    configDialogShow.value = false;
    translateDialogShow.value = true;
    extractTranslate({
        workspace: workspace.value,
        destination_dir: resultDir.value,
        outputs: selectedOutput.value.map(output => {
            return `${dir.value}\\${output.filename}`
        })
    });
    const sleep = (ms: number) => {
        return new Promise(resolve => {
            setTimeout(resolve, ms)
        });
    }
    let scroll = 0;
    while (progress.value < 100) {
        progress.value = await fetchProgress();
        const newLogs = await fetchLog();
        newLogs.forEach(log => logs.value.push(log));
        scroll += (newLogs.length * 20);
        scrollbarRef.value!.setScrollTop(scroll);
        await sleep(100);
    }
    translationReviewDialogShow.value = true;
    translationReviewDialogLoading.value = true;
    translationData.value = (await fetchTranslation()).data;
    translationReviewDialogLoading.value = false;
}

async function stuffStep() {
    await clearProgress();
    phase.value = 1;
    progress.value = 0;
    translationReviewDialogShow.value = false;
    translateDialogShow.value = true;
    stuff(translationData.value);
    const sleep = (ms: number) => {
        return new Promise(resolve => {
            setTimeout(resolve, ms)
        });
    }
    let scroll = logs.value.length * 20;
    while (progress.value < 100) {
        progress.value = await fetchProgress();
        const newLogs = await fetchLog();
        newLogs.forEach(log => logs.value.push(log));
        scroll += (newLogs.length * 20);
        scrollbarRef.value!.setScrollTop(scroll);
        await sleep(100);
    }
    scrollbarRef.value!.setScrollTop(logs.value.length * 20);
    ElNotification({
        title: "Success",
        message: "Misson complete, Click here to open result folder",
        type: "success",
        duration: 10000,
        onClick: () => {
            try {
                openDirectory(resultDir.value)
            } catch (err) {
                ElMessage({
                    message: `${err}`,
                    type: 'error',
                })
                return;
            }
        }
    })
}

function handleSelectionChange(val: Output[]) {
    selectedOutput.value = val;
}

async function selectDirectory() {
    const directory = await open({ directory: true });
    if (directory && directory.length > 0) {
        dir.value = directory as string;
        resultDir.value = `${directory}\\translation`;
        workspace.value = `${directory}\\workspace`;
    }
}

async function selectTranslationDirectory() {
    const directory = await open({ directory: true });
    if (directory && directory.length > 0) {
        resultDir.value = directory as string;
        const split = resultDir.value.split("\\");
        workspace.value = `${split.slice(0, split.length - 1).join("\\")}\\workspace`;
    }
}

async function listOutputs() {
    outputs.value = await listRtfs(dir.value);
}

watch(dir, debounce(listOutputs, 100));

</script>

<template>
    <el-container>
        <el-header style="padding: 10px 0 0 5px;">
            <el-button type="primary" plain @click="selectDirectory">Select</el-button>
            <el-input placeholder="Select or paste the path of folder" v-model="dir"
                style="margin: 0 10px 0 10px; width: 85%;" clearable />
            <el-button type="primary" plain @click="showConfigDialog">
                <el-icon>
                    <CaretRight />
                </el-icon>
            </el-button>
        </el-header>
        <el-main style="padding: 10px 5px 0 5px;">
            <el-table @selection-change="handleSelectionChange" :data="outputDisplay" height="580px">
                <el-table-column type="selection"></el-table-column>
                <el-table-column prop="filename" label="Filename" width="800px" />
                <el-table-column>
                    <template #header>
                        <el-input v-model="filenameFilter" :suffix-icon="Search"></el-input>
                    </template>
                </el-table-column>
            </el-table>
        </el-main>
        <el-dialog draggable width="800px" title="Configuration" v-model="configDialogShow">
            <el-button type="primary" @click="selectTranslationDirectory" plain>Select</el-button>
            <el-input placeholder="Select or paste the path of folder" v-model="resultDir"
                style="margin: 0 10px 0 10px; width: 78.7%;" clearable />
            <el-button type="primary" plain @click="extractTranslateStep">Run</el-button>
            <el-table :data="selectedOutput" max-height="400px">
                <el-table-column prop="filename" label="Filename" width="800px" />
            </el-table>
        </el-dialog>
        <el-dialog draggable width="1200px" v-model="translateDialogShow" :title="translationDialogTitle()">
            <el-progress :text-inside="true" :stroke-width="26" :percentage="progress" striped striped-flow
                :duration="15" />
            <el-scrollbar ref="scrollbarRef" height="400px" style="margin-top: 10px">
                <div style=" background-color: #191919;  padding: 5px">
                    <p v-for="log in logs">
                        {{ log }}
                    </p>
                </div>
            </el-scrollbar>
        </el-dialog>
        <el-dialog draggable width="1200px" style="height: 560px; padding-top: 0" v-model="translationReviewDialogShow"
            title="Review Translation Result">
            <el-input placeholder="Search source" v-model="translationFilter" style="width:500px; margin-right: 5px;"
                prefix-icon="Search" clearable />
            <el-button type="primary" plain @click="stuffStep">Next</el-button>
            <el-table v-loading="translationReviewDialogLoading" :data="translationDataDisplay" max-height="420px"
                height="420px">
                <el-table-column label="Source">
                    <template #default="scope">
                        <el-tooltip class="box-item" effect="dark" :content="scope.row.source" placement="right-start">
                            <el-text truncated>{{ scope.row.source }}</el-text>
                        </el-tooltip>
                    </template>
                </el-table-column>
                <el-table-column label="Translation" prop="translation">
                    <template #default="scope">
                        <el-tooltip class="box-item" effect="dark" :content="scope.row.translation"
                            placement="left-start">
                            <el-text truncated @click="() => { showTranslationReviewDrawer(scope.row) }">
                                {{ scope.row.translation }}
                            </el-text>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
        </el-dialog>
        <el-drawer title="Modify Translation" size="50%" v-model="translationReviewDrawerShow">
            <el-button type="primary" @click="updateTranslation" plain>Update</el-button>
            <el-button plain @click="() => { translationReviewDrawerShow = false }">Cancel</el-button>
            <div>
                <el-input v-model="currentTranslationPair.source" style="width: 600px; margin-top: 10px"
                    :autosize="{ minRows: 10, maxRows: 10 }" type="textarea" disabled />
            </div>
            <div style="margin-top: 10px">
                <el-input v-model="currentTranslationPair.translation" style="width: 600px; height: 200px"
                    :autosize="{ minRows: 10, maxRows: 10 }" type="textarea" />
            </div>
        </el-drawer>
    </el-container>
</template>