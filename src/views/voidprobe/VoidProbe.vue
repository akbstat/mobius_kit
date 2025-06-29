<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { File, timestampDisplay } from './file';
import { Result } from './result';
import { open } from '@tauri-apps/api/dialog';
import OutputTag from "../../components/OutputTag.vue";
import { debounce } from 'lodash';
import { ElNotification } from 'element-plus';
import { probe, getProgress, getProbeResult, openPDF, probeRunning } from "../../api/void_probe/probe";
import { useVoidProbeStore } from "../../store/voidprobe";
import { storeToRefs } from 'pinia';
import { listRtfs, Rtf } from '../../api/utils/rtf';
import { useProjectContext } from '../../store/context';
import { outputPath } from '../../api/utils/project_path';

const store = useVoidProbeStore();
const { directory, result } = storeToRefs(store);
const contextStore = useProjectContext();
const { project: chosenProject } = storeToRefs(contextStore);
const files = ref<File[]>([]);
const selectedFiles = ref<File[]>([]);
const resultShow = ref(false);
// const result = ref<Result[]>([]);
const loading = ref(false);
const progress = ref(0);
const positiveResultOnly = ref(false);
const pageBreakDetailShow = ref(false);
const currentpageBreakDetail = ref<Result>({ name: "", type: "", path: "", void: [] });

function clear() {
    files.value = [];
    directory.value = "";
}

function closeResultDialog() {
    resultShow.value = false;
    progress.value = 0;
}

function referTypeByFileName(name: string): string {
    const prefix = name.length > 0 ? name[0] : "";
    switch (prefix) {
        case "t":
            return "Table"
        case "l":
            return "Listing"
        case "f":
            return "Figure"
    }
    return "";
}

function showResult(): Result[] {
    if (positiveResultOnly.value) {
        return result.value.filter(e => e.void.length > 0);
    }
    return result.value;
}

function positiveResultOnlySwtich() {
    positiveResultOnly.value = !positiveResultOnly.value;
}


function handleSelectionChange(val: File[]) {
    selectedFiles.value = val;
}

function bytesToMegaBytes(bytes: number): number {
    return Math.ceil(bytes / 1024 / 1024 * 100) / 100;
}

function resultRowClassName({
    row,
}: {
    row: Result
}): string {
    return row.void.length > 0 ? "error-row" : ""
}

function showResultDialog() {
    resultShow.value = true;
}

async function openResultFile(filepath: string, page: number) {
    await openPDF(filepath, page);
}

function openpageBreakDetail(detail: Result) {
    currentpageBreakDetail.value = detail;
    pageBreakDetailShow.value = true;
}

async function run() {
    if (selectedFiles.value.length === 0) {
        ElNotification({
            title: "Warning",
            message: `No output has been selected`,
            type: "warning",
        })
        return;
    }
    const isRunning = await probeRunning(directory.value);
    if (isRunning.running === true) {
        ElNotification({
            title: "Error",
            dangerouslyUseHTMLString: true,
            message: `<i style="color:#66b1ff">${directory.value}</i> <br /> is running by <i style="color:#f78989">${isRunning.locker}</i>, please wait and try again later`,
            type: "error",
        })
        return;
    }
    // try {
    //     await removeTempDir(directory.value);
    // } catch (error) {
    //     ElNotification({
    //         title: "Error",
    //         message: `${error}`,
    //         type: "error",
    //     })
    //     return;
    // }
    const fullpaths = selectedFiles.value.map(e => e.path);
    result.value = [];
    loading.value = true;
    progress.value = 0;
    probe(fullpaths);

    const updateProgress = async () => {
        const newProgress = await getProgress(directory.value);
        progress.value = newProgress > progress.value ? newProgress : progress.value;
    };

    const sleep = (ms: number) => {
        return new Promise(resolve => {
            setTimeout(resolve, ms)
        });
    }

    while (progress.value < 100) {
        await updateProgress();
        await sleep(1000);
    }
    const response = JSON.parse(await getProbeResult(directory.value));
    result.value = response.map((e: { file: string; void: number[]; }) => {
        const filename = e.file.split("\\").pop();
        const outputType = referTypeByFileName(filename as string);
        return {
            name: filename,
            void: e.void,
            path: e.file,
            type: outputType,
        }
    });
    loading.value = false;
    progress.value = 100;
    resultShow.value = true;
}


async function selectDirectory() {
    const dir = (await open({
        directory: true,
    })) as string;
    if (dir !== null && dir.length > 0) {
        directory.value = dir
    }
}

