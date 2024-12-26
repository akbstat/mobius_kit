<script lang="ts" setup>
import { ref } from 'vue';

const props = defineProps<{
    id: string;
    name: string;
}>();
const emit = defineEmits<{
    (e: "save", id: string, name: string): void;
    (e: "close"): void;
}>();
const name = ref(props.name);
const saveAs = ref(false);

function save() {
    emit("save", saveAs.value ? "" : props.id, name.value);
}

function close() {
    emit("close");
}
</script>

<template>
    <el-form label-width="auto">
        <el-form-item label="Name">
            <el-input v-model="name" clearable />
        </el-form-item>
        <el-form-item label="Save As">
            <el-switch v-model="saveAs" />
        </el-form-item>
    </el-form>
    <el-form-item>
        <el-button @click="save" type="primary" plain>
            <el-icon>
                <Check />
            </el-icon>
        </el-button>
        <el-button @click="close" type="danger" plain>
            <el-icon>
                <Close />
            </el-icon>
        </el-button>
    </el-form-item>
</template>