<script setup lang="ts">
const emit = defineEmits<{ (e: "close", submit: boolean): void; }>();

const { tasks } = defineProps<{
    tasks: { name: string, files: string[] }[]
}>();

function submit() {
    emit("close", true);
}

function cancel() {
    emit("close", false);
}

</script>

<template>
    <el-text type="danger">
        Warning: output files without title will not be displayed in TOC and bookmarks, but they will still be combined
        together
    </el-text>
    <el-table :data="tasks" height="300">
        <el-table-column label="Task" prop="name" width="200" />
        <el-table-column label="File">
            <template #default="scope">
                <div v-for="file in scope.row.files">
                    <el-tag class="file" type="primary">{{ file }}</el-tag>
                </div>
            </template>
        </el-table-column>
    </el-table>
    <div class="button-field">
        <el-button @click="submit" class="button" plain type="primary">Continue</el-button>
        <el-button @click="cancel" class="button" plain type="danger">Cancel</el-button>
    </div>
</template>

<style scoped>
.button-field {
    margin-top: 15px;
}

.button {
    width: 70px;
}

.file {
    width: 400px;
    justify-content: left;
}
</style>