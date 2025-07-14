<script lang="ts" setup>
import CreateOrUpdateAnnotation from './CreateOrUpdateAnnotation.vue';
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { tagStyle } from './utils/helper';
import { Annotation, AnnotationKind } from '../../api/atem/annotation/interfaces/annotation';
import { removeAnnotation } from '../../api/atem/annotation/apis/annotation';

const { annotation, order, kind } = defineProps<{ annotation: Annotation, order: number, kind: AnnotationKind }>();
const emit = defineEmits<{ (e: "change"): void }>();
const removeConfirmDisplay = ref(false);
const updateDialogDisplay = ref(false);

function closeTag() {
    removeConfirmDisplay.value = true;
}

function tagClass(): string {
    const className = `annotation ${annotation.assign ? "assign-tag" : ""}`;
    return className;
}

function titie(kind: AnnotationKind): string {
    const kindName = ["Form", "Item", "ItemValue", "Unit", "Option"][kind];
    return `Update Annotation for ${kindName ? kindName : "Unknown"}`;
}

async function deleteAnnotation() {
    try {
        await removeAnnotation(annotation.id);
        emit("change");
        ElMessage.success(`Remove annotation ${annotation.annotationDisplay} successfully`);
    } catch (err) {
        ElMessage.error(`Remove annotation failed: ${err}`);
    }
    removeConfirmDisplay.value = false;
}

function removeCancel() {
    removeConfirmDisplay.value = false;
}

async function changeAnnotation() {
    try {
        ElMessage.success("Update annotation successfully");
        emit("change");
    } catch (err) {
        ElMessage.error(`Update annotation failed: ${err}`);
    }
    updateDialogDisplay.value = false;
}

function showUpdateDialog() {
    updateDialogDisplay.value = true;
}

function cancelUpdate() {
    updateDialogDisplay.value = false;
}

</script>

<template>
    <el-tag @click="showUpdateDialog" @close="closeTag" :class="tagClass()" :type="tagStyle(order)" closable plain>
        {{
            annotation.annotationDisplay
        }}
    </el-tag>
    <el-dialog v-model="removeConfirmDisplay">
        <template #header>
            <div style="text-align: left;">
                Remove Confirm
            </div>
        </template>
        <div style="text-align: left;">
            Removing annotation <el-text type="danger">{{ annotation.annotationDisplay }}</el-text>
            <div class="button-area">
                <el-button @click="deleteAnnotation" type="danger" size="small" plain>
                    <el-icon>
                        <Delete />
                    </el-icon>
                </el-button>
                <el-button @click="removeCancel" size="small" plain>
                    <el-icon>
                        <Close />
                    </el-icon>
                </el-button>
            </div>
        </div>
    </el-dialog>
    <el-dialog destroy-on-close v-model="updateDialogDisplay">
        <template #header>
            <div style="text-align: left;">
                {{ titie(kind) }}
            </div>
        </template>
        <CreateOrUpdateAnnotation @submit="changeAnnotation" @cancel="cancelUpdate" :annotation="annotation"
            :kind="kind" :location="{ sourceId: annotation.sourceId, kind: kind }" />
    </el-dialog>
</template>

<style scoped>
.annotation {
    margin-right: 2px;
    max-width: 200px;
    height: auto;
    padding: 5px 0px 5px 4px;
    white-space: normal;
    text-align: center;
    /* 
     */
}

.button-area {
    margin-top: 10px;
}

.update-dialog {
    text-align: left;
}

.assign-tag {
    border: 2px dotted;
}
</style>