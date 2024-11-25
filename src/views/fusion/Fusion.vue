<script lang="ts" setup>
import { onMounted, Ref, ref } from 'vue';
import { Rtf, listRtfsWithTitle } from '../../api/fusion/top';
import { ConfigRecord, findConfig, FusionConfig, saveConfig, Task, File } from '../../api/fusion/config';
import { ElMessage } from 'element-plus';
import { GeneralConfig } from './fusion';
import { runFusionTask } from '../../api/fusion/fusion';
import { openFile } from '../../api/utils/directory';
import { useFusion } from '../../store/fusion';
import Config from "./Config.vue";
import NewTask from './NewTask.vue';
import AppendOutput from './AppendOutput.vue';
import UpdateTaskConfig from './UpdateTaskConfig.vue';
import RemoveConfirm from './RemoveConfirm.vue';
import FusionProgress from './FusionProgress.vue';
import SaveConfig from './SaveConfig.vue';
import { storeToRefs } from 'pinia';

const cleanAllTaskDisplay = ref(false);
const saveConfigDisplay = ref(false);
const configDrawerDisplay = ref(false);
const rtfs: Ref<Rtf[]> = ref([]);
const newTaskDisplay = ref(false);
const appendOutputDisplay = ref(false);
const updateTaskConfigDisplay = ref(false);
const activeTaskIndex = ref(0);
const activeOutputIndex = ref(0);
const removeTaskConfirmMessage = ref("");
const removeOutputConfirmMessage = ref("");
const removeTaskConfirmDisplay = ref(false);
const removeOutputConfirmDisplay = ref(false);
const fusionProgressDisplay = ref(false);
const config: Ref<{ id: string | null, name: string }> = ref({ id: null, name: "" });

const { fusionConfig, previousTaskStartTime } = storeToRefs(useFusion());

function showConfigDrawer() {
    configDrawerDisplay.value = true;
}

function isGeneralConfigNNotDone(): boolean {
    const config = fusionConfig.value;
    if (config.destination.length === 0 || config.source.length === 0 || config.top.length === 0) {
        return true;
    }
    return false;
}

function move(index: number, up: boolean) {
    const outputs = fusionConfig.value.tasks[activeTaskIndex.value].files;
    if (up && index > 0) {
        [outputs[index], outputs[index - 1]] = [outputs[index - 1], outputs[index]]
    } else if (!up && index < outputs.length - 1) {
        [outputs[index], outputs[index + 1]] = [outputs[index + 1], outputs[index]]
    }
    fusionConfig.value.tasks[activeTaskIndex.value].files = outputs;
}

function removeOutput(index: number) {
    const outputs = fusionConfig.value.tasks[activeTaskIndex.value].files;
    if (index > -1 && index < outputs.length) {
        outputs.splice(index, 1);
        fusionConfig.value.tasks[activeTaskIndex.value].files = outputs;
    }
}

function createTask(task: Task) {
    fusionConfig.value.tasks.push(task);
    activeTaskIndex.value = fusionConfig.value.tasks.length - 1;
    newTaskDisplay.value = false;
}

function createTaskWithAllOutput() {
    const task: Task = {
        name: 'all outputs',
        language: 'CN',
        cover: null,
        destination: fusionConfig.value.destination,
        mode: 'PDF',
        files: rtfs.value.map(output => {
            let file: File = {
                title: output.title,
                path: `${fusionConfig.value.source}\\${output.name}`,
                filename: output.name,
                size: 0,
            };
            return file;
        }),
        tocHeaders: ["", "", "", ""],
    };
    fusionConfig.value.tasks.push(task);
    activeTaskIndex.value = fusionConfig.value.tasks.length - 1;
}

function removeTask(index: number) {
    if (index > -1 && index < fusionConfig.value.tasks.length) {
        fusionConfig.value.tasks.splice(index, 1);
    }
}

function removeAllTask(confirm: boolean) {
    if (confirm) {
        fusionConfig.value.tasks = [];
    }
    cleanAllTaskDisplay.value = false;
}

async function submitAllTask() {
    await run(fusionConfig.value);
}

async function submitOneTask(index: number) {
    const { id, source, destination, top, tasks } = fusionConfig.value;
    const config = { id, source, destination, top, tasks: [tasks[index]] };
    await run(config);
}

async function run(config: FusionConfig) {
    if (previousTaskStartTime.value > 0) {
        ElMessage.error("Legacy tasks are running, please wait or cancel them manually");
    } else {
        previousTaskStartTime.value = (new Date()).valueOf();
        await runFusionTask(config);
    }
    fusionProgressDisplay.value = true;
}

