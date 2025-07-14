<script lang="ts" setup>
import { ElMessage } from 'element-plus';
import { ProjectVersion, removeProjectVersion } from '../../../api/atem/rawdata/apis/rawdata';

const props = defineProps<{ version: ProjectVersion | undefined }>();
const emit = defineEmits<{ (e: "close", change: boolean): void }>();

async function submit() {
    if (props.version) {
        try {
            await removeProjectVersion(props.version.id);
            ElMessage.success("Remove EDC version successfully");
        } catch (err) {
            ElMessage.error(`Failed to remove EDC version: because: ${err}`);
        }
        emit("close", true);
    }
}

function close() {
    emit("close", false);
}

</script>
<template>
    <div v-if="props.version">
        <span>You are removing EDC version <el-text type="danger">{{ props.version.name }}</el-text>, continue? </span>
        <div class="button-area">
            <el-button @click="submit" type="primary" size="small" plain>
                <el-icon>
                    <Check />
                </el-icon>
            </el-button>
            <el-button @click="close" type="danger" size="small" plain>
                <el-icon>
                    <Close />
                </el-icon>
            </el-button>
        </div>
    </div>
</template>

<style scoped>
.button-area {
    margin-top: 25px;
}
</style>