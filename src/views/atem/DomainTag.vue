<script lang="ts" setup>
import { removeDomainForForm } from '../../api/atem/annotation/apis/domain';
import { ref } from 'vue';
import { tagStyle } from './utils/helper';
import { ElMessage } from 'element-plus';
import CreateOrUpdateDomain from './CreateOrUpdateDomain.vue';
import { Domain } from '../../api/atem/annotation/interfaces/domain';


const { annotation, order, formId } = defineProps<{ formId: number, annotation: Domain, order: number }>();
const emit = defineEmits<{ (e: "change"): void }>();
const removeConfirmDisplay = ref(false);
const updateDialogDisplay = ref(false);

function closeTag() {
    removeConfirmDisplay.value = true;
}

function showUpdateDialog() {
    updateDialogDisplay.value = true;
}

function change() {
    emit("change");
}

async function hideShowUpdateDialog(submit: boolean) {
    if (submit) {
        change();
    }
    updateDialogDisplay.value = false;
}

async function removeDomain() {
    if (annotation.id) {
        try {
            await removeDomainForForm(annotation.id);
            change();
            ElMessage.success(`${annotation.description}(${annotation.name}) has been removed`);
        } catch (err) {
            ElMessage.success(`Remove faield: ${err}`);
        }
    }
    removeConfirmDisplay.value = false;
}

function removeCancel() {
    removeConfirmDisplay.value = false;
}

</script>

<template>
    <el-tag @click="showUpdateDialog" @close="closeTag" class="annotation" :type="tagStyle(order)" closable plain>
        {{
            `${annotation.name}(${annotation.description})`
        }}
    </el-tag>
    <el-dialog destroy-on-close v-model="removeConfirmDisplay" title="Remove Confirm">
        Removing domain
        <el-text type="danger">{{ `${annotation.name}(${annotation.description})` }}</el-text> and
        <el-text type="danger"> related annotations</el-text>
        in this form
        <div class="button-area">
            <el-button @click="removeDomain" type="danger" size="small" plain>
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
    </el-dialog>
    <el-dialog destroy-on-close v-model="updateDialogDisplay" title="Update Domain">
        <CreateOrUpdateDomain @close="hideShowUpdateDialog" :form-id="formId"
            :existedDomain="{ id: annotation.id, name: annotation.name, description: annotation.description }" />
    </el-dialog>
</template>

<style scoped>
.domain-select {
    width: 25%;
    margin-right: 5px;
}

.domain-description {
    width: 70%;
    ;
}

.annotation {
    margin-right: 2px;
}

.button-area {
    margin-top: 10px;
}
</style>