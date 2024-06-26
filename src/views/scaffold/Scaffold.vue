<script setup lang="ts">
import { ref, watch } from 'vue';
import { open } from '@tauri-apps/api/dialog';
import { debounce } from "lodash";
import { inferPathAdam, inferPathSdtm, inferPathTfls } from "../../api/inspector/project";
import { createFromTemplate, FileResult } from "../../api/scaffold/create";
import { invoke } from '@tauri-apps/api/tauri';
import { ElNotification } from 'element-plus';
import { ErrorInfo } from "./errorInfo";

enum ProjectKind {
    SDTM = "SDTM",
    ADaM = "ADaM",
    TFLs = "TFL",
    UNKNOWN = ""
}

let showErrorPanel = ref(false);
let errorMessages = ref<ErrorInfo[]>([]);
let showCompleteDialag = ref(false);
let loading = ref(false);
let projectKind = ref<ProjectKind>(ProjectKind.SDTM);
let rootPath = ref("");
let devDestinationPath = ref("");
let qcDestinationPath = ref("");
let configPath = ref("");
let project = ref("");
let configs = ref<string[]>([]);
let engine = ref("SAS 9.4 Unicode")
let groupDev = ref(true);
let groupQc = ref(false);
let engines = ref<string[]>(["SAS 9.4 Unicode", "SAS 9.4", "SAS EG 8.3"]);
let customCodePanelShow = ref(false);
let customCode = ref(["", "", ""]);
let devResultDetailPanelShow = ref(false);
let qcResultDetailPanelShow = ref(false);
let devResult = ref<FileResult[]>([]);
let qcResult = ref<FileResult[]>([]);
let devResultFilter = ref(false);
let qcResultFilter = ref(false);
watch(rootPath, debounce(update, 100));

function update() {
    switch (projectKind.value) {
        case ProjectKind.SDTM:
            inferPathSdtm(rootPath.value).then(data => {
                ({ config: configs.value, root: rootPath.value } = JSON.parse(data));
                configPath.value = configs.value.length > 0 ? configs.value[configs.value.length - 1] : "";
                project.value = projectCode(rootPath.value);
                devDestinationPath.value = referDevFolder(rootPath.value);
                qcDestinationPath.value = referQcFolder(rootPath.value);
            })
            break;
        case ProjectKind.ADaM:
            inferPathAdam(rootPath.value).then(data => {
                ({ config: configs.value, root: rootPath.value } = JSON.parse(data));
                configPath.value = configs.value.length > 0 ? configs.value[configs.value.length - 1] : "";
                project.value = projectCode(rootPath.value);
                devDestinationPath.value = referDevFolder(rootPath.value);
                qcDestinationPath.value = referQcFolder(rootPath.value);
            })
            break;
        case ProjectKind.TFLs:
            inferPathTfls(rootPath.value).then(data => {
                ({ config: configs.value, root: rootPath.value } = JSON.parse(data));
                configPath.value = configs.value.length > 0 ? configs.value[configs.value.length - 1] : "";
                project.value = projectCode(rootPath.value);
                devDestinationPath.value = referDevFolder(rootPath.value);
                qcDestinationPath.value = referQcFolder(rootPath.value);
            })
            break;
        default:
    }
}

function readyToSubmit(): boolean {
    if (rootPath.value.length === 0 || configPath.value.length === 0) {
        return true;
    }
    if (groupDev && devDestinationPath.value.length === 0) {
        return true
    }
    if (groupQc && qcDestinationPath.value.length === 0) {
        return true
    }
    return false;
}

function extractFileName(name: string): string {
    if (name === undefined) {
        return ""
    }
    let paths = name.split("\\");
    let names = paths[paths.length - 1].split(".");
    return names.slice(0, names.length - 1).join(".");
};

function referDevFolder(root: string): string {
    return `${root}\\product\\program\\${projectKind.value.toLowerCase()}`;
}

function referQcFolder(root: string): string {
    return `${root}\\validation\\program\\${projectKind.value.toLowerCase()}`;
}

function projectCode(path: string): string {
    if (path === undefined) {
        return ""
    }
    let paths = path.split("\\");
    let main = 0;
    let supp = 0;
    for (let i = 0; i < paths.length; i++) {
        if (paths[i] === "Studies") {
            main = i + 1;
            supp = main + 1;
            break;
        }
    }
    return `${paths[main]}-${paths[supp]}`.toUpperCase();
}

