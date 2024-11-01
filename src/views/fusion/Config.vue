<script lang="ts" setup>
import { reactive, Ref, ref, watch } from 'vue';
import { open } from '@tauri-apps/api/dialog';
import { configInfer } from '../../api/fusion/fusion';
import { debounce } from 'lodash';
import { Config, Top } from './config';

const emit = defineEmits<{
    (e: "submit", config: Config): void;
    (e: "close"): void;
}>();
const config = reactive({
    top: { filename: "", path: "" },
    output: "",
    destination: "",
});
const tops: Ref<Top[]> = ref([]);
const topSelected: Ref<number | null> = ref(null);

function submit() {
    emit("submit", config);
}

function close() {
    emit("close");
}



async function selectDirectory(): Promise<string> {
    return (await open({
        directory: true,
    })) as string;
}

async function selectOutput() {
    const dir = await selectDirectory();
    if (dir.length > 0) {
        config.output = dir;
    }
}

async function selectDestination() {
    config.destination = await selectDirectory();
}

async function outputChange(output: string) {
    if (output.length > 0) {
        const inferConfig = await configInfer(output);
        tops.value = inferConfig.top;
        tops.value.sort((x, y) => x.filename < y.filename ? 1 : -1);
        if (config.destination.length === 0) {
            config.destination = inferConfig.destination;
        }
        if (config.top.path.length === 0) {
            config.top = tops.value[0];
            topSelected.value = 0;
        }
    }
}

watch(() => config.output, debounce(async () => {
    await outputChange(config.output)
}, 100))


</script>

<template>
    <el-form label-width="auto">
        <el-form-item label="Output">
            <el-input v-model="config.output" style="width: 100%;">
                <template #append>
                    <el-button plain type="primary" @click="selectOutput">
                        <el-icon>
                            <FolderOpened />
                        </el-icon>
                    </el-button>
                </template>
            </el-input>
        </el-form-item>
        <el-form-item label="Top">
            <el-select v-model="topSelected" style="width: 87%;"
                @change="(index: number) => { config.top = tops[index] }">
                <el-option v-for="( top, index ) in tops" :key="index" :label="top.filename" :value="index" />
            </el-select>
        </el-form-item>
        <el-form-item label="Destination">
            <el-input v-model="config.destination" style="width: 100%;">
                <template #append>
                    <el-button plain type="primary" @click="selectDestination">
                        <el-icon>
                            <FolderOpened />
                        </el-icon>
                    </el-button>
                </template>
            </el-input>
        </el-form-item>
        <el-form-item>
            <el-button plain type="primary" @click="submit">
                <el-icon>
                    <Select />
                </el-icon>
            </el-button>
            <el-button plain @click="close" type="danger">
                <el-icon>
                    <Close />
                </el-icon>
            </el-button>
        </el-form-item>
    </el-form>
</template>
