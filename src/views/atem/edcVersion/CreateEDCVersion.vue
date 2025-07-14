<script lang="ts" setup>
import { ref, Ref } from 'vue';
import { open } from '@tauri-apps/api/dialog';
import { listen } from '@tauri-apps/api/event';
import { useProjectContext } from '../../../store/context';
import { ElLoading, ElMessage } from 'element-plus';
import { createProjectVersion } from '../../../api/atem/metadata/apis/sdtm';

const emit = defineEmits<{ (e: "close"): void }>();
const edcKinds = [{ value: 1, label: "eCollect" }]
const edcKind: Ref<number | undefined> = ref(1);
const versionName = ref("");
const edcConfigFile = ref("");
const { project } = useProjectContext();


function close() {
    emit("close");
}

async function submit() {
    if (!project) {
        return
    }
    const loadingInstance = ElLoading.service({ fullscreen: true, text: "Creating EDC Version..." });
    try {
        await createProjectVersion({
            product: project.product,
            trial: project.trial,
            versionName: versionName.value,
            edcFilepath: edcConfigFile.value,
            edcKind: edcKind.value ? edcKind.value : 1,
        });
        ElMessage.success("Create EDC version succeesully");
    } catch (e) {
        ElMessage.error(`Failed to create EDC Version, because: ${e}`);
    }
    loadingInstance.close();
    close();
}

async function selectEDCConfig() {
    edcConfigFile.value = (await open({
        filters: [{
            extensions: ["xls", "xlsx"],
            name: ''
        }]
    })) as string;
}

listen('tauri://file-drop', event => {
    const payloads = event.payload as string[];
    if (payloads.length > 0) {
        const file = payloads[0];
        edcConfigFile.value = file.endsWith(".xlsx") ? file : (file.endsWith(".xls") ? file : "");
    }
})
</script>

<template>

    <el-form label-width="auto">
        <el-form-item label="New Version">
            <el-input v-model="versionName" clearable />
        </el-form-item>
        <el-form-item label="EDC Type">
            <el-select v-model="edcKind">
                <el-option v-for="kind in edcKinds" :label="kind.label" :value="kind.value" :key="kind.value" />
            </el-select>
        </el-form-item>
        <el-form-item label="EDC Configuration">
            <el-input v-model="edcConfigFile" clearable>
                <template #prepend>
                    <el-button @click="selectEDCConfig">
                        <el-icon>
                            <FolderOpened />
                        </el-icon>
                    </el-button>
                </template>
            </el-input>
        </el-form-item>
        <el-form-item>
            <div class="button-area">
                <el-button type="primary" @click="submit" size="small" plain>
                    <el-icon>
                        <Check />
                    </el-icon>
                </el-button>
                <el-button type="danger" @click="close" size="small" plain>
                    <el-icon>
                        <Close />
                    </el-icon>
                </el-button>
            </div>
        </el-form-item>
    </el-form>
</template>


<style scoped></style>