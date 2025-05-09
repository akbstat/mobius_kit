<script lang="ts" setup>
import { ArrowRight } from '@element-plus/icons-vue'
import { CascaderOption, CascaderPanelInstance, CascaderProps } from 'element-plus';
import { onMounted, Ref, ref } from 'vue';
import { listAllProjects } from '../api/inspector/inspector';
import { History, listHistories, removeHistories, saveHistory } from "../api/project-context/context";
import { useProjectContext } from '../store/context';
import { storeToRefs } from 'pinia';

const { project } = storeToRefs(useProjectContext())
const props = defineProps<{ user: string }>();
const cascaderSelected: Ref<string[]> = ref([]);
const cascaderRef = ref<CascaderPanelInstance>();
const historyProject: Ref<History[]> = ref([]);
const cascaderDisplay = ref(false);
function click() {
    cascaderDisplay.value = true;
}
const options: Ref<CascaderOption[]> = ref([]);

const cascaderProps: CascaderProps = {
    expandTrigger: "hover",
    emitPath: true,
};

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

onMounted(async () => {
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
                        <el-button @click="removeAllHistories" style="width: 220px;margin-right: 15px;" size="small"
                            type="danger" plain>
                            <el-icon>
                                <Delete />
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