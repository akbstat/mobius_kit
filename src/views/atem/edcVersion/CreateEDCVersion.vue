<script lang="ts" setup>
import { onMounted, ref, Ref } from 'vue';
import { open } from '@tauri-apps/api/dialog';
import { listen } from '@tauri-apps/api/event';
import { useProjectContext } from '../../../store/context';
import { ElLoading, ElMessage } from 'element-plus';
import { createProjectVersion, listProjectVersions, ProjectVersion } from '../../../api/atem/rawdata/apis/rawdata';
import { MigrationObject } from '../../../api/atem/annotation/interfaces/annotation';
import { listAnnotationVersion, migrateAnnotations } from '../../../api/atem/annotation/apis/annotation';

const emit = defineEmits<{ (e: "close"): void }>();
const edcKinds = [{ value: 1, label: "eCollect (elder)" }, { value: 2, label: "eCollect (V6)" }]
const edcKind: Ref<number | undefined> = ref(2);
const versionName = ref("");
const edcConfigFile = ref("");
const { project } = useProjectContext();
const exsistedVersions: Ref<ProjectVersion[]> = ref([]);
const inheritVersionId: Ref<number | undefined> = ref();


function close() {
    emit("close");
}

async function executeAnnotationmigrate(target: MigrationObject) {
    if (!inheritVersionId.value) return;
    const previousAnnotationVersinos = await listAnnotationVersion(inheritVersionId.value);
    previousAnnotationVersinos.sort((x, y) => x.id - y.id);
    const previousAnnotationVersion = previousAnnotationVersinos.pop();
    if (previousAnnotationVersion) {
        const source = { projectVersionId: inheritVersionId.value, annotationVersionId: previousAnnotationVersion.id };
        await migrateAnnotations({ source, target });
    }
}

async function submit() {
    if (!project) {
        return
    }
    const loadingInstance = ElLoading.service({ fullscreen: true, text: "Creating EDC Version..." });
    try {
        const reply = await createProjectVersion({
            product: project.product,
            trial: project.trial,
            versionName: versionName.value,
            edcFilepath: edcConfigFile.value,
            edcKind: edcKind.value ? edcKind.value : 2,
        });
        loadingInstance.setText("Migrating Previous Annotation Informations...");
        const { annotationVersionId, projectVersionId } = reply;
        if (inheritVersionId.value && annotationVersionId && projectVersionId) {
            await executeAnnotationmigrate({ annotationVersionId, projectVersionId });
        }
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
            extensions: ["xlsx"],
            name: ''
        }]
    })) as string;
}

onMounted(async () => {
    if (!project) {
        return;
    }
    const { product, trial } = project;
    const reply = await listProjectVersions({ product, trial });
    const versions = reply.data;
    if (versions.length > 0) {
        inheritVersionId.value = versions[versions.length - 1].id;
    }
    exsistedVersions.value = versions;
});

listen('tauri://file-drop', event => {
    const payloads = event.payload as string[];
    if (payloads.length > 0) {
        const file = payloads[0];
        edcConfigFile.value = file.endsWith(".xlsx") ? file : "";
    }
})
</script>

<template>

    <el-form label-width="auto">
        <el-form-item class="item" label="New Version">
            <el-input v-model="versionName" clearable />
        </el-form-item>
        <el-form-item class="item" label="EDC Type">
            <el-select v-model="edcKind">
                <el-option v-for="kind in edcKinds" :label="kind.label" :value="kind.value" :key="kind.value" />
            </el-select>
        </el-form-item>
        <el-form-item class="item" label="EDC Configuration">
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
        <el-form-item class="item" label="Inherit From">
            <el-select v-model="inheritVersionId" clearable>
                <el-option v-for="version in exsistedVersions" :label="version.name" :value="version.id"
                    :key="version.id" />
            </el-select>
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


<style scoped>
.item {
    margin-bottom: 20px;
}
</style>