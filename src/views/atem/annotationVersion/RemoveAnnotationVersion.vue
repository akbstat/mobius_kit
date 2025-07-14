<script lang="ts" setup>
import { ElMessage } from 'element-plus';
import { removeAnnotationVersion } from '../../../api/atem/annotation/apis/annotation';
import { AnnotationVersion } from '../../../api/atem/annotation/interfaces/annotation';

const props = defineProps<{ version: AnnotationVersion | undefined }>();
const emit = defineEmits<{ (e: "close", change: boolean): void }>();

async function submit() {
    if (props.version) {
        try {
            await removeAnnotationVersion(props.version.id);
            ElMessage.success("Remove annotation version successfully");
        } catch (err) {
            ElMessage.error(`Failed to remove annotation version: because: ${err}`);
        }
    }
    emit("close", true);
}

function close() {
    emit("close", false);
}

</script>
<template>
    <span>You are removing annotation version <el-text type="danger">{{ props.version?.name }}</el-text>, continue?
    </span>
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
</template>

<style scoped>
.button-area {
    margin-top: 25px;
    ;
}
</style>