function reset() {
    rootPath.value = "";
    configPath.value = "";
    configs.value = [];
    project.value = "";
    groupDev.value = true;
    groupQc.value = false;
    engine.value = engines.value[0];
    projectKind.value = ProjectKind.SDTM;
    devDestinationPath.value = "";
    qcDestinationPath.value = "";
    customCode.value = ["", "", ""];
}

function showCustomPanel() {
    customCodePanelShow.value = true;
}

function showDevResultDetailPanel() {
    devResultDetailPanelShow.value = true;
}


function showQcResultDetailPanel() {
    qcResultDetailPanelShow.value = true;
}

function fileTagType(f: FileResult) {
    if (f.existed) {
        return "info";
    }
    return "";
}

function showResult(result: FileResult[], filter: boolean): FileResult[] {
    return result.filter((e: FileResult) => {
        return filter ? (!e.existed) : true
    });
}

function fileTagWidth(): string {
    if (projectKind.value === ProjectKind.TFLs) {
        return "250px";
    }
    return "100px";
}

async function openDirectory(path: string) {
    await invoke(
        "open_directory",
        {
            path,
        },
    );
}

async function submit() {
    const param = {
        project: project.value,
        engine: engine.value,
        config: configPath.value,
        kind: projectKind.value,
        dev: groupDev.value,
        qc: groupQc.value,
        dev_dest: devDestinationPath.value,
        qc_dest: qcDestinationPath.value,
        custom_code: customCode.value,
    };
    loading.value = true
    try {
        let result = await createFromTemplate(param);
        devResult.value = result.dev;
        qcResult.value = result.qc;
    } catch (error) {
        try {
            errorMessages = JSON.parse(`${error}`);
            showErrorPanel.value = true;
        } catch {
            ElNotification({
                title: 'Error',
                message: `${error}`,
                type: 'error',
            })
        }
        return
    }
    loading.value = false;
    showCompleteDialag.value = true;
}

async function rootSelect() {
    const dir = (await open({
        directory: true,
    })) as string;
    if (dir.length > 0) {
        rootPath.value = dir;
    }
}
async function devDestinationSelect() {
    const dir = (await open({
        directory: true,
    })) as string;
    if (dir.length > 0) {
        devDestinationPath.value = dir;
    }
}
async function qcDestinationSelect() {
    const dir = (await open({
        directory: true,
    })) as string;
    if (dir.length > 0) {
        qcDestinationPath.value = dir;
    }
}
</script>

