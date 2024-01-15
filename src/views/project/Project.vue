<script setup lang="ts">
import { ref, reactive } from "vue";
import { open } from '@tauri-apps/api/dialog';
import { Item, ProjectKind, toISODatetimeInCst } from "./project";
import { fetchSdtm, fetchAdam, fetchTfls, inferPathAdam, inferPathSdtm, inferPathTfls } from "../../api/inspector/project";
import { ElNotification } from "element-plus";
import { EpPropMergeType } from "element-plus/es/utils/vue/props/index.mjs";

const configPageShow = ref(true);
const configConfirmShow = ref(false);
const project = ref<Item[]>();
const projectKind = ref<ProjectKind>(ProjectKind.SDTM);
const form = reactive({
    root: "",
    config: "",
});
const pathForInfer = ref("");
const tableLoading = ref(false);
const configFileList = ref<string[]>([]);

// const rowClass = ({
//     row,
// }: {
//     row: File
// }) => {
//     let result = "";
//     switch (row.status) {
//         case "Missing":
//             result = "danger";
//             break;
//         case "Unexpected":
//             result = "warning";
//             break;
//         case "NotMatch":
//             result = "danger";
//             break;
//         default:
//             result = "info";
//     }
//     return result;
// };

const tagType = (value: string) => {
    switch (value) {
        case "Ready":
            return "success";
        case "Changed":
            return "warning";
        case "Unexpected":
            return "danger";
        case "Pass":
            return "success";
        case "NotMatch":
            return "danger";
    }
    return "";
};

const fileTagType = (status: string): EpPropMergeType<StringConstructor, "" | "success" | "warning" | "info" | "danger", unknown> | undefined => {
    switch (status) {
        case "Missing":
            return "info";
        case "Unexpected":
            return "warning";
        case "NotMatch":
            return "danger";
        default:
            return "";
    }
};

const popContent = (status: string): string => {
    switch (status) {
        case "Building":
            return "The item is building, perhaps some required files are missing";
        case "Changed":
            return "One or more files have a modification that is earlier than the input data";
        case "Unexpected":
            return "The file modification order is wrong, please check out the timeline";
        case "Ready":
            return "The item is ready";
        case "Missing":
            return "The file is missing";
        case "Fine":
            return "The file is fine";
        case "Pass":
            return "The item passed validation";
        case "NotMatch":
            return "The item did not pass validation";
    }
    return "default"
};

const timelineHeight = (row: Item): string => {
    const row1 = row.groups[0].files.length;
    const row2 = row.groups[1].files.length;
    const max = row1 > row2 ? row1 : row2;
    return (max * 50 + 10) + "px";
};

const extractFileName = (name: string): string => {
    let paths = name.split("\\");
    let names = paths[paths.length - 1].split(".");
    return names.slice(0, names.length - 1).join(".");
};

async function selectDirectory() {
    const dir = (await open({
        directory: true,
    })) as string;
    if (dir.length > 0) {
        pathForInfer.value = dir;
    }
};


async function projectPath() {
    try {
        switch (projectKind.value) {
            case ProjectKind.SDTM:
                ({ config: configFileList.value, root: form.root } = JSON.parse(await inferPathSdtm(pathForInfer.value)));
                break;
            case ProjectKind.ADaM:
                ({ config: configFileList.value, root: form.root } = JSON.parse(await inferPathAdam(pathForInfer.value)));
                break;
            case ProjectKind.TFLs:
                ({ config: configFileList.value, root: form.root } = JSON.parse(await inferPathTfls(pathForInfer.value)));
                break;
        }
        pathForInfer.value = form.root;
        if (configFileList.value.length > 0) {
            form.config = configFileList.value[0];
        }
        configPageShow.value = false;
        configConfirmShow.value = true;
    } catch (error) {
        ElNotification({
            title: 'Error',
            message: 'Invalid file path',
            type: 'error',
        })
    }
}

async function submit() {
    let data;
    if (form.config === "") {
        ElNotification({
            title: 'Error',
            message: 'Invalid Configuration',
            type: 'error',
        })
        return
    }
    configConfirmShow.value = false;
    tableLoading.value = true;
    try {
        switch (projectKind.value) {
            case ProjectKind.SDTM:
                data = JSON.parse(await fetchSdtm(form.config, form.root));
                break;
            case ProjectKind.ADaM:
                data = JSON.parse(await fetchAdam(form.config, form.root));
                break;
            case ProjectKind.TFLs:
                data = JSON.parse(await fetchTfls(form.config, form.root));
                break;

        }
    } catch (error) {
        ElNotification({
            title: 'Error',
            message: 'Invalid file path',
            type: 'error',
        })
        tableLoading.value = false;
    }
    console.log(data)
    project.value = data.items;
    tableLoading.value = false;
}
</script>

