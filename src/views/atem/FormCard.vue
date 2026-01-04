<script lang="ts" setup>
import CreateOrUpdateDomain from './CreateOrUpdateDomain.vue';
import CreateOrUpdateAnnotation from './CreateOrUpdateAnnotation.vue';
import AnnotationTag from './AnnotationTag.vue';
import DomainTag from './DomainTag.vue';
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { MapLocation } from '@element-plus/icons-vue';
import { getDomainOrderNumber } from './utils/helper';
import { FormInfo } from '../../api/atem/rawdata/apis/rawdata';
import { Annotation, AnnotationKind } from '../../api/atem/annotation/interfaces/annotation';
import { useAtem } from '../../store/atem';
import MultiCreateAnnotation from './MultiCreateAnnotation.vue';

const store = useAtem();
const { activeFormDomains, activeAnnoationVersionId, multiOperation, multiSelector } = storeToRefs(store);
const props = defineProps<{
    form: FormInfo, formAnnotations: Annotation[]
}>();
const emit = defineEmits<{
    (e: "change"): void;
}>();
const createDomainDialogDisplay = ref(false);
const createNewAnnotationDialogDisplay = ref(false);
const createMultiAnnotationDialogDisplay = ref(false);
const disableCreateAnnotation = computed(() => {
    return activeAnnoationVersionId.value ? false : true;
});

function showCreateDomainDialog() {
    createDomainDialogDisplay.value = true;
}

function showCreateAnnotationDialog() {
    createNewAnnotationDialogDisplay.value = true;
}

function hideCreateAnnotationDialog() {
    createNewAnnotationDialogDisplay.value = false;
}

function showMultiCreateAnnotationDialog() {
    createMultiAnnotationDialogDisplay.value = true;
}

function submitMultiCreateAnnotation() {
    hideMultiCreateAnnotationDialog();
    change();
}

function hideMultiCreateAnnotationDialog() {
    createMultiAnnotationDialogDisplay.value = false;
}

function change() {
    emit("change");
}

function updateAnnotation() {
    hideCreateAnnotationDialog();
    change();
}

async function hideCreateDomainDialogDisplay(submit: boolean) {
    if (submit) {
        change();
    }
    createDomainDialogDisplay.value = false;
}

function switchMultiOperation() {
    if (!multiOperation.value) {
        multiSelector.value.reset();
    }
    multiOperation.value = !multiOperation.value;
}

</script>

<template>
    <el-card v-if="props.form" class="item-header">
        <div style="display: flex;">
            <el-button :disabled="disableCreateAnnotation" size="small" type="primary" text
                @click="showCreateDomainDialog">
                <el-icon>
                    <MapLocation />
                </el-icon>
            </el-button>
            <el-tag @click="switchMultiOperation" effect="plain" :type="multiOperation ? 'danger' : 'info'" style=""
                size="small" class="form-name header-tag">
                {{ props.form.name }}
            </el-tag>
            <el-text class="form-text" type="primary" size="large">{{ props.form?.description }}</el-text>
            <DomainTag @change="change" v-for="domain in activeFormDomains" :key="domain.id" :annotation="domain"
                :form-id="form.id" :order="getDomainOrderNumber(domain.id)" />
        </div>
        <div style="margin-top: 10px;">
            <el-button :disabled="disableCreateAnnotation" class="left-button"
                @click="() => { multiOperation ? showMultiCreateAnnotationDialog() : showCreateAnnotationDialog() }"
                size="small" :type="multiOperation ? 'danger' : 'primary'" text>
                <el-icon>
                    <Plus />
                </el-icon>
            </el-button>
            <AnnotationTag @change="change" v-for="annotation in props.formAnnotations" :key="annotation.id"
                :annotation="annotation" :order="getDomainOrderNumber(annotation.variable?.domainId)"
                :kind="AnnotationKind.Form" />
        </div>
    </el-card>
    <el-dialog destroy-on-close v-model="createDomainDialogDisplay" title="Create New Domain">
        <CreateOrUpdateDomain @close="hideCreateDomainDialogDisplay" :existedDomain="undefined"
            :form-id="props.form.id" />
    </el-dialog>
    <el-dialog destroy-on-close v-model="createNewAnnotationDialogDisplay" title="Create New Annotation For Form"
        width="1200px">
        <CreateOrUpdateAnnotation @submit="updateAnnotation" @cancel="hideCreateAnnotationDialog"
            :annotation="undefined" :kind="AnnotationKind.Form"
            :location="{ sourceId: props.form.id, kind: AnnotationKind.Form }" :form-level="true" />
    </el-dialog>
    <el-dialog destroy-on-close v-model="createMultiAnnotationDialogDisplay" title="Create Multiple Annotations"
        width="1200px">
        <MultiCreateAnnotation @submit="submitMultiCreateAnnotation" @cancel="hideMultiCreateAnnotationDialog" />
    </el-dialog>
</template>

<style scoped>
.item-header {
    position: sticky;
    height: 100px;
    top: 0;
    z-index: 2;
}

.form-name {
    width: 80px;
    margin-right: 5px;
}

.form-name.header-tag {
    width: 80px;
    font-weight: 1000;
    margin: 3px 5px 0 0;
    cursor: pointer;
}

.form-text {
    margin-right: 5px;
}

.left-button {
    margin-right: 5px;
}
</style>