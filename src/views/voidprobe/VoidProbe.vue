<script setup lang="ts">
import { ref, watch } from 'vue';
import { File } from './file';
import { Result } from './result';
import { open } from '@tauri-apps/api/dialog';
import OutputTag from "../../components/OutputTag.vue";
import { debounce } from 'lodash';
import { invoke } from '@tauri-apps/api/tauri';
import { ElNotification } from 'element-plus';
import { probe, getProgress, getProbeResult, removeTempDir, openPDF } from "../../api/void_probe/probe";

const directory = ref("");
const files = ref<File[]>([]);
const selectedFiles = ref<File[]>([]);
const resultShow = ref(false);
const result = ref<Result[]>([]);
const loading = ref(false);
const progress = ref(0);
const positiveResultOnly = ref(false);
const pageBreakDetailShow = ref(false);
const currentpageBreakDetail = ref<Result>({ name: "", type: "", void: [] });

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

async function openResultFile(filename: string, page: number) {
    await openPDF(`${directory.value}\\.temp\\${filename}`, page);
}

function openpageBreakDetail(detail: Result) {
    currentpageBreakDetail.value = detail;
    pageBreakDetailShow.value = true;
}

async function run() {
    const fullpaths = selectedFiles.value.map(e => e.path);
    result.value = [];
    loading.value = true;
    progress.value = 0;
    await removeTempDir(directory.value);
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
    if (dir.length > 0) {
        directory.value = dir
    }
}

watch(directory, debounce(async () => {
    if (directory.value.length === 0) {
        files.value = [];
        return;
    }
    let result: File[] = [];
    try {
        let data: string = await invoke("list_rtfs", { "dir": directory.value });
        JSON.parse(data).forEach((item: any) => {
            result.push({ name: item.name, type: item.kind, size: bytesToMegaBytes(item.size), path: `${directory.value}\\${item.name}` });
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
}, 100));



</script>

<template>
    <el-container style="padding: 5px;">
        <el-button type="primary" plain @click="selectDirectory">Select</el-button>
        <el-button type="primary" plain @click="showResultDialog">Result</el-button>
        <el-input v-model="directory" style="padding-left: 10px;" placeholder="Please input or select one directory"
            clearable></el-input>
    </el-container>
    <el-progress v-if="loading" :text-inside="true" style="padding: 5px;"
        :percentage="(() => { return Math.round(progress * 100) / 100 })()" :stroke-width="18">
    </el-progress>
    <el-container style="padding: 5px;">
        <el-table v-loading="loading" :data="files" height="520px" @selection-change="handleSelectionChange">
            <el-table-column type="selection"></el-table-column>
            <el-table-column label="File" property="name" sortable sort-by="name" width="400px" />
            <el-table-column label="Type">
                <template #default="scope">
                    <OutputTag :type="scope.row.type"></OutputTag>
                </template>
            </el-table-column>
            <el-table-column label="File Size" sortable sort-by="size" align="right">
                <template #default="scope">{{ scope.row.size }} MB</template>
            </el-table-column>
            <el-table-column />
        </el-table>
    </el-container>
    <el-container style="padding: 5px;">
        <el-button type="primary" plain @click="run">Run</el-button>
        <el-button type="primary" plain @click="clear">Clear</el-button>
    </el-container>
    <el-dialog v-model="resultShow" title="Result" draggable>
        <el-button v-if="!positiveResultOnly" type="primary" plain @click="positiveResultOnlySwtich"
            style="width: 150px;">Positive Result
            Only</el-button>
        <el-button v-if="positiveResultOnly" type="primary" plain @click="positiveResultOnlySwtich"
            style="width: 150px;">All Result</el-button>
        <el-table :data="showResult()" :row-class-name="resultRowClassName" height="370px">
            <el-table-column prop="name" label="File">
                <template #default="scope">
                    <el-link @click="() => { openResultFile(scope.row.name, 1) }">{{ scope.row.name }}</el-link>
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
            <el-button @click="() => { openResultFile(currentpageBreakDetail.name, v) }" style="width: 100px;"
                type="primary" plain v-for="v in currentpageBreakDetail.void">Page {{ v
                }}</el-button>
        </el-space>
    </el-drawer>
</template>

<style>
.el-table .error-row {
    --el-table-tr-bg-color: var(--el-color-danger-light-3);
}

.el-dialog {
    width: 80%;
}
</style>

