<script lang="ts" setup>
import { ref, Ref } from 'vue';
const edcConfigDisplay = ref(false);
const selectedHistoryConfig = ref("");
const config: Ref<{ source: string, destination: string, filename: string, ecrf: string, db: string }> = ref({ source: "", destination: "", filename: "", ecrf: "", db: "" });
const historyConfig: Ref<{ id: string, name: string }[]> = ref([{ id: "0", name: "test" }]);
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
                    <el-icon>
                        <FolderOpened />
                    </el-icon>
                </template>
            </el-input>
        </el-form-item>
        <el-form-item label="Destination">
            <el-input class="destination" v-model="config.destination" clearable>
                <template #prepend>
                    <el-icon>
                        <FolderOpened />
                    </el-icon>
                </template>
            </el-input>
            <el-input class="filename" v-model="config.filename">
                <template #append>
                    .PDF
                </template>
            </el-input>
        </el-form-item>
        <el-form-item label="EDC Config">
            <el-switch v-model="edcConfigDisplay" />
        </el-form-item>
        <div v-if="edcConfigDisplay">
            <el-form-item label="eCRF">
                <el-input v-model="config.ecrf" clearable>
                    <template #prepend>
                        <el-icon>
                            <FolderOpened />
                        </el-icon>
                    </template>
                </el-input>
            </el-form-item>
            <el-form-item label="DB Export">
                <el-input v-model="config.db" clearable>
                    <template #prepend>
                        <el-icon>
                            <FolderOpened />
                        </el-icon>
                    </template>
                </el-input>
            </el-form-item>
        </div>
        <el-form-item>
            <el-button type="primary" plain>
                <el-icon>
                    <Check />
                </el-icon>
            </el-button>
            <el-button type="danger" plain>
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
</style>