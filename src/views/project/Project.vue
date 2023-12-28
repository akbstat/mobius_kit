<script setup lang="ts">
import { ref, reactive } from "vue";
import { open } from '@tauri-apps/api/dialog';
import { Domain, File, FileToExistedFile, allFiles, ExistedFile, toISODatetimeInCst } from "./project";
import { fetchProject } from "../../api/inspector/project";
import { ElNotification } from "element-plus";

const configPageShow = ref(true);
const project = ref<Domain[]>();
const rawDataModifiedAt = ref(0);
const form = reactive({
    root: "",
    config: "",
});

const rowClass = ({
    row,
}: {
    row: File
}) => {
    if (!row.exist) {
        return 'missing-row'
    }
    return ''
}

const tagType = (value: string) => {
    if (value === "Ready") {
        return "success";
    }
    return "";
}

const fileTagType = (file: File) => {
    if (!file.exist) {
        return "danger";
    }
    if (file.kind === "QcResult") {
        return "warning";
    }
    return "";
}

async function selectDirectory() {
    const dir = (await open({
        directory: true,
    })) as string;
    if (dir.length > 0) {
        form.root = dir;
    }
}

async function selectFile() {
    const dir = (await open({
    })) as string;
    if (dir.length > 0) {
        form.config = dir;
    }
}

async function submit() {
    configPageShow.value = false;
    let data;
    try {
        data = JSON.parse(await fetchProject(form.config, form.root));
    } catch (error) {
        ElNotification({
            title: 'Error',
            message: 'Invalid file path',
            type: 'error',
        })
    }
    rawDataModifiedAt.value = data["rawdata_changed_at"] as number;
    project.value = data["domains"].map((item: Domain) => {
        item.name = item.name.toUpperCase();
        const existed: ExistedFile[] = [{
            name: "raw data",
            kind: "Raw",
            exist: true,
            modified_at: rawDataModifiedAt.value,
            modified_time: toISODatetimeInCst(rawDataModifiedAt.value),
        }];
        const devAllFiles = allFiles(item.dev);
        const qcAllFiles = allFiles(item.qc);
        devAllFiles.forEach((file) => {
            if (file.exist) {
                existed.push(FileToExistedFile(file));
            }
        });
        qcAllFiles.forEach((file) => {
            if (file.exist) {
                existed.push(FileToExistedFile(file));
            }
        });
        item.existed = existed.sort((x: ExistedFile, y: ExistedFile) => x.modified_at - y.modified_at);
        item.fileList = { dev: devAllFiles, qc: qcAllFiles };
        return item;
    });
}
</script>

<template>
    <el-container style="padding:1px">
        <el-table height="538" max-height="538" :data="project">
            <el-table-column type="expand">
                <template #default="props">
                    <el-container>
                        <el-aside width="250px">
                            <el-scrollbar height="360px">
                                <el-timeline style="margin-top: 30px;">
                                    <el-timeline-item v-for="(file, index) in  props.row.existed " :key="index"
                                        :timestamp="file.modified_time" placement="top">
                                        <div style="padding: 5px; border-radius: 5px">
                                            <div>
                                                <el-tag :type="fileTagType(file)" :style="{ width: 70 + 'px' }">{{
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
                                    <el-table :data="props.row.fileList.dev" :row-class-name="rowClass">
                                        <el-table-column label="Name" prop="name" />
                                        <el-table-column label="Type">
                                            <template #default="scope">
                                                <el-tag :type="fileTagType(scope.row)" :style="{ width: 70 + 'px' }"> {{
                                                    scope.row.kind
                                                }}</el-tag>
                                            </template>
                                        </el-table-column>
                                    </el-table>
                                </el-col>
                                <el-col :span="12">
                                    <el-table :data="props.row.fileList.qc" :row-class-name="rowClass">
                                        <el-table-column label="Name" prop="name" />
                                        <el-table-column label="Type">
                                            <template #default="scope">
                                                <el-tag :type="fileTagType(scope.row)" :style="{ width: 70 + 'px' }">{{
                                                    scope.row.kind
                                                }}</el-tag>
                                            </template>
                                        </el-table-column>
                                    </el-table>
                                </el-col>
                            </el-row>
                        </el-main>
                    </el-container>
                </template>
            </el-table-column>
            <el-table-column label="Domain" prop="name"></el-table-column>
            <el-table-column label="Production" width="355px">
                <template #default="scope">
                    <el-tag :type="tagType(scope.row.dev.status)" :style="{ width: 100 + 'px' }">{{ scope.row.dev.status
                    }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="Validation">
                <template #default="scope">
                    <el-tag :type="tagType(scope.row.dev.status)" :style="{ width: 100 + 'px' }">{{ scope.row.qc.status
                    }}</el-tag>
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
            <el-form-item label="Config File">
                <el-col :span="3">
                    <el-button type="primary" @click="selectFile">Select</el-button>
                </el-col>
                <el-col :span="1"></el-col>
                <el-col :span="19">
                    <el-input v-model="form.config" clearable></el-input>
                </el-col>
            </el-form-item>
            <el-form-item label="Project Root">
                <el-col :span="3">
                    <el-button type="primary" @click="selectDirectory">Select</el-button>
                </el-col>
                <el-col :span="1"></el-col>
                <el-col :span="19">
                    <el-input v-model="form.root" clearable></el-input>
                </el-col>
            </el-form-item>
        </el-form>
        <el-button type="primary" style="margin:30px 0px 0px 368px" @click="submit">Confirm</el-button>
        <el-button style="margin:30px 0px 0px 10px" @click="() => configPageShow = false">Cancel</el-button>
    </el-dialog>
</template>

<style>
.el-dialog .el-button {
    width: 70px
}
</style>