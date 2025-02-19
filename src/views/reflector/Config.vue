<script lang="ts" setup>
import { computed, onMounted, ref, Ref } from 'vue';
import { selectDirectory, selectFile } from "../../api/utils/directory";
import { AcrfConfig } from './entity/config.ts';
import { listConfig, removeConfig } from '../../api/reflector/reflector.ts';
import { ElMessage } from 'element-plus';
import { storeToRefs } from 'pinia';
import { useReflector } from '../../store/reflector.ts';

let { config } = storeToRefs(useReflector());
const emit = defineEmits<{ (e: "update", config: AcrfConfig): void, (e: "close"): void }>();
const edcConfigDisplay = ref(false);
// const config: Ref<AcrfConfig> = ref({ source: "", destination: "", filename: "acrf", ecrf: "", db: "", historyConfigId: "", historyConfigName: "" });
const historyConfig: Ref<{ id: string, name: string }[]> = ref([]);
const advanceEnable = computed(() => config.value.historyConfigId ? true : false);
const removeConfigDisplay = ref(false);
const configSelectionRef = ref();
const removeConfigId = ref("");
const removeConfigName = computed(() => historyConfig.value.find(c => c.id === removeConfigId.value)?.name as string);
const edcOptions = ["ECollect", "Rave"];

async function selectFolder() {
    config.value.destination = await selectDirectory();
}

async function selectSource() {
    config.value.source = await selectFile({
        extensions: ["pdf"],
        filter: "",
    });
}

async function selectEcrf() {
    config.value.ecrf = await selectFile({
        extensions: ["pdf"],
        filter: "",
    });
}

async function selectDB() {
    config.value.db = await selectFile({
        extensions: ["xls", "xlsx", "xlsm", "xml"],
        filter: "",
    });
}

function historicalConfigChange(value: string) {
    if (value) {
        config.value.db = "";
        config.value.ecrf = "";
        edcConfigDisplay.value = false;
        config.value.historyConfigName = historyConfig.value.find(c => c.id === value)?.name as string;
        return;
    }
    config.value.historyConfigName = "";
}

async function submit() {
    emit("update", config.value);
}

function closeConfig() {
    emit("close");
}

function removeHistoryConfigConfirm(id: string) {
    configSelectionRef.value.blur();
    removeConfigId.value = id;
    removeConfigDisplay.value = true;
}

function removeHistoryConfigCancel() {
    removeConfigDisplay.value = false;
}

async function removeHistoryConfig() {
    await removeConfig(removeConfigId.value);
    ElMessage.success(`Remove Config ${removeConfigName.value} Success`);
    removeConfigDisplay.value = false;
    historyConfig.value = await listConfig();
}

onMounted(async () => {
    historyConfig.value = await listConfig();
});

</script>

<template>
    <el-form label-width="auto">
        <el-form-item label="Source aCRF">
            <el-input v-model="config.source" clearable>
                <template #prepend>
                    <el-button class="btn" @click="selectSource">
                        <el-icon>
                            <FolderOpened />
                        </el-icon>
                    </el-button>
                </template>
            </el-input>
        </el-form-item>
        <el-form-item label="Destination">
            <el-input class="destination" v-model="config.destination" clearable>
                <template #prepend>
                    <el-button class="btn" @click="selectFolder">
                        <el-icon>
                            <FolderOpened />
                        </el-icon>
                    </el-button>
                </template>
            </el-input>
            <el-input class="filename" v-model="config.filename">
                <template #append>
                    .pdf
                </template>
            </el-input>
        </el-form-item>
        <el-form-item label="From Config">
            <el-select ref="configSelectionRef" filterable class="history" v-model="config.historyConfigId"
                @change="historicalConfigChange" clearable>
                <el-option v-for="config in historyConfig" :key="config.id" :label="config.name" :value="config.id">
                    <template #default>
                        <span>{{ config.name }}</span>
                        <el-button type="danger" class="remove-option" size="small"
                            @click.stop="() => { removeHistoryConfigConfirm(config.id) }" link>
                            <el-icon>
                                <Delete />
                            </el-icon>
                        </el-button>
                    </template>
                </el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="Advanced Config">
            <el-switch :disabled="advanceEnable" v-model="edcConfigDisplay" />
        </el-form-item>
        <div v-if="edcConfigDisplay">
            <el-form-item label="eCRF">
                <el-input v-model="config.ecrf" clearable>
                    <template #prepend>
                        <el-button @click="selectEcrf" class="btn">
                            <el-icon>
                                <FolderOpened />
                            </el-icon>
                        </el-button>
                    </template>
                </el-input>
            </el-form-item>
            <el-form-item label="DB Export">
                <el-input v-model="config.db" clearable>
                    <template #prepend>
                        <el-button @click="selectDB" class="btn">
                            <el-icon>
                                <FolderOpened />
                            </el-icon>
                        </el-button>
                    </template>
                </el-input>
            </el-form-item>
            <el-form-item label="EDC">
                <el-select v-model="config.edc">
                    <el-option v-for="option in edcOptions" :key="option" :label="option" :value="option" />
                </el-select>
            </el-form-item>
        </div>
        <el-form-item>
            <el-button @click="submit" type="primary" plain>
                <el-icon>
                    <Check />
                </el-icon>
            </el-button>
            <el-button @click="closeConfig" type="danger" plain>
                <el-icon>
                    <Close />
                </el-icon>
            </el-button>
        </el-form-item>
    </el-form>
    <el-dialog v-model="removeConfigDisplay" title="Remove Previous Configuration">
        Configuration <el-text type="danger">{{ removeConfigName }}</el-text> will be removed permanently, continue?
        <div class="remove-confirm">
            <el-button @click="removeHistoryConfig" type="primary" plain>
                <el-icon>
                    <Check />
                </el-icon>
            </el-button>
            <el-button @click="removeHistoryConfigCancel" type="danger" plain>
                <el-icon>
                    <Close />
                </el-icon>
            </el-button>
        </div>

    </el-dialog>
</template>

<style scoped>
.destination {
    width: 65%;
}

.filename {
    margin-left: 1px;
    width: 34.5%;
}

.btn {
    width: 55px;
}

.history {
    width: 100%;
}

.remove-option {
    float: right;
    margin-top: 8px;
}

.remove-confirm {
    margin-top: 40px;
}
</style>