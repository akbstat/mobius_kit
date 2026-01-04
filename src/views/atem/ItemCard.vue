<script lang="ts" setup>
import AnnotationTag from './AnnotationTag.vue';
import CreateOrUpdateAnnotation from './CreateOrUpdateAnnotation.vue';
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { getDomainOrderNumber } from './utils/helper';
import { ItemAnnotation } from './utils/interfaces';
import { AnnotationKind } from '../../api/atem/annotation/interfaces/annotation';
import { useAtem } from '../../store/atem';

const { activeAnnoationVersionId, multiOperation, multiSelector } = storeToRefs(useAtem());
const { item } = defineProps<{ item: ItemAnnotation }>();
const emit = defineEmits<{
    (e: "change"): void;
}>();
const key = ref(0);

const createAnnotationLocation = ref({
    sourceId: 0,
    kind: AnnotationKind.Item,
});

// const item = computed(() => props.item);
const createItemAnnotationDialogDisplay = ref(false);
const createItemValueAnnotationDialogDisplay = ref(false);
const createOptionAnnotationDialogDisplay = ref(false);
const createUnitAnnotationDialogDisplay = ref(false);

const disableCreateAnnotation = computed(() => {
    return activeAnnoationVersionId.value ? false : true;
});

function isLabel(item: ItemAnnotation): boolean {
    return item.itemType?.name !== "Label";
}

function showCreateItemAnnotationDialog(id: number) {
    createAnnotationLocation.value.sourceId = id;
    createAnnotationLocation.value.kind = AnnotationKind.Item;
    createItemAnnotationDialogDisplay.value = true;
}

function showCreateItemValueAnnotationDialog(id: number) {
    createAnnotationLocation.value.sourceId = id;
    createAnnotationLocation.value.kind = AnnotationKind.ItemValue;
    createItemValueAnnotationDialogDisplay.value = true;
}

function showCreateOptionAnnotationDialog(id: number) {
    createAnnotationLocation.value.sourceId = id;
    createAnnotationLocation.value.kind = AnnotationKind.Option;
    createOptionAnnotationDialogDisplay.value = true;
}

function showCreateUnitAnnotationDialog(id: number) {
    createAnnotationLocation.value.sourceId = id;
    createAnnotationLocation.value.kind = AnnotationKind.Unit;
    createUnitAnnotationDialogDisplay.value = true;
}

function change() {
    key.value++;
    emit("change");
}

function createAnnotation() {
    change();
    hideCreateAnnotationDialog();
}

function hideCreateAnnotationDialog() {
    createItemAnnotationDialogDisplay.value = false;
    createItemValueAnnotationDialogDisplay.value = false;
    createOptionAnnotationDialogDisplay.value = false;
    createUnitAnnotationDialogDisplay.value = false;
}

function addItemToMultiSelector(itemId: number) {
    multiSelector.value.itemId.add(itemId);
}

function removeItemToMultiSelector(itemId: number) {
    multiSelector.value.itemId.delete(itemId);
}

function addOptionToMultiSelector(optionId: number) {
    multiSelector.value.optionId.add(optionId);
}

function removeOptionToMultiSelector(optionId: number) {
    multiSelector.value.optionId.delete(optionId);
}

function addUnitToMultiSelector(unitId: number) {
    multiSelector.value.unitId.add(unitId);
}

function removeUnitToMultiSelector(unitId: number) {
    multiSelector.value.unitId.delete(unitId);
}

function addItemValueToMultiSelector(unitId: number) {
    multiSelector.value.itemValueId.add(unitId);
}

function removeItemValueToMultiSelector(unitId: number) {
    multiSelector.value.itemValueId.delete(unitId);
}

</script>