async function saveFusionConfig(id: string | null, name: string, config: FusionConfig) {
    try {
        let return_id = await saveConfig(id, name, config);
        fusionConfig.value.id = return_id;
        ElMessage.success("Save configuration successfully");
    } catch (error) {
        ElMessage.error(`Failed to save configuration: ${error}`);
    }
}

async function configSubmit(cfg: GeneralConfig, configRecord: ConfigRecord | null) {
    let { source, destination, top } = cfg;
    if (configRecord) {
        let { id, name } = configRecord;
        config.value.id = id;
        config.value.name = name;
        fusionConfig.value.id = id;
        fusionConfig.value.tasks = (await findConfig(id)).tasks;
    } else {
        fusionConfig.value = {
            id: null,
            source: "",
            destination: "",
            top: "",
            tasks: [],
        };
    }
    activeTaskIndex.value = 0;
    fusionConfig.value.source = source;
    fusionConfig.value.destination = destination;
    // update destinations
    fusionConfig.value.tasks.forEach((task) => {
        task.destination = destination;
    });
    fusionConfig.value.top = top;
    configDrawerDisplay.value = false;
    rtfs.value = await listRtfsWithTitle(source, top);
}

async function saveConfigSumit(saveAs: boolean, name: string) {
    const id = saveAs ? null : config.value.id;
    config.value.name = name;
    await saveFusionConfig(id, name, fusionConfig.value);
    saveConfigDisplay.value = false;
}

async function readCombineFile(task: Task) {
    try {
        const destination = `${task.destination}\\${task.name}.${task.mode.toLowerCase()}`;
        await openFile(destination);
    } catch (error) {
        ElMessage.error(`Failed to open ${task.name}: ${error}`)
    }
}

onMounted(async () => {
    let { source, top } = fusionConfig.value;
    if (source.length > 0 && top.length > 0) {
        rtfs.value = await listRtfsWithTitle(source, top);
    }
})

</script>


