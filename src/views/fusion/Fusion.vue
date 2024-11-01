<script lang="ts" setup>
import { onMounted, reactive, Ref, ref, watch } from 'vue';
import Config from "./Config.vue";
import NewTask from './NewTask.vue';
import { Config as Configuration } from "./fusion";
import { debounce } from 'lodash';
import { Rtf, listRtfsWithTitle } from '../../api/fusion/fusion';
import { openDirectory } from '../../api/utils/directory';
import { Task } from './fusion';
import AppendOutput from './AppendOutput.vue';
import UpdateTaskConfig from './UpdateTaskConfig.vue';
import RemoveConfirm from './RemoveConfirm.vue';
import { ElMessage } from 'element-plus';



const configDrawerDisplay = ref(false);
const config: Configuration = reactive({ top: { filename: "", path: "" }, output: "", destination: "" });
const rtfs: Ref<Rtf[]> = ref([]);
const tasks: Ref<Task[]> = ref([]);
const newTaskDisplay = ref(false);
const appendOutputDisplay = ref(false);
const updateTaskConfigDisplay = ref(false);
const activeTaskIndex = ref(0);
const activeOutputIndex = ref(0);
const removeTaskConfirmMessage = ref("");
const removeOutputConfirmMessage = ref("");
const removeTaskConfirmDisplay = ref(false);
const removeOutputConfirmDisplay = ref(false);


function showConfigDrawer() {
    configDrawerDisplay.value = true;
}

function move(index: number, up: boolean) {
    const outputs = tasks.value[activeTaskIndex.value].files;
    if (up && index > 0) {
        [outputs[index], outputs[index - 1]] = [outputs[index - 1], outputs[index]]
    } else if (!up && index < outputs.length - 1) {
        [outputs[index], outputs[index + 1]] = [outputs[index + 1], outputs[index]]
    }
    tasks.value[activeTaskIndex.value].files = outputs;
}

function removeOutput(index: number) {
    const outputs = tasks.value[activeTaskIndex.value].files;
    if (index > -1 && index < outputs.length) {
        outputs.splice(index, 1);
        tasks.value[activeTaskIndex.value].files = outputs;
    }
}

function createTask(task: Task) {
    tasks.value.push(task);
    activeTaskIndex.value = tasks.value.length - 1;
    newTaskDisplay.value = false;
}

function removeTask(index: number) {
    if (index > -1 && index < tasks.value.length) {
        tasks.value.splice(index, 1);
    }
}

async function openDestination() {
    const destination = config.destination;
    if (destination.length === 0) {
        return
    }
    try {
        await openDirectory(config.destination)
    } catch (error) {
        ElMessage.error(`Failed to open destination: ${error}`)
    }
}

async function submitAllTask() {
    console.log(tasks.value);
}

async function submitOneTask(index: number) {
    console.log(tasks.value[index]);
}

watch(() => config.output, debounce(async () => {
    rtfs.value = await listRtfsWithTitle(config.output, config.top.path);
}, 100))

onMounted(async () => {
    rtfs.value = await listRtfsWithTitle(config.output, config.top.path);
})

</script>


