<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { open } from '@tauri-apps/api/dialog';
import { debounce } from "lodash";
import { inferPathAdam, inferPathSdtm, inferPathTfls } from "../../api/inspector/project";
import { createFromTemplate, FileResult } from "../../api/scaffold/create";
import { getProjects, createProject, buildRootPath, openDirectory, listItems } from "../../api/scaffold/project";
import { ElMessage, ElNotification, FormInstance, FormRules, TabPaneName } from 'element-plus';
import { ErrorInfo } from "./errorInfo";
import { inferChosenProject, CreateProjectForm, purposes, ProjectKind, Item } from "./scaffold";
import { ChosenProject, Product } from "../../components/project-list/project";
import { ArrowRight } from '@element-plus/icons-vue';
import ProjectList from "../../components/project-list/ProjectList.vue";
import ProjectNavigator from "../../components/project-navigator/ProjectNavigator.vue";
import Template from "../../components/template/Template.vue";
import TaskAssignment from '../../components/task-assignment/TaskAssignment.vue';
import { useScaffold } from "../../store/scaffold";
import { storeToRefs } from 'pinia';
import { TemplateSelected } from '../../components/template/template';
import { fetchOfficalTemplate } from "../../api/scaffold/template";
import { Assignment } from '../../components/task-assignment/assignment';


const buttonStyle = {
    backgroundColor: "#18222c",
    color: "#409EFF",
    borderColor: "#2a598a",
    borderWidth: "1px"
}
let store = useScaffold();
let { chosenProject, openedTab, projectKind } = storeToRefs(store);
let newProject = ref<CreateProjectForm>({
    product: "", trail: "", purpose: "", from: "",
});
const ruleFormRef = ref<FormInstance>();
let showCreateProject = ref(false);
let showErrorPanel = ref(false);
let errorMessages = ref<ErrorInfo[]>([]);
let showCompleteDialag = ref(false);
let loading = ref(false);
// let projectKind = ref<ProjectKind>(ProjectKind.SDTM);
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
let projectList = ref<Product[]>([]);
let templateSelected: TemplateSelected = { dev: "", qc: "" };
const createProjectRules = reactive<FormRules<CreateProjectForm>>({
    product: [
        { validator: validateProductID, trigger: "change" },
    ],
    trail: [{ required: true, trigger: "change" }],
    purpose: [{ required: true, trigger: "change" }],
});
const items = ref<Item[]>([]);
const taskAssignmentDisplay = ref(false);
let assignment: Assignment[] = [];

watch(rootPath, debounce(update, 100));

watch(chosenProject, debounce(async () => {
    if (chosenProject.value) {
        rootPath.value = await buildRootPath(chosenProject.value);
    }
}, 100))

watch(configPath, debounce(async () => {
    if (configPath.value.length > 0) {
        items.value = (await listItems(projectKind.value, configPath.value)).map((item: string) => { return { name: item, developer: "" } });
    }
}, 100));

onMounted(async () => {
    if (chosenProject.value.purpose) {
        rootPath.value = await buildRootPath(chosenProject.value);
    }
    projectList.value = await getProjects();
});

function update() {
    fetchOfficalTemplate(projectKind.value).then(data => {
        templateSelected = data;
    });
    switch (projectKind.value) {
        case ProjectKind.SDTM:
            inferPathSdtm(rootPath.value).then(data => {
                ({ config: configs.value, root: rootPath.value } = JSON.parse(data));
                configPath.value = configs.value.length > 0 ? configs.value[configs.value.length - 1] : "";
                project.value = projectCode(rootPath.value);
                devDestinationPath.value = referDevFolder(rootPath.value);
                qcDestinationPath.value = referQcFolder(rootPath.value);
                if (configPath.value.length > 0) {
                    listItems(projectKind.value, configPath.value).then(data => {
                        items.value = data.map((item: string) => { return { name: item, developer: "" } });
                    });
                }
            })
            break;
        case ProjectKind.ADaM:
            inferPathAdam(rootPath.value).then(data => {
                ({ config: configs.value, root: rootPath.value } = JSON.parse(data));
                configPath.value = configs.value.length > 0 ? configs.value[configs.value.length - 1] : "";
                project.value = projectCode(rootPath.value);
                devDestinationPath.value = referDevFolder(rootPath.value);
                qcDestinationPath.value = referQcFolder(rootPath.value);
                if (configPath.value.length > 0) {
                    listItems(projectKind.value, configPath.value).then(data => {
                        items.value = data.map((item: string) => { return { name: item, developer: "" } });
                    });
                }
            })
            break;
        case ProjectKind.TFLs:
            inferPathTfls(rootPath.value).then(data => {
                ({ config: configs.value, root: rootPath.value } = JSON.parse(data));
                configPath.value = configs.value.length > 0 ? configs.value[configs.value.length - 1] : "";
                project.value = projectCode(rootPath.value);
                devDestinationPath.value = referDevFolder(rootPath.value);
                qcDestinationPath.value = referQcFolder(rootPath.value);
                if (configPath.value.length > 0) {
                    listItems(projectKind.value, configPath.value).then(data => {
                        items.value = data.map((item: string) => { return { name: item, developer: "" } });
                    });
                }
            })
            break;
        default:
    }
    const currentChosenProject = inferChosenProject(rootPath.value);
    setChosenProject(currentChosenProject);
}