<template>
    <el-card>
        <div class="item-detail">
            <div class="item-left">
                <el-button v-if="!multiOperation" :disabled="disableCreateAnnotation" class="left-button"
                    @click="() => { showCreateItemAnnotationDialog(item.id) }" size="small" type="primary" text>
                    <el-icon>
                        <Plus />
                    </el-icon>
                </el-button>
                <el-button v-else :disabled="disableCreateAnnotation" class="left-button"
                    @click="() => { multiSelector.itemId.has(item.id) ? removeItemToMultiSelector(item.id) : addItemToMultiSelector(item.id) }"
                    size="small" type="primary" text>
                    <el-icon v-if="multiSelector.itemId.has(item.id)">
                        <CircleCheckFilled />
                    </el-icon>
                    <el-icon v-else>
                        <Remove />
                    </el-icon>
                </el-button>
                <el-tag type="info" v-if="isLabel(item)" class="item-name" size="small">{{ item.name }}</el-tag>
                <el-text :type="isLabel(item) ? '' : 'info'" class="item-label">{{ item.label }}</el-text>
                <AnnotationTag @change="change" v-for="annotation in item.annotation" :annotation="annotation"
                    :order="getDomainOrderNumber(annotation.variable?.domainId)" :kind="AnnotationKind.Item" />
                <div v-if="item.itemOption">
                    <div v-for="option in item.itemOption">
                        <el-button v-if="!multiOperation" :disabled="disableCreateAnnotation" class="left-button"
                            @click="() => { showCreateOptionAnnotationDialog(option.id) }" size="small" type="warning"
                            text>
                            <el-icon>
                                <CirclePlusFilled />
                            </el-icon>
                        </el-button>
                        <el-button v-else :disabled="disableCreateAnnotation" class="left-button"
                            @click="() => { multiSelector.optionId.has(option.id) ? removeOptionToMultiSelector(option.id) : addOptionToMultiSelector(option.id) }"
                            size="small" type="warning" text>
                            <el-icon v-if="multiSelector.optionId.has(option.id)">
                                <CircleCheckFilled />
                            </el-icon>
                            <el-icon v-else>
                                <Remove />
                            </el-icon>
                        </el-button>
                        <el-text class="item-label">{{ option.optionDisplay }}</el-text>
                        <AnnotationTag :key="key" @change="change" v-for="annotation in option.annotation"
                            :annotation="annotation" :order="getDomainOrderNumber(annotation.variable?.domainId)"
                            :kind="AnnotationKind.Option" />
                    </div>
                </div>
            </div>
            <div class="item-right">
                <div v-if="item.itemDefualtValue.value.length > 0">
                    <div>
                        <el-text type="info" class="item-label">
                            {{ item.itemDefualtValue.value }}
                        </el-text>
                        <el-button v-if="!multiOperation" :disabled="disableCreateAnnotation" class="right-button"
                            @click="() => { showCreateItemValueAnnotationDialog(item.id) }" size="small" type="warning"
                            text>
                            <el-icon>
                                <CirclePlusFilled />
                            </el-icon>
                        </el-button>
                        <el-button v-else :disabled="disableCreateAnnotation" class="right-button"
                            @click="() => { multiSelector.itemValueId.has(item.id) ? removeItemValueToMultiSelector(item.id) : addItemValueToMultiSelector(item.id) }"
                            size="small" type="warning" text>
                            <el-icon v-if="multiSelector.itemValueId.has(item.id)">
                                <CircleCheckFilled />
                            </el-icon>
                            <el-icon v-else>
                                <Remove />
                            </el-icon>
                        </el-button>
                    </div>
                    <div class="annotation" v-for="annotation in item.itemDefualtValue.annotation">
                        <AnnotationTag @change="change" :annotation="annotation"
                            :order="getDomainOrderNumber(annotation.variable?.domainId)"
                            :kind="AnnotationKind.ItemValue" />
                    </div>
                </div>
                <div v-if="item.itemUnit && item.itemUnit.length > 0">
                    <div v-for="unit in item.itemUnit">
                        <el-text v-for="unit in item.itemUnit" type="info" class="item-label">
                            {{ unit.name }}
                        </el-text>
                        <el-button v-if="!multiOperation" :disabled="disableCreateAnnotation" class="right-button"
                            @click="() => { showCreateUnitAnnotationDialog(unit.id) }" size="small" type="warning" text>
                            <el-icon>
                                <CirclePlusFilled />
                            </el-icon>
                        </el-button>
                        <el-button v-else :disabled="disableCreateAnnotation" class="right-button"
                            @click="() => { multiSelector.unitId.has(unit.id) ? removeUnitToMultiSelector(unit.id) : addUnitToMultiSelector(unit.id) }"
                            size="small" type="warning" text>
                            <el-icon v-if="multiSelector.unitId.has(unit.id)">
                                <CircleCheckFilled />
                            </el-icon>
                            <el-icon v-else>
                                <Remove />
                            </el-icon>
                        </el-button>
                        <div>
                            <div class="annotation" v-for="annotation in unit.annotation">
                                <AnnotationTag @change="change" :annotation="annotation"
                                    :order="getDomainOrderNumber(annotation.variable?.domainId)"
                                    :kind="AnnotationKind.Unit" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </el-card>
    <el-dialog destroy-on-close v-model="createItemAnnotationDialogDisplay" title="Create New Annotation for Item"
        width="1200px">
        <CreateOrUpdateAnnotation @submit="createAnnotation" @cancel="hideCreateAnnotationDialog"
            :annotation="undefined" :kind="AnnotationKind.Item" :location="createAnnotationLocation" />
    </el-dialog>
    <el-dialog destroy-on-close v-model="createOptionAnnotationDialogDisplay" title="Create New Annotation for Option"
        width="1200px">
        <CreateOrUpdateAnnotation @submit="createAnnotation" @cancel="hideCreateAnnotationDialog"
            :annotation="undefined" :kind="AnnotationKind.Option" :location="createAnnotationLocation" />
    </el-dialog>
    <el-dialog destroy-on-close v-model="createItemValueAnnotationDialogDisplay"
        title="Create New Annotation for Item Value" width="1200px">
        <CreateOrUpdateAnnotation @submit="createAnnotation" @cancel="hideCreateAnnotationDialog"
            :annotation="undefined" :kind="AnnotationKind.ItemValue" :location="createAnnotationLocation" />
    </el-dialog>
    <el-dialog destroy-on-close v-model="createUnitAnnotationDialogDisplay" title="Create New Annotation for Unit"
        width="1200px">
        <CreateOrUpdateAnnotation @submit="createAnnotation" @cancel="hideCreateAnnotationDialog"
            :annotation="undefined" :kind="AnnotationKind.Unit" :location="createAnnotationLocation" />
    </el-dialog>
</template>

<style scoped>
.item-name {
    width: 75px;
    margin-right: 5px;
}

.item-label {
    margin: 0 5px 0 0;
}

.item-detail {
    display: flex;
}

.item-detail .item-left {
    /* float: left; */
    width: 75%;
}

.item-detail .item-right {
    width: 25%;
    text-align: right;
}

.annotation {
    margin-bottom: 2px;
}

.right-button {
    margin-bottom: 5px;
}

.left-button {
    margin-right: 5px;
}

/* .item-detail .item-right {
    float: right;
} */
</style>