async function list_rtfs() {
    if (directory.value.length === 0) {
        files.value = [];
        return;
    }
    let result: File[] = [];
    try {
        let data: Rtf[] = await listRtfs(directory.value);
        data.forEach((item: any) => {
            result.push({ name: item.name, type: item.kind, size: bytesToMegaBytes(item.size), path: `${directory.value}\\${item.name}`, modifiedAt: timestampDisplay(item.modified_at) });
        });
    } catch (e) {
        ElNotification({
            title: "Error",
            message: `${e}`,
            type: "error",
        })
        return;
    }
    files.value = result;
}

watch(directory, debounce(list_rtfs, 100));

watch(chosenProject, async () => {
    const project = chosenProject.value;
    if (project) {
        directory.value = await outputPath(project);
    }
})

onMounted(async () => {
    const project = chosenProject.value;
    if (project) {
        directory.value = await outputPath(project);
    }
    await list_rtfs();
});

</script>

<template>
    <el-container style="padding: 5px;">
        <el-button type="primary" plain @click="selectDirectory">Select</el-button>
        <el-button type="primary" plain @click="showResultDialog">Result</el-button>
        <el-input v-model="directory" style="padding-left: 10px;" placeholder="Please input or select one directory"
            clearable>
        </el-input>
        <el-button type="primary" size="small" @click="list_rtfs" style="height: 30px;width: 40px; margin-left: 10px;"
            plain>
            <el-icon>
                <Refresh />
            </el-icon>
        </el-button>
    </el-container>
    <el-progress v-if="loading" :text-inside="true" style="padding: 5px;"
        :percentage="(() => { return Math.round(progress * 100) / 100 })()" :stroke-width="18">
    </el-progress>
    <el-container style="padding: 5px;">
        <el-table v-loading="loading" :data="files" height="520px" @selection-change="handleSelectionChange">
            <el-table-column type="selection"></el-table-column>
            <el-table-column label="File" property="name" sortable sort-by="name" width="400px" />
            <el-table-column width="150px" label="Type">
                <template #default="scope">
                    <OutputTag :type="scope.row.type"></OutputTag>
                </template>
            </el-table-column>
            <el-table-column label="File Size" sortable sort-by="size" align="right" width="120px">
                <template #default="scope">{{ scope.row.size }} MB</template>
            </el-table-column>
            <el-table-column align="center" sortable sort-by="modifiedAt" label=" Modified At">
                <template #default="scope">
                    {{ scope.row.modifiedAt }}
                </template>
            </el-table-column>
        </el-table>
    </el-container>
    <el-container style="padding: 5px;">
        <el-button type="primary" plain @click="run">Run</el-button>
        <el-button type="primary" plain @click="clear">Clear</el-button>
    </el-container>
    <el-dialog v-model="resultShow" title="Result" draggable style="width: 80%">
        <el-button v-if="!positiveResultOnly" type="primary" plain @click="positiveResultOnlySwtich"
            style="width: 150px;">Positive Result
            Only</el-button>
        <el-button v-if="positiveResultOnly" type="primary" plain @click="positiveResultOnlySwtich"
            style="width: 150px;">All Result</el-button>
        <el-table :data="showResult()" :row-class-name="resultRowClassName" height="370px">
            <el-table-column prop="name" label="File">
                <template #default="scope">
                    <el-link @click="() => { openResultFile(scope.row.path, 1) }">{{ scope.row.name }}</el-link>
                </template>
            </el-table-column>
            <el-table-column prop="void" label="Type">
                <template #default="scope">
                    <OutputTag :type="scope.row.type" />
                </template>
            </el-table-column>
            <el-table-column prop="void" label="Count">
                <template #default="scope">
                    {{ scope.row.void.length }}
                </template>
            </el-table-column>
            <el-table-column>
                <template #default="scope">
                    <el-link @click="() => { openpageBreakDetail(scope.row) }" type="primary"
                        :disabled="scope.row.void.length === 0">Detail</el-link>
                </template>
            </el-table-column>
        </el-table>
        <el-button type="primary" plain @click="closeResultDialog" style="margin: 10px 0px 0px 0px;">Close</el-button>
    </el-dialog>
    <el-drawer size="500px" destroy-on-close v-model="pageBreakDetailShow" :title="currentpageBreakDetail.name">
        <el-space wrap>
            <el-button @click="() => { openResultFile(currentpageBreakDetail.path, v) }" style="width: 100px;"
                type="primary" plain v-for="v in currentpageBreakDetail.void">Page {{ v
                }}</el-button>
        </el-space>
    </el-drawer>
</template>

<style>
.el-table .error-row {
    --el-table-tr-bg-color: var(--el-color-danger-light-3);
}
</style>
