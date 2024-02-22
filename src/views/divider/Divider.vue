<script setup lang="ts">
import { ref, watch } from "vue";
import { open } from '@tauri-apps/api/dialog';
import { ElMessageBox, ElTable, ElNotification } from "element-plus";
import { debounce } from "lodash";
// import { BaseDirectory, readDir } from "@tauri-apps/api/fs";
import { Rtf, rtfExtention } from "./rtf";
import { invoke } from "@tauri-apps/api/tauri";
import OutputTag from "../../components/OutputTag.vue";


const configPagesizePageVisible = ref(false);
const resultPageVisible = ref(false);
const loading = ref(false);
const divided_rtf_dir = "rtf_divided";
const directory = ref("");
const pagesize = ref(50);
const selected_rtfs = ref<Rtf[]>([]);
const all_rtfs = ref<Rtf[]>([]);
const multipleTableRef = ref<InstanceType<typeof ElTable>>()

function handleSelectionChange(val: Rtf[]) {
    selected_rtfs.value = val;
}

function clearSelections(rows?: Rtf[]) {
    if (rows) {
        rows.forEach((row) => {
            // @ts-expect-error
            multipleTableRef.value!.toggleRowSelection(row, undefined)
        })
    } else {
        multipleTableRef.value!.clearSelection()
    }
}

async function selectDirectory() {
    const dir = (await open({
        directory: true,
    })) as string;
    if (dir.length > 0) {
        directory.value = dir
    }
}

function configPagesizeShow() {
    if (selected_rtfs.value.length === 0) {
        ElMessageBox.alert('There is not rtf file has been seleted', 'Warning', {
            confirmButtonText: 'Get it',
        })
        return
    }
    configPagesizePageVisible.value = true;
}

async function divide() {
    configPagesizePageVisible.value = false;
    loading.value = true;
    await invoke(
        "divide_rtf",
        {
            files: selected_rtfs.value.map((item: Rtf) => item.path + "/" + item.name + rtfExtention),
            pagesize: pagesize.value,
            dest: selected_rtfs.value[0].path + "/" + divided_rtf_dir
        },
    );
    loading.value = false;
    resultPageVisible.value = true;
    return
}

async function updateRtfList(path: string) {
    if (path === undefined || path.length === 0) {
        all_rtfs.value = [];
        return;
    }
    let rtfs: Rtf[] = [];
    try {
        let data: string = await invoke("list_rtfs", { "dir": directory.value });
        JSON.parse(data).forEach((item: any) => {
            rtfs.push(new Rtf(item.name, path, item.kind, item.size));
        });
    } catch (e) {
        ElNotification({
            title: "Error",
            message: `${e}`,
            type: "error",
        })
        return;
    }
    all_rtfs.value = rtfs;
}

async function openResultDirectory() {
    await invoke(
        "open_directory",
        {
            path: selected_rtfs.value[0].path + "/" + divided_rtf_dir,
        },
    );
    resultPageVisible.value = false;
    return;
}

watch(directory, debounce(updateRtfList, 100));

</script>

<template>
    <el-container style="padding:15px">
        <el-button @click="selectDirectory" type="primary" style="width: 100px;">Select</el-button>
        <el-input v-model="directory" style="padding-left: 10px;" placeholder="Please input or select one directory"
            clearable />
    </el-container>
    <el-container style="padding: 0px 15px 0px; height: 100%;">
        <el-table v-loading="loading" ref="multipleTableRef" :data="all_rtfs" style="width: 100%"
            @selection-change="handleSelectionChange" height="520px">
            <el-table-column type="selection" min-width="5%" />
            <el-table-column label="File" min-width="70%" sortable sort-by="name">
                <template #default="scope">{{ scope.row.name }}</template>
            </el-table-column>
            <el-table-column label="Type" min-width="15%">
                <template #default="scope">
                    <OutputTag :type="scope.row.kind"></OutputTag>
                    <!-- <el-tag :style="{ backgroundColor: scope.row.color, color: 'white', width: 70 + 'px' }">{{
                        scope.row.kind }}</el-tag> -->
                </template>
            </el-table-column>
            <el-table-column label="File Size" min-width="15%" sortable align="right" sort-by="size">
                <template #default="scope">
                    {{ scope.row.size }} MB
                </template>
            </el-table-column>
            <el-table-column min-width="5%">
            </el-table-column>
        </el-table>
    </el-container>
    <el-container style="padding:15px">
        <el-button @click="configPagesizeShow" type="primary" style="width: 100px; ">Divide</el-button>
        <el-button @click="clearSelections()" type="primary" style="width: 100px; ">Clear</el-button>
    </el-container>
    <el-dialog v-model="configPagesizePageVisible" title="Configuration Confirm" draggable>
        <span style="font-size: 18px; margin-right: 30px;">Pagesize</span>
        <el-input-number v-model="pagesize" :min="1" :max="100" :step="10" controls-position="right" />
        <el-container style="font-size: 18px;padding-top: 50px;">Chosen RTF Files</el-container>
        <el-container style="padding-top: 15px;">
            <el-table :data="selected_rtfs" style="width: 100%" max-height="250px">
                <el-table-column label="File" width="350px">
                    <template #default="scope">{{ scope.row.name }}</template>
                </el-table-column>
                <el-table-column label="Type" width="200px">
                    <template #default="scope">
                        <OutputTag :type="scope.row.kind" />
                        <!-- <el-tag :style="{ backgroundColor: scope.row.color, color: 'white', width: 70 + 'px' }">{{
                            scope.row.kind }}</el-tag> -->
                    </template>
                </el-table-column>
            </el-table>
        </el-container>
        <el-container style="padding-top: 30px;">
            <el-button @click="divide" type="primary" style="width: 100px; ">Divide</el-button>
            <el-button @click="() => { configPagesizePageVisible = false; }" type="primary"
                style="width: 100px; ">Cancel</el-button>
        </el-container>
    </el-dialog>
    <el-dialog v-model="resultPageVisible" title="Divide Complete" draggable>
        <el-button @click="openResultDirectory" type="primary" style="width: 150px; margin-left: 240px;">Go to
            Directory</el-button>
        <el-button @click="() => { resultPageVisible = false; }" type="primary" style="width: 150px; ">Cancel</el-button>
    </el-dialog>
</template>
