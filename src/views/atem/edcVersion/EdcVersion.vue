<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { onMounted, ref, Ref } from 'vue';
import CreateEDCVersion from './CreateEDCVersion.vue';
import RemoveEDCVersion from './RemoveEDCVersion.vue';
import ModifyEDCVersion from './ModifyEDCVersion.vue';
import { useProjectContext } from '../../../store/context';
import { listProjectVersions, ProjectVersion } from '../../../api/atem/rawdata/apis/rawdata';

const activeProjectVersionId: Ref<number | undefined> = ref();
const { project } = storeToRefs(useProjectContext());
const projectVersions: Ref<ProjectVersion[]> = ref([]);
const createEDCVersionDialogDisplay = ref(false);
const removeEDCVersionDialogDisplay = ref(false);
const modifyEDCVersionDialogDisplay = ref(false);
const selectedVersion: Ref<ProjectVersion | undefined> = ref(undefined);
const emit = defineEmits<{ (e: "change", version: number): void }>();
const prop = defineProps<{ projectVersionId: number | undefined }>();

function showCreateEDCVersionDialog() {
    createEDCVersionDialogDisplay.value = true;
}

// function showRemoveEdcVersionDialog(version: ProjectVersion) {
//     selectedVersion.value = version;
//     removeEDCVersionDialogDisplay.value = true;
// }

function showModifyEDCVersionDialog(version: ProjectVersion) {
    selectedVersion.value = version;
    modifyEDCVersionDialogDisplay.value = true;
}

async function changeProjectVersion(versionId: number) {
    // activeProjectVersionId.value = versionId;
    emit("change", versionId);
}

async function afterCreateEDCVersion() {
    if (project.value) {
        const { product, trial } = project.value;
        const versions = (await listProjectVersions({ product, trial })).data;
        selectedVersion.value = versions[versions.length - 1];
        activeProjectVersionId.value = selectedVersion.value.id;
        projectVersions.value = versions;
        emit("change", activeProjectVersionId.value);
    }
    createEDCVersionDialogDisplay.value = false;
}

async function hideRemoveEdcVersionDialog(change: boolean) {
    if (change) {
        await updateProjectVersions(project.value);
    }
    removeEDCVersionDialogDisplay.value = false;
}

async function hideModifyEdcVersionDialog(change: boolean) {
    if (change) {
        await updateProjectVersions(project.value);
    }
    modifyEDCVersionDialogDisplay.value = false;
}

/**
 * update the project version list and active selected project version id according project context
 * @param project 
 */
async function updateProjectVersions(project: { product: string, trial: string } | undefined) {
    if (!project) {
        return
    }
    const { product, trial } = project;
    const versions = (await listProjectVersions({ product, trial })).data;
    versions.sort((x, y) => x.id - y.id < 0 ? -1 : 1);
    projectVersions.value = versions;

    if (activeProjectVersionId.value && versions.map(v => v.id).includes(activeProjectVersionId.value)) {
        return;
    }
    activeProjectVersionId.value = versions.length > 0 ? activeProjectVersionId.value = versions[versions.length - 1].id : undefined;
}

onMounted(async () => {
    activeProjectVersionId.value = prop.projectVersionId;
    await updateProjectVersions(project.value);
});

</script>

<template>
    <el-select @change="changeProjectVersion" class="version-select" v-model="activeProjectVersionId"
        placeholder="Select" size="small">
        <template #footer>
            <el-button @click="showCreateEDCVersionDialog" style="width: 100%;" size="small" text type="primary">
                <el-icon>
                    <Plus />
                </el-icon>
            </el-button>
        </template>
        <el-option style="padding: 0 5px 0 15px" v-for="version in projectVersions" :key="version.id"
            :label="version.name" :value="version.id">
            <div>
                {{ version.name }}
                <div style="float: right;">
                    <el-button @click.stop="() => { showModifyEDCVersionDialog(version) }" type="primary" size="small"
                        text>
                        <el-icon size="small">
                            <Edit />
                        </el-icon>
                    </el-button>
                    <!-- <el-button @click.stop="() => { showRemoveEdcVersionDialog(version) }" style="margin: 0;"
                        type="danger" size="small" text>
                        <el-icon size="small">
                            <Delete />
                        </el-icon>
                    </el-button> -->
                </div>
            </div>
        </el-option>
    </el-select>
    <el-dialog destroy-on-close title="Create New EDC Version" v-model="createEDCVersionDialogDisplay">
        <CreateEDCVersion @close="afterCreateEDCVersion" />
    </el-dialog>
    <el-dialog destroy-on-close title="Remove EDC Version" v-model="removeEDCVersionDialogDisplay">
        <RemoveEDCVersion @close="hideRemoveEdcVersionDialog" :version="selectedVersion" />
    </el-dialog>
    <el-dialog v-model="modifyEDCVersionDialogDisplay" destroy-on-close title="Modify EDC Version">
        <ModifyEDCVersion @close="hideModifyEdcVersionDialog" :version="selectedVersion" />
    </el-dialog>
</template>
