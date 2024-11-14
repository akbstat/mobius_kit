<script lang="ts" setup>
import { ref } from 'vue';
import { Task } from '../../api/fusion/config';
import { open } from '@tauri-apps/api/dialog';

const closeEvent = "close";
const submitEvent = "submit";
const emit = defineEmits<{ (e: "submit", task: Task): void; (e: "close"): void }>();

const props = defineProps<{ task: Task }>();
const task = ref(props.task);
const langs = ["CN", "EN"];
const modes = ["PDF", "RTF"];

async function selectFile() {
    const path = (await open({
        filters: [{
            extensions: ['pdf'],
            name: ''
        }]
    })) as string;
    if (path !== null && path.length > 0) {
        task.value.cover = path;
    }
}

function submit() {
    // rtf mode then remove cover and language option
    if (task.value.mode === "RTF") {
        task.value.cover = "";
    }
    emit(submitEvent, task.value)
}

</script>

<template>
    <el-form label-width="auto">
        <el-form-item label="Filename">
            <el-input style="width: 100%;" v-model="task.name" clearable />
        </el-form-item>
        <el-form-item label="Language">
            <el-radio-group v-model="task.language" size="medium">
                <el-radio-button v-for="lang in langs" :label="lang" :value="lang">
                    <template #default>
                        <div style="width: 30px;">{{ lang }}</div>
                    </template>
                </el-radio-button>
            </el-radio-group>
        </el-form-item>
        <el-form-item label="Mode">
            <el-radio-group v-model="task.mode" size="medium">
                <el-radio-button v-for="mode in modes" :label="mode" :value="mode">
                    <template #default>
                        <div style="width: 30px;">{{ mode }}</div>
                    </template>
                </el-radio-button>
            </el-radio-group>
        </el-form-item>
        <el-form-item label="Cover">
            <el-input style="width: 100%;" v-model="task.cover" clearable>
                <template #append>
                    <el-button plain type="primary" @click="selectFile">
                        <el-icon>
                            <FolderOpened />
                        </el-icon>
                    </el-button>
                </template>
            </el-input>
        </el-form-item>
        <el-form-item>
            <div style="margin-top: 2%;">
                <el-button type="primary" plain @click="submit">
                    <el-icon>
                        <Select />
                    </el-icon>
                </el-button>
                <el-button type="danger" plain @click="() => { emit(closeEvent) }">
                    <el-icon>
                        <Close />
                    </el-icon>
                </el-button>
            </div>
        </el-form-item>
    </el-form>
</template>

<style scoped></style>