<script lang="ts" setup>
import { ArrowRight } from '@element-plus/icons-vue'
import { CascaderOption, CascaderPanelInstance, CascaderProps, ElMessage } from 'element-plus';
import { onMounted, Ref, ref } from 'vue';
import { listAllProjects } from '../api/inspector/inspector';
import { History, listHistories, removeHistories, saveHistory, saveNewProject } from "../api/project-context/context";
import { useProjectContext } from '../store/context';
import { storeToRefs } from 'pinia';

const { project } = storeToRefs(useProjectContext())
const props = defineProps<{ user: string }>();
const cascaderSelected: Ref<string[]> = ref([]);
const cascaderRef = ref<CascaderPanelInstance>();
const historyProject: Ref<History[]> = ref([]);
const cascaderDisplay = ref(false);
const createNewProjectDisplay = ref(false);
const newProject = ref({
    product: '',
    trial: '',
    purpose: ''
});
function click() {
    cascaderDisplay.value = true;
}
const options: Ref<CascaderOption[]> = ref([]);

const cascaderProps: CascaderProps = {
    expandTrigger: "hover",
    emitPath: true,
};

function closeNewProjectDialog() {
    createNewProjectDisplay.value = false;
    newProject.value = {
        product: '',
        trial: '',
        purpose: ''
    }
}

async function createNewProject() {
    const { product, trial, purpose } = Object.assign({}, newProject.value);
    const incomingProject = { product: product.trim().toLowerCase(), trial: trial.trim().toLowerCase(), purpose: purpose.trim().length > 0 ? purpose : undefined };
    try {
        await saveNewProject(incomingProject);
        await rebuildOptions();
    } catch (error) {
        ElMessage.error("Failed to create new project: " + error);
    }
    closeNewProjectDialog();
}


async function cascaderChange(value: string[]) {
    if (value && value.length === 3) {
        project.value = {
            product: value[0] as string,
            trial: value[1] as string,
            purpose: value[2] as string,
        };
        const { product, trial, purpose } = project.value;
        historyProject.value = await saveHistory({
            user: props.user,
            product, trial, purpose
        });
    }
}

async function switchFromHistory(history: { product: string, trial: string, purpose: string }) {
    cascaderRef.value?.clearCheckedNodes();
    project.value = history;
    const { product, trial, purpose } = project.value;
    historyProject.value = await saveHistory({
        user: props.user,
        product, trial, purpose
    });
}

async function removeOneHistory(id: number) {
    historyProject.value = await removeHistories(props.user, [id]);
}

async function removeAllHistories() {
    const ids = historyProject.value.map(p => p.id as number);
    historyProject.value = await removeHistories(props.user, ids);
}


async function rebuildOptions() {
    const projects = await listAllProjects();
    const opts: CascaderOption[] = [];
    for (const product of projects) {
        const productOpt: CascaderOption = {
            value: product.name,
            label: product.name,
            children: [],
        };
        for (const trial of product.trials) {
            const trialOpt: CascaderOption = {
                value: trial.name,
                label: trial.name,
                children: [],
            };
            for (const purpose of trial.purposes) {
                const purposeOpt: CascaderOption = {
                    value: purpose.name,
                    label: purpose.name,
                };
                trialOpt.children?.push(purposeOpt);
            }
            productOpt.children?.push(trialOpt);
        }
        opts.push(productOpt);
    }
    historyProject.value = await listHistories(props.user);
    if (historyProject.value.length > 0) {
        const { product, trial, purpose } = historyProject.value[0];
        project.value = { product, trial, purpose }
    }
    options.value = opts;
}

onMounted(async () => {
    await rebuildOptions();
});
</script>

<template>
    <div class="project-context">
        <el-popover style="width: fit-content" width="auto">
            <template #reference>
                <el-button @click="click" size="small" type="primary" text>
                    <el-icon>
                        <MapLocation />
                    </el-icon>
                </el-button>
            </template>
            <div class="pop-content">
                <div v-if="historyProject.length > 0">
                    <div>
                        <el-scrollbar height="425px" style="width: 270px; padding: 0px;">
                            <div v-for="project in historyProject">
                                <el-button @click="() => { if (project.id) { removeOneHistory(project.id) } }"
                                    type="danger" size="small" text>
                                    <el-icon>
                                        <Delete />
                                    </el-icon>
                                </el-button>
                                <el-button @click="() => { switchFromHistory(project) }" type="primary" plain
                                    class="history-button" size="small">
                                    <el-breadcrumb :separator-icon="ArrowRight">
                                        <el-breadcrumb-item>{{ project.product }}</el-breadcrumb-item>
                                        <el-breadcrumb-item>{{ project.trial }}</el-breadcrumb-item>
                                        <el-breadcrumb-item>{{ project.purpose }}</el-breadcrumb-item>
                                    </el-breadcrumb>
                                </el-button>
                            </div>
                        </el-scrollbar>
                    </div>
                    <div style="margin-top: 5px; display: flex; justify-content: right;">
                        <el-button @click="removeAllHistories" style="width: 120px;" size="small" type="danger" plain>
                            <el-icon>
                                <Delete />
                            </el-icon>
                        </el-button>
                        <el-button @click="createNewProjectDisplay = true" style="width: 120px;margin-right: 15px;"
                            size="small" type="primary" plain>
                            <el-icon>
                                <DocumentAdd />
                            </el-icon>
                        </el-button>
                    </div>
                </div>
                <el-cascader-panel @change="cascaderChange" ref="cascaderRef" class="height-custom"
                    v-model="cascaderSelected" :options="options" :props="cascaderProps" />
            </div>
        </el-popover>
        <el-breadcrumb v-if="project" :separator-icon="ArrowRight">
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
        <el-dialog v-model="createNewProjectDisplay" title="Create New Project">
            <el-form label-width="auto">
                <el-form-item required label="Product">
                    <el-input v-model="newProject.product" />
                </el-form-item>
                <el-form-item required label="Trial">
                    <el-input v-model="newProject.trial" />
                </el-form-item>
                <el-form-item label="Purpose">
                    <el-input v-model="newProject.purpose" />
                </el-form-item>
                <el-form-item>
                    <el-button @click="createNewProject" type="primary" plain>
                        <el-icon>
                            <Check />
                        </el-icon>
                    </el-button>
                    <el-button @click="closeNewProjectDialog" type="danger" plain>
                        <el-icon>
                            <Close />
                        </el-icon>
                    </el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>



<style scoped>
.history-button {
    width: 220px;
    justify-content: left;
    margin: 0 0 1px 1px;
}

:deep(.history-button .el-breadcrumb__inner) {
    color: var(--el-color-primary-light-1);
}

.project-context {
    display: flex;
}

.project-context .el-breadcrumb {
    margin: 6px 0 0 6px;
}

.project-context .breadcrumb-span {
    color: #409EFF;
}

.pop-content {
    display: flex;
}

:deep(.el-cascader-menu__wrap.el-scrollbar__wrap) {
    height: 450px !important;
}
</style>