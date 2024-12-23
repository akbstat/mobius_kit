<script lang="ts" setup>
const { filename } = defineProps<{ filename: string }>();
const emit = defineEmits<{ (e: "close", open: boolean): void }>();
function open() {
    emit("close", true);
}
function close() {
    emit("close", false);
}
</script>

<template>
    <div>
        <el-text>
            <el-text type="primary">{{ filename }}</el-text> is generated.
        </el-text>
    </div>
    <div class="close">
        <el-button @click="open" type="primary" plain>
            <el-icon>
                <Reading />
            </el-icon>
        </el-button>
        <el-button @click="close" type="danger" plain>
            <el-icon>
                <Close />
            </el-icon>
        </el-button>
    </div>
</template>

<style scoped>
.close {
    margin-top: 30px
}
</style>