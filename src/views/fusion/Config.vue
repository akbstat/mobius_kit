<script lang="ts" setup>
import { onMounted, reactive, Ref, ref, watch } from 'vue';
import { open } from '@tauri-apps/api/dialog';
import { configInfer } from '../../api/fusion/top';
import { debounce } from 'lodash';
import { GeneralConfig } from './fusion';
import { ConfigRecord, findConfig, listConfigs } from '../../api/fusion/config';

const emit = defineEmits<{
    (e: "submit", config: GeneralConfig, configRecord: ConfigRecord | null): void;
    (e: "close"): void;
}>();

const { top, source, destination } = defineProps<GeneralConfig>();

const config = reactive({
    top,
    source,
    destination,
});

const configRecords: Ref<ConfigRecord[]> = ref([]);
const configRecord: Ref<ConfigRecord | null> = ref(null);


function submit() {
    emit("submit", config, configRecord.value);
}

function close() {
    configRecord.value = null;
    emit("close");
}

async function selectDirectory(): Promise<string> {
    return (await open({
        directory: true,
        defaultPath: undefined,
    })) as string;
}

async function selectOutput() {
    const dir = await selectDirectory();
    if (dir.length > 0) {
        config.source = dir;
    }
}

async function selectDestination() {
    config.destination = await selectDirectory();
}

async function outputChange(output: string) {
    if (output.length > 0) {
        const inferConfig = await configInfer(output);
        if (config.destination.length === 0) {
            config.destination = inferConfig.destination;
        }
        if (config.top.length === 0 && inferConfig.top.length > 0) {
            config.top = inferConfig.top[0]
        }
    }
}

watch(() => config.source, debounce(async () => {
    await outputChange(config.source)
}, 100))

watch(configRecord, debounce(async () => {
    if (configRecord.value !== null) {
        let id = configRecord.value.id;
        let data = await findConfig(id);
        let { source, destination, top } = data;
        config.top = top;
        config.destination = destination;
        config.source = source;
    }
}, 100))

onMounted(async () => {
    configRecords.value = await listConfigs();
})
</script>

<template>
    <el-form label-width="auto">
        <el-form-item label="From Config">
            <el-select value-key="id" clearable filterable placeholder="Previous Configuration" v-model="configRecord"
                style="width: 100%;">
                <el-option v-for="config in configRecords" :key="config.id" :label="config.name" :value="config" />
            </el-select>
        </el-form-item>
        <el-form-item label="Source">
            <el-input v-model="config.source" style="width: 100%;">
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
            <el-input v-model="config.top" style="width: 100%;">
                <template #append>
                    <el-button plain type="primary" @click="selectOutput">
                        <el-icon>
                            <FolderOpened />
                        </el-icon>
                    </el-button>
                </template>
            </el-input>
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
