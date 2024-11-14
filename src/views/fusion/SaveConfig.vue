<script lang="ts" setup>
import { ref } from 'vue';

const submitEvent = "submit";
const closeEvent = "close";
const prors = defineProps<{ name: string }>();
const emit = defineEmits<{ (e: "submit", saveAs: boolean, name: string): void; (e: "close"): void }>();
const name = ref(prors.name);
const saveAs = ref(false);

async function submit() {
    emit(submitEvent, saveAs.value, name.value)
}

function close() {
    emit(closeEvent)
}
</script>

<template>
    <el-form label-width="auto">
        <el-form-item label="Configuration">
            <el-input v-model="name" clearable />
        </el-form-item>
        <el-form-item label="Save As">
            <el-switch v-model="saveAs"></el-switch>
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