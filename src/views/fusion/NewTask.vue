<script lang="ts" setup>
import { computed, onMounted, ref, Ref } from 'vue';
import { listRtfsWithTitle, Rtf } from '../../api/fusion/top';
import { GeneralConfig } from './fusion';
import { Task } from '../../api/fusion/config';
import { open } from '@tauri-apps/api/dialog';
import { TransferDataItem } from 'element-plus';

const { config } = defineProps<{ config: GeneralConfig }>();
const closeEvent = "close";
const submitEvent = "submit";
const emit = defineEmits<{ (e: "submit", task: Task): void; (e: "close"): void }>();
const langs = ["CN", "EN"];
const modes = ["PDF", "RTF"];
const task: Ref<Task> = ref({
    language: "CN",
    name: "",
    cover: "",
    mode: "PDF",
    files: [],
    destination: config.destination,
    tocHeaders: ["", "", "", ""],
})
const allOutputs: Ref<Rtf[]> = ref([]);
const selected = ref([]);
const selections = computed(() => {
    return allOutputs.value.map((output, index) => {
        return { key: index, label: output.name }
    });
});
const panelDisplay = ref(0);

onMounted(async () => {
    allOutputs.value = await listRtfsWithTitle(config.source, config.top);
})

function filterOutput(query: string, output: TransferDataItem) {
    return output.label.toLowerCase().includes(query.toLowerCase())
}

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
    const selectedIndex: number[] = selected.value.map(value => value);
    task.value.files = allOutputs.value.filter((_, i) => selectedIndex.includes(i)).map((output: Rtf) => {
        return {
            filename: output.name,
            title: output.title,
            path: `${config.source}\\${output.name}`,
            size: 0,
        }
    });
    // rtf mode then remove cover and language option
    if (task.value.mode === "RTF") {
        task.value.cover = "";
    }
    emit(submitEvent, task.value);
}

</script>

<template>
    <el-container>
        <el-aside width="12%">
            <el-menu>
                <el-menu-item @click="() => { panelDisplay = 0 }">
                    File Select
                </el-menu-item>
                <el-menu-item @click="() => { panelDisplay = 1 }">
                    Configuration
                </el-menu-item>
            </el-menu>
        </el-aside>
        <el-main style="padding-top: 0; ">
            <div v-if="panelDisplay === 1">
                <el-form label-width="auto">
                    <el-form-item label="Filename">
                        <el-input style="width: 70%;" v-model="task.name" clearable />
                    </el-form-item>
                    <el-form-item label="Mode">
                        <el-radio-group v-model="task.mode" size="default">
                            <el-radio-button v-for="mode in modes" :label="mode" :value="mode">
                                <template #default>
                                    <div style="width: 30px;">{{ mode }}</div>
                                </template>
                            </el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item v-if="task.mode === 'PDF'" label="Language">
                        <el-radio-group v-model="task.language" size="default">
                            <el-radio-button v-for="lang in langs" :label="lang" :value="lang">
                                <template #default>
                                    <div style="width: 30px;">{{ lang }}</div>
                                </template>
                            </el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item v-if="task.mode === 'PDF'" label="TOC Headers">
                        <el-input style="width: 34.5%; margin-bottom: 5px; margin-right: 9px;"
                            v-model="task.tocHeaders[0]" clearable>
                        </el-input>
                        <el-input style="width: 34.5%; margin-bottom: 5px;" v-model="task.tocHeaders[1]" clearable>
                        </el-input>
                        <el-input style="width: 34.5%;  margin-right: 9px;" v-model="task.tocHeaders[2]" clearable>
                        </el-input>
                        <el-input style="width: 34.5%; " v-model="task.tocHeaders[3]" clearable>
                        </el-input>
                    </el-form-item>
                    <el-form-item v-if="task.mode === 'PDF'" label="Cover">
                        <el-input style="width: 70%;" v-model="task.cover" clearable>
                            <template #append>
                                <el-button plain type="primary" @click="selectFile">
                                    <el-icon>
                                        <FolderOpened />
                                    </el-icon>
                                </el-button>
                            </template>
                        </el-input>
                    </el-form-item>
                </el-form>

            </div>
            <div v-if="panelDisplay === 0" class="output-select">
                <el-transfer filterable filter-placeholder="Search Outputs" v-model="selected"
                    :titles="['Source', 'Target']" :data="selections" :filter-method="filterOutput">
                    <template #default="{ option }">
                        <span style="width: 200px;">{{ option.label }}</span>
                    </template>
                </el-transfer>
            </div>
        </el-main>
    </el-container>
    <div>
        <div v-if="panelDisplay === 0">
            <el-button :disabled="selected.length === 0" type="primary" plain style="width: 100px;"
                @click="panelDisplay = 1"> Next </el-button>
        </div>
        <div v-if="panelDisplay === 1">
            <el-button :disabled="task.name.length === 0" type="primary" plain @click="submit">
                <el-icon>
                    <Select />
                </el-icon>
            </el-button>
            <el-button type="warning" plain @click="panelDisplay = 0">
                Back
            </el-button>
            <el-button type="danger" plain @click="() => { emit(closeEvent) }">
                <el-icon>
                    <Close />
                </el-icon>
            </el-button>
        </div>
    </div>
</template>

<style>
.output-select .el-transfer-panel__body {
    height: 350px;
}

.output-select .el-transfer-panel {
    width: 400px;
}
</style>