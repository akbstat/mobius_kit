<script lang="ts" setup>
import { computed, onMounted, reactive, Ref, ref, watch } from 'vue';
import { open } from '@tauri-apps/api/dialog';
import { configInfer } from '../../api/fusion/top';
import { debounce } from 'lodash';
import { GeneralConfig } from './fusion';
import { ConfigRecord, findConfig, listConfigs, deleteConfig } from '../../api/fusion/config';
import { ElMessage } from 'element-plus';

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
const configSelectionRef = ref();
const selectedConfigRecordId: Ref<string> = ref("");
const removeConfigDisplay = ref(false);
const removeConfigId = ref("");
const removeConfigName = computed(() => {
    const configRecord = configRecords.value.find(c => c.id === removeConfigId.value);
    return configRecord ? configRecord.name : "";
});

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

async function selectTop() {
    const top = (await open({
        filters: [{ name: "", extensions: ["xlsx"] }],
    })) as string;
    config.top = top;
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

function removeConfig(id: string) {
    configSelectionRef.value.blur();
    removeConfigId.value = id;
    removeConfigDisplay.value = true;
}

async function removeConfigSubmit() {
    removeConfigDisplay.value = false;
    try {
        await deleteConfig(removeConfigId.value);
        ElMessage.success(`Remove configuration <${removeConfigName.value}> success`);
    } catch (e) {
        ElMessage.error(`Remove configuration <${removeConfigName.value}> failed: ${e}`);
    }
    configRecords.value = await listConfigs();
}

function removeConfigCancel() {
    removeConfigDisplay.value = false;
}

watch(() => config.source, debounce(async () => {
    await outputChange(config.source)
}, 100))

watch(selectedConfigRecordId, debounce(async () => {
    const id = selectedConfigRecordId.value;
    if (id.length > 0) {
        let data = await findConfig(id);
        let { source, destination, top } = data;
        config.top = top;
        config.destination = destination;
        config.source = source;
        const c = configRecords.value.filter((c) => c.id === id);
        if (c.length > 0) {
            configRecord.value = c[0]
        }
    }
}, 100))

onMounted(async () => {
    configRecords.value = await listConfigs();
})
</script>

<template>
    <el-form label-width="auto">
        <el-form-item label="From Config">
            <el-select ref="configSelectionRef" value-key="id" clearable filterable placeholder="Previous Configuration"
                v-model="selectedConfigRecordId" style="width: 100%;">
                <el-option v-for="config in configRecords" :key="config.id" :label="config.name" :value="config.id">
                    <div style="display: flex;">
                        <el-text>{{ config.name }}</el-text>
                        <div style="width: 100%;">
                            <el-button @click.stop="() => { removeConfig(config.id) }"
                                style="float: right; margin-top: 5px;" type="danger" size="small" text>
                                <el-icon>
                                    <Delete />
                                </el-icon>
                            </el-button>
                        </div>
                    </div>
                </el-option>
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
                    <el-button plain type="primary" @click="selectTop">
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
    <el-dialog v-model="removeConfigDisplay" destroy-on-close title="Remove Historical Configuration">
        <div style="margin-bottom: 20px;">
            Removing configuration <el-text type="danger">{{ removeConfigName }}</el-text>, continue?
        </div>
        <div>
            <el-button @click="removeConfigSubmit" type="primary" plain>
                <el-icon>
                    <Check />
                </el-icon>
            </el-button>
            <el-button @click="removeConfigCancel" type="danger" plain>
                <el-icon>
                    <Close />
                </el-icon>
            </el-button>
        </div>
    </el-dialog>
</template>