function setChosenProject(project: ChosenProject | undefined) {
    if (project !== undefined) {
        ElMessage({
            message: `Switch to project: ${project.product.toUpperCase()}-${project.trail.toUpperCase()}-${project.purpose} (${projectKind.value})`,
            type: "success",
        })
        chosenProject.value = project;
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

function projectKindtoFolderName(source: string) {
    if (source === "TFLs") return "tfl";
    else return source.toLowerCase();
}

function referDevFolder(root: string): string {
    return `${root}\\product\\program\\${projectKindtoFolderName(projectKind.value)}`;
}

function referQcFolder(root: string): string {
    return `${root}\\validation\\program\\${projectKindtoFolderName(projectKind.value)}`;
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


function productCodeSearch(queryString: string, cb: any) {
    let products = projectList.value.map((product) => {
        return { value: product.name };
    });
    cb(queryString.length === 0 ? products : products.filter((product) => product.value.toLowerCase().includes(queryString.toLowerCase())));
}

function trailCodeSearch(queryString: string, cb: any) {
    let product_code = newProject.value.product;
    if (!product_code || product_code.length === 0) {
        return cb([]);
    }
    const products = projectList.value.filter((p) => p.name === product_code);
    if (products.length === 0) {
        return cb([]);
    }
    const trails = products[0].trails.map((trail) => {
        return { value: trail.name };
    });
    cb(queryString.length === 0 ? trails : trails.filter((t) => t.value.toLowerCase().includes(queryString)));
}

function purposeSearch(queryString: string, cb: any) {
    cb(queryString.length === 0 ? purposes : purposes.filter((purpose) => purpose.value.toLowerCase().includes(queryString.toLowerCase())));
}

function fromSearch(queryString: string, cb: any) {
    const { product, trail } = newProject.value;
    if (product.length === 0 || trail.length === 0) {
        cb([]);
        return;
    }
    const purposes = projectList.value.flatMap((product) => product.trails.flatMap((trail) => trail.purpose)).filter((purpose) => purpose.id.includes(`${product}-${trail}`)).map(purpose => { return { value: purpose.name } });
    cb(queryString.length === 0 ? purposes : purposes.filter((purpose) => purpose.value.includes(queryString.toLowerCase())));
}

function validateProductID(_: any, value: string, callback: any) {
    if (!value.trim().match(/^ak\d{3}$/igm)) {
        callback(new Error("Please enter a valid product ID, such as ak101"))
    }
    callback()
}

function changeAssignemt(data: Assignment[]) {
    assignment = data;
    taskAssignmentDisplay.value = false;
}

async function createNewProject(formEl: FormInstance | undefined) {
    if (!formEl) return;
    let result = await formEl.validate();
    if (!result) {
        return;
    }
    await createProject(newProject.value);
    showCreateProject.value = false;
    const { product, trail, purpose } = newProject.value;
    ElMessage({
        type: "success",
        message: `Project ${product.toUpperCase()}-${trail}-${purpose.toUpperCase()} has been created`,
    });
    formEl.resetFields();
    projectList.value = await getProjects();
}

function cancelCreateProject(formEl: FormInstance | undefined) {
    showCreateProject.value = false;
    if (!formEl) return;
    formEl.resetFields();
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
        template: templateSelected,
        assignment,
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
    <el-container style="height: 650px;">
        <el-aside width="200px" style="padding: 5px;">
            <el-container>
                <el-main style="padding: 0px;">
                    <ProjectList :projects="projectList"
                        @project-change="(project: ChosenProject) => { chosenProject = project; }" />

                </el-main>
                <el-footer style="padding: 5px 0px 0px 0px; height: auto;">
                    <el-button disabled click="() => { showCreateProject = true }" type="primary" style="width: 100%"
                        plain>New</el-button>
                </el-footer>
            </el-container>
        </el-aside>
        <el-main style="padding: 0px;">
            <el-container>
                <el-header style="padding: 15px 0px 9px 20px; height: 40px; ">
                    <el-breadcrumb v-if="chosenProject.purpose" :separator-icon="ArrowRight">
                        <el-breadcrumb-item>
                            <span style="color: #409EFF;">{{ chosenProject.product }}</span>
                        </el-breadcrumb-item>
                        <el-breadcrumb-item>
                            <span style="color: #409EFF;">{{ chosenProject.trail }}</span>
                        </el-breadcrumb-item>
                        <el-breadcrumb-item>
                            <span style=" color: #409EFF;">{{ chosenProject.purpose }}</span>
                        </el-breadcrumb-item>
                    </el-breadcrumb>
                </el-header>
                <el-main>
                    <el-radio-group v-model="projectKind" @change="update" style="margin-bottom: 30px;">
                        <el-radio-button :label="ProjectKind.SDTM" />
                        <el-radio-button :label="ProjectKind.ADaM" />
                        <el-radio-button :label="ProjectKind.TFLs" />
                    </el-radio-group>
                    <el-tabs tab-position="right" :model-value="openedTab"
                        @tab-change="(tab: TabPaneName) => { openedTab = tab as string }">
                        <el-tab-pane label="Template Builder" key="builder" name="builder">
                            <el-form :rules="createProjectRules" label-position="left" label-width="100px">
                                <el-form-item label=" Project Root">
                                    <el-input v-model="rootPath" clearable style="width: 480px;">
                                        <template #prepend>
                                            <el-button @click="rootSelect" :style="buttonStyle">Select</el-button>
                                        </template>
                                    </el-input>
                                </el-form-item>
                                <el-form-item label="Configuration">
                                    <el-select v-model="configPath" style="width: 480px" default-first-option>
                                        <el-option v-for=" config in configs " :label="extractFileName(config)"
                                            :value="config" />
                                    </el-select>
                                    <el-button :disabled="configPath.length === 0" type="primary" plain
                                        style="width: 40px; margin-left: 5px;"
                                        @click="() => taskAssignmentDisplay = true">
                                        <el-icon>
                                            <UserFilled />
                                        </el-icon>
                                    </el-button>
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
                                        <el-option v-for=" engine in engines " :key="engine" :label="engine"
                                            :value="engine" />
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="Custom Code">
                                    <el-button type="primary" @click="showCustomPanel" plain>Edit</el-button>
                                </el-form-item>
                                <el-form-item v-if="groupDev" label="Dev Folder">
                                    <el-input v-model="devDestinationPath" clearable style="width: 480px;">
                                        <template #prepend>
                                            <el-button :style="buttonStyle" type="primary" @click="devDestinationSelect"
                                                plain>Select</el-button>
                                        </template>
                                    </el-input>
                                </el-form-item>
                                <el-form-item v-if="groupQc" label="Qc Folder">
                                    <el-input v-model="qcDestinationPath" clearable style="width: 480px;">
                                        <template #prepend>
                                            <el-button :style="buttonStyle" type="primary" @click="qcDestinationSelect"
                                                plain>Select</el-button>
                                        </template>
                                    </el-input>
                                </el-form-item>
                                <el-form-item>
                                    <el-button :disabled="readyToSubmit()" type="primary" @click="submit"
                                        plain>Submit</el-button>
                                    <el-button @click="reset" plain>Reset</el-button>
                                </el-form-item>
                            </el-form>
                        </el-tab-pane>
                        <el-tab-pane label="Project Navigator" key="navigator" name="navigator">
                            <ProjectNavigator v-if="chosenProject"
                                :config="{ product: chosenProject.product, trail: chosenProject.trail, purpose: chosenProject.purpose, kind: projectKind }" />
                            <div v-else>Please select one project</div>
                        </el-tab-pane>
                    </el-tabs>

                </el-main>
            </el-container>
        </el-main>

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
    <el-drawer v-model="customCodePanelShow" title="Custom Code" size="1100px" destroy-on-close>
        <Template :kind="projectKind" @template-change="(template: TemplateSelected) => {
            templateSelected = template;
            customCodePanelShow = false;
        }" />
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
    <el-dialog v-model="showCreateProject" title="Create New Project" draggable>
        <el-form ref="ruleFormRef" label-width="auto" :model="newProject" :rules="createProjectRules">
            <el-form-item label="Product Code" prop="product">
                <el-autocomplete v-model="newProject.product" @change="(value: string) => {
                    newProject.product = value.toLowerCase();
                }" style="width: 90%;" :fetch-suggestions="productCodeSearch" clearable></el-autocomplete>
            </el-form-item>
            <el-form-item label="Trail Code" prop="trail">
                <el-autocomplete v-model="newProject.trail" style="width: 90%;" :fetch-suggestions="trailCodeSearch"
                    clearable />
            </el-form-item>
            <el-form-item label="Trail Type" prop="purpose">
                <el-autocomplete v-model="newProject.purpose" :fetch-suggestions="purposeSearch" style="width: 90%;"
                    clearable />
            </el-form-item>
            <el-form-item label="From" prop="from">
                <el-autocomplete v-model="newProject.from" :fetch-suggestions="fromSearch" style="width: 90%;"
                    clearable />
            </el-form-item>
            <el-form-item>
                <el-button @click="createNewProject(ruleFormRef)" style="margin-left: 98px;" type="primary"
                    plain>Create</el-button>
                <el-button @click="cancelCreateProject(ruleFormRef)" plain>Cancel</el-button>
            </el-form-item>
        </el-form>
    </el-dialog>
    <el-drawer destroy-on-close v-model="taskAssignmentDisplay" title="Task Assignment" size="1100px">
        <TaskAssignment :items="items.map(item => item.name)" @change-assignment="changeAssignemt" />
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