<template>
    <el-container>
        <el-form label-position="left" label-width="100px" style="margin: 30px; width: 100%;">
            <el-form-item label="Type">
                <el-radio-group v-model="projectKind" @change="update">
                    <el-radio-button :label="ProjectKind.SDTM" />
                    <el-radio-button :label="ProjectKind.ADaM" />
                    <el-radio-button :label="ProjectKind.TFLs" />
                </el-radio-group>
            </el-form-item>
            <el-form-item label="Project Root">
                <el-col :span="2">
                    <el-button @click="rootSelect" type="primary" plain>Select</el-button>
                </el-col>
                <el-col :span="15">
                    <el-input v-model="rootPath" clearable style="width: 400px;" />
                </el-col>
            </el-form-item>
            <el-form-item label="Configuration">
                <el-select v-model="configPath" style="width: 480px" default-first-option>
                    <el-option v-for=" config  in  configs " :label="extractFileName(config)" :value="config" />
                </el-select>
            </el-form-item>
            <el-form-item label="Project Code">
                <el-input v-model="project" clearable style="width: 480px;" />
            </el-form-item>
            <el-form-item label="Code Group">
                <el-checkbox v-model="groupDev" label="Dev" size="default" />
                <el-checkbox v-model="groupQc" label="Qc" size="default" />
            </el-form-item>
            <el-form-item label="SAS Version">
                <el-select v-model="engine" style="width: 480px" default-first-option>
                    <el-option v-for=" engine  in  engines " :key="engine" :label="engine" :value="engine" />
                </el-select>
            </el-form-item>
            <el-form-item label="Custom Code">
                <el-button type="primary" @click="showCustomPanel" plain>Edit</el-button>
            </el-form-item>
            <el-form-item v-if="groupDev" label="Dev Folder">
                <el-col :span="2">
                    <el-button type="primary" @click="devDestinationSelect" plain>Select</el-button>
                </el-col>
                <el-col :span="15">
                    <el-input v-model="devDestinationPath" clearable style="width: 400px;" />
                </el-col>
            </el-form-item>
            <el-form-item v-if="groupQc" label="Qc Folder">
                <el-col :span="2">
                    <el-button type="primary" @click="qcDestinationSelect" plain>Select</el-button>
                </el-col>
                <el-col :span="15">
                    <el-input v-model="qcDestinationPath" clearable style="width: 400px;" />
                </el-col>
            </el-form-item>
            <el-form-item>
                <el-button :disabled="readyToSubmit()" type="primary" @click="submit" plain>Submit</el-button>
                <el-button @click="reset" plain>Reset</el-button>
            </el-form-item>
        </el-form>
    </el-container>
    <el-dialog v-model="showCompleteDialag" title="Complete" draggable>
        <el-descriptions :column="2" direction="vertical" border>
            <el-descriptions-item label="Project Code">{{ project }}</el-descriptions-item>
            <el-descriptions-item label="SAS Version">{{ engine }}</el-descriptions-item>
            <el-descriptions-item v-if="groupDev" label="Dev Directory" :span="2">
                <el-button type="primary" link style="width: 514px; justify-content: left"
                    @click="() => { openDirectory(devDestinationPath) }">
                    {{ devDestinationPath }}
                </el-button>
                <el-button type="primary" plain style="width: 60px; " @click="showDevResultDetailPanel">
                    Details
                </el-button>
            </el-descriptions-item>
            <el-descriptions-item v-if="groupQc" label="Qc Directory" :span="2">
                <el-button type="primary" link style="width: 514px; justify-content: left;"
                    @click="() => { openDirectory(qcDestinationPath) }">
                    {{ qcDestinationPath }}
                </el-button>
                <el-button type="primary" plain style="width: 60px; " @click="showQcResultDetailPanel">
                    Details
                </el-button>
            </el-descriptions-item>
        </el-descriptions>
        <el-button type="primary" @click="() => { showCompleteDialag = false }"
            style="margin-left: 0px; margin-top: 20px;" plain>Close</el-button>
    </el-dialog>
    <el-dialog v-model="showErrorPanel" title="Task Failed">
        <el-text class="mx-1" type="danger" size="large">Failed to generate templates, please fix following issues and
            retry</el-text>
        <div style="margin-top: 20px;">
            <el-table :data="errorMessages">
                <el-table-column label="Item" prop="item" />
                <el-table-column label="Issue" prop="message" />
            </el-table>
        </div>
        <el-button style="margin-top: 20px;" type="primary" @click="() => showErrorPanel = false" plain>Got
            it</el-button>
    </el-dialog>
    <el-drawer v-model="customCodePanelShow" title="Custom Code" size="500px">
        <div style="padding-bottom: 10px;">
            <span>Before Init General</span>
            <el-input v-model="customCode[0]" :autosize="{ minRows: 7, maxRows: 7 }" type="textarea" />
        </div>
        <div style="padding-bottom: 10px;">
            <span>Programming Personally</span>
            <el-input v-model="customCode[1]" :autosize="{ minRows: 7, maxRows: 7 }" type="textarea" />
        </div>
        <div style="padding-bottom: 10px;">
            <span>After Savelog End</span>
            <el-input v-model="customCode[2]" :autosize="{ minRows: 7, maxRows: 7 }" type="textarea" />
        </div>
    </el-drawer>
    <el-drawer v-model="devResultDetailPanelShow" title="Details of Dev Group" size="600px">
        <el-switch style="--el-switch-on-color: #3375b9; --el-switch-off-color: #393a3c;" v-model="devResultFilter"
            class="ml-2" width="80" size="large" inline-prompt active-text="Created" inactive-text="All" />
        <el-space style="margin-top: 20px;" wrap>
            <el-tag v-for="item in showResult(devResult, devResultFilter)" :type="fileTagType(item)"
                :style="{ width: fileTagWidth() }">{{ item.name }}</el-tag>
        </el-space>
    </el-drawer>
    <el-drawer v-model="qcResultDetailPanelShow" title="Details of Qc Group" size="600px">
        <el-switch style="--el-switch-on-color: #3375b9; --el-switch-off-color: #393a3c;" v-model="qcResultFilter"
            class="ml-2" width="80" size="large" inline-prompt active-text="Created" inactive-text="All" />
        <el-space style="margin-top: 20px;" wrap>
            <el-tag v-for="item in showResult(qcResult, qcResultFilter)" :type="fileTagType(item)"
                :style="{ width: fileTagWidth() }">{{ item.name }}</el-tag>
        </el-space>
    </el-drawer>
</template>

<style>
.el-button {
    width: 70px;
}

.el-radio-button__original-radio:checked+.el-radio-button__inner {
    background-color: #18222c;
    color: #409EFF;
}
</style>