<template>
    <el-container style="padding:1px">
        <el-table v-loading="tableLoading" height="650" :data="project">
            <el-table-column type="expand">
                <template #default="scope">
                    <el-container>
                        <el-aside width="250px">
                            <el-scrollbar :height="timelineHeight(scope.row)">
                                <el-timeline style="margin-top: 30px;">
                                    <el-timeline-item v-for="(file, index) in scope.row.timeline" :key="index"
                                        :timestamp="toISODatetimeInCst(file.modified_at)" placement="top">
                                        <div style="padding: 5px; border-radius: 5px">
                                            <div>
                                                <el-tag :type="fileTagType(file.status)" :style="{ width: 70 + 'px' }">{{
                                                    file.kind }}</el-tag>
                                            </div>
                                            <div>
                                                {{ file.name }}
                                            </div>
                                        </div>
                                    </el-timeline-item>
                                </el-timeline>
                            </el-scrollbar>
                        </el-aside>
                        <el-main>
                            <el-row>
                                <el-col :span="12">
                                    <el-table :data="scope.row.groups[0].files">
                                        <el-table-column label="Name" prop="name" />
                                        <el-table-column label="Type">
                                            <template #default="scope">
                                                <el-popover trigger="hover" :content="popContent(scope.row.status)"
                                                    placement="top-start" :width="300">
                                                    <template #reference>
                                                        <el-tag :type="fileTagType(scope.row.status)"
                                                            :style="{ width: 70 + 'px' }">{{
                                                                scope.row.kind
                                                            }}</el-tag>
                                                    </template>
                                                </el-popover>
                                            </template>
                                        </el-table-column>
                                    </el-table>
                                </el-col>
                                <el-col :span="12">
                                    <el-table :data="scope.row.groups[1].files">
                                        <el-table-column label="Name" prop="name" />
                                        <el-table-column label="Type">
                                            <template #default="scope">
                                                <el-popover trigger="hover" :content="popContent(scope.row.status)"
                                                    placement="top-start" :width="300">
                                                    <template #reference>
                                                        <el-tag :type="fileTagType(scope.row.status)"
                                                            :style="{ width: 70 + 'px' }">{{
                                                                scope.row.kind
                                                            }}</el-tag>
                                                    </template>
                                                </el-popover>
                                            </template>
                                        </el-table-column>
                                    </el-table>
                                </el-col>
                            </el-row>
                        </el-main>
                    </el-container>
                </template>
            </el-table-column>
            <el-table-column label="Item" prop="name"></el-table-column>
            <el-table-column label="Production" width="355px">
                <template #default="scope">
                    <el-popover trigger="hover" :content="popContent(scope.row.groups[0].status)" placement="top-start"
                        :width="300">
                        <template #reference>
                            <el-tag :type="tagType(scope.row.groups[0].status)" :style="{ width: 100 + 'px' }">{{
                                scope.row.groups[0].status
                            }}</el-tag>
                        </template>
                    </el-popover>
                </template>
            </el-table-column>
            <el-table-column label="Validation">
                <template #default="scope">
                    <el-popover trigger="hover" :content="popContent(scope.row.groups[1].status)" placement="top-start"
                        :width="300">
                        <template #reference>
                            <el-tag :type="tagType(scope.row.groups[1].status)" :style="{ width: 100 + 'px' }">{{
                                scope.row.groups[1].status
                            }}</el-tag>
                        </template>
                    </el-popover>
                </template>
            </el-table-column>
            <el-table-column width="70px">
                <template #header>
                    <div>
                        <el-button type="primary" size="small" @click="() => { submit() }" plain>
                            <el-icon>
                                <Refresh />
                            </el-icon>
                        </el-button>
                    </div>
                    <div>
                        <el-button type="primary" size="small" style="margin-top: 10px;"
                            @click="() => configPageShow = true" plain>
                            <el-icon>
                                <FolderOpened />
                            </el-icon>
                        </el-button>
                    </div>
                </template>
            </el-table-column>
        </el-table>
    </el-container>
    <el-dialog v-model="configPageShow" draggable title="Project Configuration">
        <el-form label-position="left" label-width="90px" :model="form">
            <el-form-item label="Project Type">
                <el-radio-group v-model="projectKind">
                    <el-radio-button :label="ProjectKind.SDTM" />
                    <el-radio-button :label="ProjectKind.ADaM" />
                    <el-radio-button :label="ProjectKind.TFLs" />
                </el-radio-group>
            </el-form-item>
            <el-form-item label="Directory">
                <el-col :span="3">
                    <el-button type="primary" @click="selectDirectory">Select</el-button>
                </el-col>
                <el-col :span="1"></el-col>
                <el-col :span="19">
                    <el-input v-model="pathForInfer" clearable></el-input>
                </el-col>
            </el-form-item>
        </el-form>
        <el-button type="primary" style="margin:30px 0px 0px 438px" @click="projectPath">Confirm</el-button>
        <el-button style="margin:30px 0px 0px 10px" @click="() => configPageShow = false">Cancel</el-button>
    </el-dialog>
    <el-dialog v-model="configConfirmShow" draggable title="Configruation Confirm" style="width: 510px">
        <el-form label-position="left" label-width="90px" :model="form">
            <el-form-item label="Project Type">
                <el-radio-group v-model="projectKind">
                    <el-radio-button :label="projectKind" />
                </el-radio-group>
            </el-form-item>
            <el-form-item label="Project Root">
                <el-input v-model="form.root" disabled style="width: 350px"></el-input>
            </el-form-item>
            <el-form-item label="Configuration">
                <el-select v-model="form.config" style="width: 350px" default-first-option>
                    <el-option v-for="config in configFileList" :key="config" :label="extractFileName(config)"
                        :value="config" />
                </el-select>
            </el-form-item>
        </el-form>
        <el-button type="primary" style="margin:30px 0px 0px 210px" @click="submit">Confirm</el-button>
        <el-button type="primary" style="margin:30px 0px 0px 10px"
            @click="() => { configConfirmShow = false; configPageShow = true; form.config = '' }">Back</el-button>
        <el-button style="margin:30px 0px 0px 10px"
            @click="() => { configConfirmShow = false; form.config = '' }">Cancel</el-button>
    </el-dialog>
</template>

<style>
.el-dialog .el-button {
    width: 70px
}
</style>