<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { modifyProjectVersion, ProjectVersion } from '../../../api/atem/rawdata/apis/rawdata';
import { ElMessage } from 'element-plus';

const props = defineProps<{ version: ProjectVersion | undefined }>();
const emit = defineEmits<{ (e: "close", change: boolean): void }>();
const versionName = ref("");

async function submit() {
    if (props.version) {
        if (versionName.value.length > 0 && props.version.name !== versionName.value) {
            try {
                await modifyProjectVersion({ id: props.version.id, name: versionName.value });
                ElMessage.success("Update EDC version successfully");
            } catch (err) {
                ElMessage.error(`Update to remove EDC version: because: ${err}`);
            }
        }
    }
    emit("close", true);
}

function close() {
    emit("close", false);
}

onMounted(() => {
    if (props.version) {
        versionName.value = props.version.name;
    }
})
</script>

<template>
    <span>Version Name</span>
    <el-input class="version-name" v-model="versionName" clearable />
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
.version-name {
    margin-left: 10px;
    width: 520px;
}

.button-area {
    margin-top: 25px;
}
</style>