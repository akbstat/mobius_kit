<script lang="ts" setup>
import { ref, Ref } from 'vue';
import { selectDirectory, selectFile } from "../../api/utils/directory";
import { AcrfConfig } from './entity/config.ts';
const emit = defineEmits<{ (e: "update", config: AcrfConfig): void, (e: "close"): void }>();
const edcConfigDisplay = ref(false);
const selectedHistoryConfig = ref("");
const config: Ref<AcrfConfig> = ref({ source: "", destination: "", filename: "acrf", ecrf: "", db: "" });
// const config: Ref<AcrfConfig> = ref({
//     source: "D:\\projects\\rusty\\acrf_outline\\.data\\ecollect\\AK120-301_aCRF_v0.23.pdf",
//     destination: "D:\\projects\\rusty\\acrf_outline\\.data\\ecollect",
//     filename: "acrf",
//     ecrf: "D:\\projects\\rusty\\acrf_outline\\.data\\ecollect\\AK120-301_Unique eCRF_V2.0_20240530.pdf",
//     db: "D:\\projects\\rusty\\acrf_outline\\.data\\ecollect\\database_export_AK120-301_20240606_0000.xlsx",
// });
const historyConfig: Ref<{ id: string, name: string }[]> = ref([]);

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
        extensions: ["xls", "xlsx", "xlsm"],
        filter: "",
    });
}

async function submit() {
    emit("update", config.value);
}

function closeConfig() {
    emit("close");
}

</script>

<template>
    <el-form label-width="auto">
        <el-form-item label="From Config">
            <el-select v-model="selectedHistoryConfig" clearable>
                <el-option v-for="config in historyConfig" :key="config.id" :label="config.name" :value="config.id" />
            </el-select>
        </el-form-item>
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
        <el-form-item label="Advanced Config">
            <el-switch v-model="edcConfigDisplay" />
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
</style>