<template>
    <el-container>
        <el-header style="padding: 5px 0 5px 5px; height: auto;">
            <el-tag size="large" style="width: 557px; margin-right: 2px;">{{ tasks.length > 0
                ? `Task: ${tasks[activeTaskIndex].name}` : "No Task" }}
            </el-tag>
            <el-tag size="large" style="width: 100px; margin-right: 5px;">
                Output: {{ tasks.length > 0 ? tasks[activeTaskIndex].files.length : 0 }}
            </el-tag>
            <div style="float: right; margin-right: 5px;">
                <el-button class="top-buttom" type="primary" plain @click="showConfigDrawer">
                    <el-icon>
                        <Setting />
                    </el-icon>
                </el-button>
                <el-button class="top-buttom" type="primary" plain @click="openDestination">
                    <el-icon>
                        <FolderOpened />
                    </el-icon>
                </el-button>
                <el-button class="top-buttom" type="primary" plain @click="submitAllTask">
                    <el-icon>
                        <CaretRight />
                    </el-icon>
                </el-button>
            </div>
        </el-header>
        <el-container>
            <el-aside width="60%" style="padding-left: 5px;">
                <el-table height="615" show-overflow-tooltip
                    :data="tasks.length > 0 ? tasks[activeTaskIndex].files : []">
                    <el-table-column width="265px" prop="filename" label="Filename" />
                    <el-table-column width="265px" prop="title" label="Title" />
                    <el-table-column width="130px">
                        <template #header>
                            <el-button :disabled="tasks.length === 0" type="primary" size="small"
                                style="float: right;width: 25px; margin-right: 7px;" text
                                @click="() => { appendOutputDisplay = true; }">
                                <el-icon size="18px">
                                    <DocumentAdd />
                                </el-icon>
                            </el-button>
                        </template>
                        <template #default="scope">
                            <el-button style="width: 25px;" size="small" text
                                @click="() => { move(scope.$index, true) }">
                                <el-icon>
                                    <CaretTop />
                                </el-icon>
                            </el-button>
                            <el-button style="width: 25px;" size="small" text
                                @click="() => { move(scope.$index, false) }">
                                <el-icon>
                                    <CaretBottom />
                                </el-icon>
                            </el-button>
                            <el-button type="danger" style="width: 25px;" size="small" text @click="() => {
                                activeOutputIndex = scope.$index;
                                removeOutputConfirmMessage = `Remove ${scope.row.title}?`;
                                removeOutputConfirmDisplay = true;
                            }">
                                <el-icon>
                                    <Delete />
                                </el-icon>
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-aside>
            <el-main style="padding: 0 5px 5px 5px;">
                <el-scrollbar height="613px" max-height="613px">
                    <el-tag type="warning" style="width: 100%; height: 40px; margin-bottom: 2px;"
                        @click="newTaskDisplay = true">
                        <template #default>
                            <el-icon>
                                <Plus />
                            </el-icon>
                        </template>
                    </el-tag>
                    <el-tag :type="index === activeTaskIndex ? 'primary' : 'info'" class="task-tag"
                        v-for="(task, index) in tasks" :key="index" @click="() => { activeTaskIndex = index }">
                        <template #default>
                            <div style="width: 400px;">
                                <el-row>
                                    <el-col :span="20">
                                        <div style="color: #ffffff;padding-left: 1%; padding-top: 2%;">
                                            <span>{{ task.name }}</span>
                                        </div>
                                    </el-col>
                                    <el-col :span="4">
                                        <el-button class="task-button" plain size="small" type="success" text>
                                            <el-icon>
                                                <Reading />
                                            </el-icon>
                                        </el-button>
                                        <el-button type="info" class="task-button" plain size="small" text @click="() => {
                                            activeTaskIndex = index;
                                            updateTaskConfigDisplay = true;
                                        }">
                                            <el-icon>
                                                <Setting />
                                            </el-icon>
                                        </el-button>
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
                                        <el-button class="task-button" plain size="small" type="primary" text
                                            @click="() => submitOneTask(index)">
                                            <el-icon>
                                                <VideoPlay />
                                            </el-icon>
                                        </el-button>
                                        <el-button class="task-button" plain size="small" type="danger" text @click="() => {
                                            activeTaskIndex = index;
                                            removeTaskConfirmDisplay = true;
                                            removeTaskConfirmMessage = `Remove Task ${task.name}?`
                                        }">
                                            <el-icon>
                                                <Delete />
                                            </el-icon>
                                        </el-button>
                                    </el-col>
                                </el-row>
                            </div>
                        </template>
                    </el-tag>
                </el-scrollbar>
            </el-main>
        </el-container>
    </el-container>
    <el-drawer size="50%" v-model="configDrawerDisplay" title="Configuration">
        <Config @submit="(data) => {
            config.output = data.output;
            config.top = data.top;
            config.destination = data.destination;
            configDrawerDisplay = false;
        }" @close="() => { configDrawerDisplay = false; }" />
    </el-drawer>
    <el-dialog draggable destroy-on-close width="95%" v-model="newTaskDisplay" title="Create Task">
        <NewTask @submit="createTask" @close="() => { newTaskDisplay = false }" :config="config" />
    </el-dialog>
    <el-dialog draggable destroy-on-close width="81%" v-model="appendOutputDisplay" title="Append Outputs">
        <AppendOutput :task="tasks[activeTaskIndex]" :config="config" @submit="(outputs) => {
            outputs.forEach(output => tasks[activeTaskIndex].files.push(output));
            appendOutputDisplay = false;
        }" @close="() => { appendOutputDisplay = false; }" />
    </el-dialog>
    <el-dialog draggable destroy-on-close width="60%" v-model="updateTaskConfigDisplay"
        title="Update Task Configuration">
        <UpdateTaskConfig :task="tasks[activeTaskIndex]" @submit="task => {
            const { name, language, mode, cover } = task;
            tasks[activeTaskIndex].name = name;
            tasks[activeTaskIndex].language = language;
            tasks[activeTaskIndex].mode = mode;
            tasks[activeTaskIndex].cover = cover;
            updateTaskConfigDisplay = false;
        }" @close="() => { updateTaskConfigDisplay = false; }" />
    </el-dialog>
    <el-dialog width="60%" draggable destroy-on-close v-model="removeTaskConfirmDisplay" title="Remove Task Confirm">
        <RemoveConfirm :target="tasks.length > 0 ? tasks[activeTaskIndex].name : ''" @close="(confirm) => {
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
            :target="tasks.length > 0 && tasks[activeTaskIndex].files.length > 0 ? tasks[activeTaskIndex].files[activeOutputIndex].title : ''"
            @close="(confirm) => {
                if (confirm) {
                    removeOutput(activeOutputIndex);
                }
                removeOutputConfirmDisplay = false;
                activeOutputIndex = 0;
            }" />
    </el-dialog>
</template>

<style scoped>
.top-buttom {
    margin-left: 3px;
}

.task-tag {
    width: 100%;
    height: 80px;
    margin-bottom: 2px;
    padding: 0;
}

/* .task-hint {
    border: none;
} */

.task-button {
    width: 20px;
}
</style>