<template>
    <el-container>
        <el-header style="padding: 5px 0 5px 5px; height: auto;">
            <el-tag size="large" style="width: 557px; margin-right: 2px;">{{ fusionConfig.tasks.length > 0
                ? `Task: ${fusionConfig.tasks[activeTaskIndex].name}` : "No Task" }}
            </el-tag>
            <el-tag size="large" style="width: 100px; margin-right: 5px;">
                Output: {{ fusionConfig.tasks.length > 0 ? fusionConfig.tasks[activeTaskIndex].files.length : 0 }}
            </el-tag>
            <div style="float: right; margin-right: 5px;">
                <el-tooltip content="Quick Creation">
                    <el-button :disabled="isGeneralConfigNNotDone()" class="top-buttom" type="warning" plain
                        @click="createTaskWithAllOutput">
                        <el-icon>
                            <FolderAdd />
                        </el-icon>
                    </el-button>
                </el-tooltip>
                <el-tooltip content="Remove All Task">
                    <el-button :disabled="isGeneralConfigNNotDone()" class="top-buttom" type="danger" plain
                        @click="() => { cleanAllTaskDisplay = true }">
                        <el-icon>
                            <Delete />
                        </el-icon>
                    </el-button>
                </el-tooltip>
                <el-tooltip content="Environment Configuration">
                    <el-button class="top-buttom" type="primary" plain @click="showConfigDrawer">
                        <el-icon>
                            <Setting />
                        </el-icon>
                    </el-button>
                </el-tooltip>
                <el-tooltip content="Save Task Configuration">
                    <el-button :disabled="isGeneralConfigNNotDone()" class="top-buttom" type="primary" plain
                        @click="() => { saveConfigDisplay = true }">
                        <el-icon>
                            <CollectionTag />
                        </el-icon>
                    </el-button>
                </el-tooltip>
                <el-tooltip content="Run All Tasks">
                    <el-button :disabled="isGeneralConfigNNotDone()" class="top-buttom" type="primary" plain
                        @click="submitAllTask">
                        <el-icon>
                            <CaretRight />
                        </el-icon>
                    </el-button>
                </el-tooltip>
            </div>
        </el-header>
        <el-container>
            <el-aside width="60%" style="padding-left: 5px;">
                <el-table height="615" show-overflow-tooltip
                    :data="fusionConfig.tasks.length > 0 ? fusionConfig.tasks[activeTaskIndex].files : []">
                    <el-table-column width="265px" prop="filename" label="Filename" />
                    <el-table-column width="265px" prop="title" label="Title" />
                    <el-table-column width="130px">
                        <template #header>
                            <el-tooltip content="Append Output to Task">
                                <el-button :disabled="fusionConfig.tasks.length === 0" type="primary" size="small"
                                    style="float: right;width: 25px; margin-right: 7px;" text
                                    @click="() => { appendOutputDisplay = true; }">
                                    <el-icon size="18px">
                                        <DocumentAdd />
                                    </el-icon>
                                </el-button>
                            </el-tooltip>
                        </template>
                        <template #default="scope">
                            <el-tooltip content="Move Output Up">
                                <el-button style="width: 25px;" size="small" text
                                    @click="() => { move(scope.$index, true) }">
                                    <el-icon>
                                        <CaretTop />
                                    </el-icon>
                                </el-button>
                            </el-tooltip>
                            <el-tooltip content="Move Output Down">
                                <el-button style="width: 25px;" size="small" text
                                    @click="() => { move(scope.$index, false) }">
                                    <el-icon>
                                        <CaretBottom />
                                    </el-icon>
                                </el-button>
                            </el-tooltip>
                            <el-tooltip content="Remove Output From Task">
                                <el-button type="danger" style="width: 25px;" size="small" text @click="() => {
                                    activeOutputIndex = scope.$index;
                                    removeOutputConfirmMessage = `Remove ${scope.row.title}?`;
                                    removeOutputConfirmDisplay = true;
                                }">
                                    <el-icon>
                                        <Delete />
                                    </el-icon>
                                </el-button>
                            </el-tooltip>
                        </template>
                    </el-table-column>
                </el-table>
            </el-aside>
            <el-main style="padding: 0 5px 5px 5px;">
                <el-scrollbar height="613px" max-height="613px">
                    <el-tooltip content="Build Custom Task">
                        <el-button :disabled="isGeneralConfigNNotDone()" type="warning"
                            style="width: 100%; height: 40px; margin-bottom: 2px;" @click="newTaskDisplay = true" plain>
                            <template #default>
                                <el-icon>
                                    <Plus />
                                </el-icon>
                            </template>
                        </el-button>
                    </el-tooltip>
                    <el-tag :type="index === activeTaskIndex ? '' : 'info'" class="task-tag"
                        v-for="(task, index) in fusionConfig.tasks" :key="index"
                        @click="() => { activeTaskIndex = index }">
                        <template #default>
                            <div style="width: 400px;">
                                <el-row>
                                    <el-col :span="20">
                                        <div style="color: #ffffff;padding-left: 1%; padding-top: 2%;">
                                            <span>{{ task.name }}</span>
                                        </div>
                                    </el-col>
                                    <el-col :span="4">
                                        <el-tooltip content="Open Combined File">
                                            <el-button class="task-button" plain size="small" type="success" text
                                                @click="readCombineFile(task)">
                                                <el-icon>
                                                    <Reading />
                                                </el-icon>
                                            </el-button>
                                        </el-tooltip>
                                        <el-tooltip content="Update Task Configuration">
                                            <el-button type="info" class="task-button" plain size="small" text @click="() => {
                                                activeTaskIndex = index;
                                                updateTaskConfigDisplay = true;
                                            }">
                                                <el-icon>
                                                    <Setting />
                                                </el-icon>
                                            </el-button>
                                        </el-tooltip>
                                    </el-col>
                                </el-row>
                            </div>
                            <div style="margin-top: 2%;">
                                <el-row>
                                    <el-col :span="20">
                                        <el-tag class="task-hint">{{ task.mode }}</el-tag>
                                        <el-tag class="task-hint" v-if="task.mode === 'PDF'">
                                            {{ task.language }}
                                        </el-tag>
                                        <el-tag class="task-hint" v-if="task.cover">
                                            <el-icon>
                                                <Notebook />
                                            </el-icon>
                                        </el-tag>
                                    </el-col>
                                    <el-col :span="4">
                                        <el-tooltip content="Run Task">
                                            <el-button class="task-button" plain size="small" type="primary" text
                                                @click="() => submitOneTask(index)">
                                                <el-icon>
                                                    <VideoPlay />
                                                </el-icon>
                                            </el-button>
                                        </el-tooltip>
                                        <el-tooltip content="Remove Task">
                                            <el-button class="task-button" plain size="small" type="danger" text @click="() => {
                                                activeTaskIndex = index;
                                                removeTaskConfirmDisplay = true;
                                                removeTaskConfirmMessage = `Remove Task ${task.name}?`
                                            }">
                                                <el-icon>
                                                    <Delete />
                                                </el-icon>
                                            </el-button>
                                        </el-tooltip>
                                    </el-col>
                                </el-row>
                            </div>
                        </template>
                    </el-tag>
                </el-scrollbar>
            </el-main>
        </el-container>
    </el-container>
    <el-drawer destroy-on-close size="50%" v-model="configDrawerDisplay" title="Configuration">
        <Config :source="fusionConfig.source" :destination="fusionConfig.destination" :top="fusionConfig.top"
            @submit="configSubmit" @close="() => { configDrawerDisplay = false; }" />
    </el-drawer>
    <el-dialog draggable destroy-on-close width="95%" v-model="newTaskDisplay" title="Create Task">
        <NewTask @submit="createTask" @close="() => { newTaskDisplay = false }"
            :config="{ source: fusionConfig.source, destination: fusionConfig.destination, top: fusionConfig.top }" />
    </el-dialog>
    <el-dialog draggable destroy-on-close width="81%" v-model="appendOutputDisplay" title="Append Outputs">
        <AppendOutput :task="fusionConfig.tasks[activeTaskIndex]"
            :config="{ source: fusionConfig.source, destination: fusionConfig.destination, top: fusionConfig.top }"
            @submit="(outputs) => {
                outputs.forEach(output => fusionConfig.tasks[activeTaskIndex].files.push(output));
                appendOutputDisplay = false;
            }" @close="() => { appendOutputDisplay = false; }" />
    </el-dialog>
    <el-dialog draggable destroy-on-close width="60%" v-model="updateTaskConfigDisplay"
        title="Update Task Configuration">
        <UpdateTaskConfig :task="fusionConfig.tasks[activeTaskIndex]" @submit="task => {
            const { name, language, mode, cover } = task;
            fusionConfig.tasks[activeTaskIndex].name = name;
            fusionConfig.tasks[activeTaskIndex].language = language;
            fusionConfig.tasks[activeTaskIndex].mode = mode;
            fusionConfig.tasks[activeTaskIndex].cover = cover;
            updateTaskConfigDisplay = false;
        }" @close="() => { updateTaskConfigDisplay = false; }" />
    </el-dialog>
    <el-dialog width="60%" draggable destroy-on-close v-model="removeTaskConfirmDisplay" title="Remove Task Confirm">
        <RemoveConfirm :target="fusionConfig.tasks.length > 0 ? fusionConfig.tasks[activeTaskIndex].name : ''" @close="(confirm) => {
            if (confirm) {
                removeTask(activeTaskIndex);
            }
            removeTaskConfirmDisplay = false;
            activeTaskIndex = 0;
        }" />
    </el-dialog>
    <el-dialog width="60%" draggable destroy-on-close v-model="removeOutputConfirmDisplay"
        title="Remove Output Confirm">
        <RemoveConfirm
            :target="fusionConfig.tasks.length > 0 && fusionConfig.tasks[activeTaskIndex].files.length > 0 ? fusionConfig.tasks[activeTaskIndex].files[activeOutputIndex].title : ''"
            @close="(confirm) => {
                if (confirm) {
                    removeOutput(activeOutputIndex);
                }
                removeOutputConfirmDisplay = false;
                activeOutputIndex = 0;
            }" />
    </el-dialog>
    <el-dialog title="Save Configuration" draggable destroy-on-close v-model="saveConfigDisplay">
        <SaveConfig :name="config.name" @submit="saveConfigSumit" @close="() => saveConfigDisplay = false" />
    </el-dialog>
    <el-dialog v-model="cleanAllTaskDisplay" title="Remove All Tasks?">
        <el-button type="primary" plain @click="() => { removeAllTask(true) }">
            <el-icon>
                <Select />
            </el-icon>
        </el-button>
        <el-button type="danger" plain @click="() => { removeAllTask(false) }">
            <el-icon>
                <Close />
            </el-icon>
        </el-button>
    </el-dialog>
    <el-dialog top="5vh" title="Task Progress" v-model="fusionProgressDisplay" width="75%" draggable destroy-on-close>
        <FusionProgress :previous-task-start-time="previousTaskStartTime" @close="(isCancelled: boolean) => {
            fusionProgressDisplay = false;
            previousTaskStartTime = 0;
            if (isCancelled) {
                ElMessage.error('Execution has been cancelled');
            } else {
                ElMessage.success('Execution Completed');
            }
        }" />
    </el-dialog>
</template>

<style scoped>
.top-buttom {
    margin-left: 3px;
    width: 50px;
}

.task-tag {
    width: 100%;
    height: 80px;
    margin-bottom: 2px;
    padding: 0;
}


.task-button {
    width: 20px;
}
</style>