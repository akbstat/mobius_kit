<script lang="ts" setup>
const { target } = defineProps<{ target: string }>();
const closeEvent = "close";
const emit = defineEmits<{ (e: "close", confirm: boolean): void }>();
</script>

<template>
    <span>Remove <span style="color: #F56C6C;">{{ target }}</span> ?</span>
    <div style="margin-top: 10%;">
        <el-button type="primary" plain @click="() => { emit(closeEvent, true); }">
            <el-icon>
                <Select />
            </el-icon>
        </el-button>
        <el-button type="danger" plain @click="() => { emit(closeEvent, false); }">
            <el-icon>
                <Close />
            </el-icon>
        </el-button>
    </div>
</template>
