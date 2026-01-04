<script lang="ts" setup>
import { onMounted, Ref, ref, watch } from 'vue';
import CreateAnnotationVersion from './CreateAnnotationVersion.vue';
import RemoveAnnotationVersion from './RemoveAnnotationVersion.vue';
import ModifyAnnotationVersion from './ModifyAnnotationVersion.vue';
import { AnnotationVersion } from '../../../api/atem/annotation/interfaces/annotation';
import { listAnnotationVersion } from '../../../api/atem/annotation/apis/annotation';

const props = defineProps<{ projectVersionId: number | undefined, annotationVersionId: number | undefined }>();
const selectedAnnoationVersionId: Ref<number | undefined> = ref();
const selectedProjectVersionId: Ref<number | undefined> = ref();
const annotationVersions: Ref<AnnotationVersion[]> = ref([]);
const createAnnotationVersionDialogDisplay = ref(false);
const modifyAnnotationVersionDialogDisplay = ref(false);
const removeAnnotationVersionDialogDisplay = ref(false);
const selectedAnnotationVersion: Ref<AnnotationVersion | undefined> = ref(undefined);
const emit = defineEmits<{ (e: "change", version: number | undefined): void }>();

function annotationVersionLabel(version: AnnotationVersion): string {
    if (version.description.length > 0) {
        return `${version.name} (${version.description})`;
    }
    return version.name;
}

function showCreateAnnotationVersionDialog() {
    createAnnotationVersionDialogDisplay.value = true;
}

function changeAnnotationVersion() {
    emit("change", selectedAnnoationVersionId.value);
}

async function hideCreateAnnotationVersionDialog() {
    const projectVersionId = selectedProjectVersionId.value;
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
        await updateAnnotationVersions(selectedProjectVersionId.value);
    }
    removeAnnotationVersionDialogDisplay.value = false;
}

async function showModifyAnnotationVersionDialog(version: AnnotationVersion) {
    selectedAnnotationVersion.value = version;
    modifyAnnotationVersionDialogDisplay.value = true;
}

async function hideModifyAnnotationVersionDialog(change: boolean) {
    if (change) {
        await updateAnnotationVersions(selectedProjectVersionId.value);
    }
    modifyAnnotationVersionDialogDisplay.value = false;
}

/**
 * update annotation version list and active annotation version id accroding active project version id
 * @param projectVersionId 
 */
async function updateAnnotationVersions(projectVersionId: number | undefined) {
    if (!projectVersionId) {
        selectedAnnoationVersionId.value = undefined;
        annotationVersions.value = [];
        return;
    }
    const annotationVersionList = await listAnnotationVersion(projectVersionId);
    annotationVersions.value = annotationVersionList;

    if (selectedAnnoationVersionId.value && annotationVersionList.map(v => v.id).includes(selectedAnnoationVersionId.value)) {
        return;
    }
    selectedAnnoationVersionId.value = annotationVersionList.length > 0 ? annotationVersionList[annotationVersionList.length - 1].id : undefined;

}

onMounted(async () => {
    selectedAnnoationVersionId.value = props.annotationVersionId;
    selectedProjectVersionId.value = props.projectVersionId;
    if (props.projectVersionId) {
        await updateAnnotationVersions(props.projectVersionId);
    }
});

watch(() => props.projectVersionId, async () => {
    if (props.projectVersionId) {
        await updateAnnotationVersions(props.projectVersionId);
    }
    emit("change", selectedAnnoationVersionId.value);
});
</script>

<template>
    <el-select @change="changeAnnotationVersion" class="annotation-version" size="small"
        v-model="selectedAnnoationVersionId" clearable>
        <template #footer>
            <el-button :disabled="selectedProjectVersionId ? false : true" @click="showCreateAnnotationVersionDialog"
                style="width: 100%;" text type="primary">
                <el-icon>
                    <Plus />
                </el-icon>
            </el-button>
        </template>
        <el-option style="padding: 0 5px 0 15px" v-for="version in annotationVersions" :key="version.id"
            :value="version.id" :label="annotationVersionLabel(version)">
            <div>
                {{ `${version.name} ${version.description.length > 0 ? `(${version.description})` : ""}` }}
                <div style="float: right;">
                    <el-button @click.stop="() => { showModifyAnnotationVersionDialog(version) }" type="primary"
                        size="small" text>
                        <el-icon size="small">
                            <Edit />
                        </el-icon>
                    </el-button>
                    <el-button @click.stop="() => { showAnnotationVersionDialog(version) }" style="margin: 0;"
                        type="danger" size="small" text>
                        <el-icon size="small">
                            <Delete />
                        </el-icon>
                    </el-button>
                </div>
            </div>
        </el-option>
    </el-select>
    <el-dialog destroy-on-close title="Create New Annotation Version" v-model="createAnnotationVersionDialogDisplay">
        <CreateAnnotationVersion :project-version-id="selectedProjectVersionId"
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
/* .annotation-version {
    width: 260px;
} */
</style>