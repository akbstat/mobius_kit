<script lang="ts" setup>
import { ref } from 'vue';
const emit = defineEmits<{ (e: "update", config: string): void; (e: "close"): void }>();
const configFile = ref("");

function close() {
    emit("close");
}

function submit() {
    emit("update", "");
}
</script>

<template>
    <el-form>
        <el-form-item label="Configuration">
            <el-input v-model="configFile" clearable>
                <template #prepend>
                    <el-button>
                        <el-icon>
                            <FolderOpened />
                        </el-icon>
                    </el-button>
                </template>
            </el-input>
        </el-form-item>
        <el-form-item>
            <el-button @click="submit" type="primary" plain>
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
    </el-form>
</template>

<style scoped></style>