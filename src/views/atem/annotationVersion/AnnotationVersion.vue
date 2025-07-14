<script lang="ts" setup>
import { onMounted, Ref, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import CreateAnnotationVersion from './CreateAnnotationVersion.vue';
import RemoveAnnotationVersion from './RemoveAnnotationVersion.vue';
import ModifyAnnotationVersion from './ModifyAnnotationVersion.vue';
import { useAtem } from '../../../store/atem';
import { AnnotationVersion } from '../../../api/atem/annotation/interfaces/annotation';
import { listAnnotationVersion } from '../../../api/atem/annotation/apis/annotation';

const { activeProjectVersionId, activeAnnoationVersionId } = storeToRefs(useAtem());
const annotationVersions: Ref<AnnotationVersion[]> = ref([]);
const createAnnotationVersionDialogDisplay = ref(false);
const modifyAnnotationVersionDialogDisplay = ref(false);
const removeAnnotationVersionDialogDisplay = ref(false);
const selectedAnnotationVersion: Ref<AnnotationVersion | undefined> = ref(undefined);

function annotationVersionLabel(version: AnnotationVersion): string {
    if (version.description.length > 0) {
        return `${version.name} (${version.description})`;
    }
    return version.name;
}

function showCreateAnnotationVersionDialog() {
    createAnnotationVersionDialogDisplay.value = true;
}

async function hideCreateAnnotationVersionDialog() {
    const projectVersionId = activeProjectVersionId.value;
    if (projectVersionId) {
        annotationVersions.value = await listAnnotationVersion(projectVersionId);
    }
    createAnnotationVersionDialogDisplay.value = false;
}

function showAnnotationVersionDialog(version: AnnotationVersion) {
    selectedAnnotationVersion.value = version;
    removeAnnotationVersionDialogDisplay.value = true;
}

async function hideAnnotationVersionDialog(change: boolean) {
    if (change) {
        await updateAnnotationVersions(activeProjectVersionId.value);
    }
    removeAnnotationVersionDialogDisplay.value = false;
}

async function showModifyAnnotationVersionDialog(version: AnnotationVersion) {
    selectedAnnotationVersion.value = version;
    modifyAnnotationVersionDialogDisplay.value = true;
}

async function hideModifyAnnotationVersionDialog(change: boolean) {
    if (change) {
        await updateAnnotationVersions(activeProjectVersionId.value);
    }
    modifyAnnotationVersionDialogDisplay.value = false;
}

/**
 * update annotation version list and active annotation version id accroding active project version id
 * @param projectVersionId 
 */
async function updateAnnotationVersions(projectVersionId: number | undefined) {
    if (!projectVersionId) {
        activeAnnoationVersionId.value = undefined;
        return;
    }
    const annotationVersionList = await listAnnotationVersion(projectVersionId);
    annotationVersions.value = annotationVersionList;

    if (activeAnnoationVersionId.value && annotationVersionList.map(v => v.id).includes(activeAnnoationVersionId.value)) {
        return;
    }
    activeAnnoationVersionId.value = annotationVersionList.length > 0 ? annotationVersionList[annotationVersionList.length - 1].id : undefined;

}

watch(() => activeProjectVersionId.value, async () => {
    await updateAnnotationVersions(activeProjectVersionId.value);
})

onMounted(async () => {
    await updateAnnotationVersions(activeProjectVersionId.value);
});
</script>

<template>
    <el-select class="annotation-version" size="small" v-model="activeAnnoationVersionId" clearable>
        <template #prefix>
            <div style="width: 120px;">Annotation Version</div>
        </template>
        <template #footer>
            <el-button :disabled="activeProjectVersionId ? false : true" @click="showCreateAnnotationVersionDialog"
                style="width: 240px;" text type="primary">
                <el-icon>
                    <Plus />
                </el-icon>
            </el-button>
        </template>
        <el-option style="padding: 0 5px 0 15px" v-for="version in annotationVersions" :key="version.id"
            :value="version.id" :label="annotationVersionLabel(version)">
            <div>
                {{ version.name }}
                <div style="float: right;">
                    <el-button @click.stop="() => { showModifyAnnotationVersionDialog(version) }" type="primary"
                        size="small" text>
                        <el-icon size="small">
                            <Edit />
                        </el-icon>
                    </el-button>
                    <!-- <el-button @click.stop="() => { showAnnotationVersionDialog(version) }" style="margin: 0;"
                        type="danger" size="small" text>
                        <el-icon size="small">
                            <Delete />
                        </el-icon>
                    </el-button> -->
                </div>
            </div>
        </el-option>
    </el-select>
    <el-dialog destroy-on-close title="Create New Annotation Version" v-model="createAnnotationVersionDialogDisplay">
        <CreateAnnotationVersion :project-version-id="activeProjectVersionId"
            @close="hideCreateAnnotationVersionDialog" />
    </el-dialog>
    <el-dialog destroy-on-close title="Remove Annotation Version" v-model="removeAnnotationVersionDialogDisplay">
        <RemoveAnnotationVersion :version="selectedAnnotationVersion" @close="hideAnnotationVersionDialog" />
    </el-dialog>
    <el-dialog destroy-on-close title="Modify Annotation Version" v-model="modifyAnnotationVersionDialogDisplay">
        <ModifyAnnotationVersion :version="selectedAnnotationVersion" @close="hideModifyAnnotationVersionDialog" />
    </el-dialog>
</template>

<style scoped>
.annotation-version {
    width: 260px;
}
</style>