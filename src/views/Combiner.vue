<template>
    <el-main>
        <el-container>
            <div class="task-progress">
                <el-row>
                    <el-col :span="3">Task Progress</el-col>
                    <el-col :span="20">
                        <el-progress :percentage="taskPercentage" :status="taskStatus" :stroke-width="15" striped
                            striped-flow :duration="duration">
                        </el-progress>
                    </el-col>
                </el-row>
            </div>
        </el-container>
        <el-form ref="parametersRef" :model="parameters" :rules="rules" :label-position="labelPosition" label-width="100px">
            <el-form-item label="Cover" prop="cover">
                <el-col :span="2">
                    <el-button type="primary" v-on:click="selectCover">Select</el-button>
                </el-col>
                <el-col :span="20">
                    <el-input v-model="parameters.cover" placeholder="Select Cover" clearable />
                </el-col>
            </el-form-item>
            <el-form-item label="Directory" prop="directory" required>
                <el-col :span="2">
                    <el-button type="primary" v-on:click="selectDirectory">Select</el-button>
                </el-col>
                <el-col :span="20">
                    <el-input v-model="parameters.directory" placeholder="Select Directory" clearable />
                </el-col>
            </el-form-item>
            <el-form-item>
                <el-col :span="22">
                    <el-scrollbar height="300px" style="background-color: white;">
                        <el-card v-if="fileList.length > 0">
                            <div v-for="file in fileList">
                                {{ file }}
                            </div>
                        </el-card>
                    </el-scrollbar>
                </el-col>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="startCombine" v-if="startButtonVisible()" :disabled="combineNotReady"
                    style="width: 80px;">Start</el-button>
                <el-button type="primary" @click="stopCombine" v-if="cancelButtonVisible()"
                    style="width: 80px;">Cancel</el-button>
                <el-button type="primary" @click="combineFinished" v-if="finishedButtonVisible()"
                    style="width: 80px;">Finished</el-button>
                <el-button type="primary" @click="showDialog" style="width: 80px;">Detail</el-button>
            </el-form-item>
        </el-form>
    </el-main>
    <el-main>
    </el-main>
    <el-dialog v-model="dialogVisible" title="Details" width="70%" draggable>
        <div class="task-progress">
            <el-row>
                <el-col :span="1"></el-col>
                <el-col :span="3">Task Progress</el-col>
                <el-col :span="20">
                    <el-progress :percentage="taskPercentage" :status="taskStatus" :stroke-width="15" striped striped-flow
                        :duration="duration">
                    </el-progress>
                </el-col>
            </el-row>
            <div style="height: 10px;"></div>
            <el-row>
                <el-col :span="1"></el-col>
                <el-col :span="22">
                    <el-scrollbar ref="scrollbarRef" height="240px" always
                        style="background-color: #1f1b1b; color: #1affa3">
                        <div ref="innerRef">
                            <p v-for="log in logs" :key="log" class="scrollbar-demo-item">{{ log }}</p>
                        </div>
                    </el-scrollbar>
                </el-col>
                <el-col :span="1"></el-col>

            </el-row>
        </div>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogVisible = false">Close</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, reactive, computed, nextTick } from "vue"
import { invoke } from '@tauri-apps/api/tauri'
import { open } from '@tauri-apps/api/dialog'
import { readDir, BaseDirectory, FileEntry, exists } from '@tauri-apps/api/fs'
import { ElMessage, FormProps } from "element-plus"
import { debounce } from "lodash"
import type { FormInstance, FormRules, ElScrollbar } from 'element-plus'

enum Status {
    Idle,
    Runnable,
    Running,
    Finished
}

// let status = ref(Status.Idle)
let combineNotReady = computed(() => {
    return parameters.directory.length === 0
})

let fileList = ref([])
let totalFileCounts = ref(0)
let dialogVisible = ref(false)
let status = ref(Status.Idle)
let taskPercentage = ref(0)
let taskStatus = ref()
let logs = ref([])

// const scrollHeight = ref(0)
const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>()
const innerRef = ref()

const labelPosition = ref<FormProps['labelPosition']>('right')
let intervalId: number
const duration = computed(() => Math.floor(taskPercentage.value / 10))

const parameters = reactive({
    cover: '',
    directory: '',
})

let parametersRef = ref<FormInstance>()

const checkPath = (_: any, value: string, callback: any) => {
    if (value.length === 0) {
        return
    }
    exists(value).then(
        (res) => {
            if (!res) {
                callback(new Error(`path does not existed`))
            }
        },
        () => {
            callback(new Error(`path does not existed`))
        })
}

const rules = reactive<FormRules<typeof parameters>>({
    cover: [{ validator: checkPath, trigger: 'blur' }],
    directory: [{ validator: checkPath, trigger: 'blur' }],
})

async function setScrollToButtom() {
    await nextTick()
    const max = innerRef.value!.clientHeight
    scrollbarRef.value!.setScrollTop(max)
}

function showDialog() {
    dialogVisible.value = true
}

watch(() => parameters.directory, debounce(updateFileList, 100))

watch(taskPercentage, debounce(() => {
    if (taskPercentage.value === 100) {
        clearInterval(intervalId)
        taskStatus.value = "success"
        status.value = Status.Finished
    }
}, 100))

// logic for updating file list
async function updateFileList(path: string) {
    const tables: string[] = []
    const listings: string[] = []
    let entries: FileEntry[]
    if (path.length === 0) {
        fileList.value = tables as never[]
        return
    }
    try {
        entries = await readDir(path, { dir: BaseDirectory.AppData, recursive: false })
        entries.forEach(entry => {
            const f = entry.name
            if (f !== undefined && f.endsWith(".rtf")) {
                if (f.startsWith("T")) tables.push(f)
                else listings.push(f)
            }
            tables.sort((x, y) => x < y ? -1 : 1)
            listings.sort((x, y) => x < y ? -1 : 1)
        })
        fileList.value = tables.concat(listings) as never[]
        totalFileCounts.value = fileList.value.length
    } catch (error) {
        ElMessage({
            message: `failed to access directory "${path}" `,
            type: "error",
        })
    }
}

async function selectDirectory() {
    const directory = (await open({
        directory: true,
    })) as string;
    if (directory.length > 0) {
        parameters.directory = directory
    }
}

async function selectCover() {
    const directory = (await open({
        filters: [{ name: "PDF File", extensions: ['pdf'] }]
    })) as string
    if (directory.length > 0) {
        parameters.cover = directory
    }
}

function startCombine() {
    status.value = Status.Running
    dialogVisible.value = true
    intervalId = setInterval(async () => {
        if (taskPercentage.value < 100) {
            taskPercentage.value += 1
            taskPercentage.value < 100 ? logs.value.push(`[INFO][${(new Date()).toISOString()}] task is processing ...` as never) : logs.value.push(`[INFO][${(new Date()).toISOString()}] task completed.` as never)
            await setScrollToButtom()
        }
    }, 50)
}

function resetTaskProgress() {
    taskPercentage.value = 0
    taskStatus.value = ""
    logs.value = []
}



function startButtonVisible(): boolean {
    return status.value === Status.Idle
}

function cancelButtonVisible(): boolean {
    return status.value === Status.Running
}

function finishedButtonVisible(): boolean {
    return status.value == Status.Finished
}

function stopCombine() {
    clearInterval(intervalId)
    resetTaskProgress()
    status.value = Status.Finished
}

function combineFinished() {
    openCombineFile()
    resetTaskProgress()
    status.value = Status.Idle
}

async function openCombineFile() {
    const dir = await invoke("get_target_file_path", { "directory": parameters.directory })
    invoke("open_file", { "path": dir })
}

// async function getTargetFilePath(directory: string) {

// }

</script>


<style scoped>
.task-progress {
    margin-bottom: 15px;
    width: 100%;
}
</style>