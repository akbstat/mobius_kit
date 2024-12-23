<script lang="ts" setup>
import { computed, onMounted, Ref, ref } from 'vue';
import { useReflector } from '../../store/reflector.ts';
import { storeToRefs } from 'pinia';
import { Visit } from "../../api/reflector/reflector";
const emit = defineEmits<{ (e: "close"): void }>();
const { id } = defineProps<{ id: number }>();
const { event } = storeToRefs(useReflector());
const name = ref("");
const page = ref(0);
const order = ref(0);
const visit: Ref<Visit[]> = ref([]);
const visitId = computed(() => {
    return visit.value.map(v => v.id);
});
const options = computed(() => {
    return allOptions.value.filter(o => !visitId.value.includes(o.id));
});
const allOptions: Ref<{ id: number, label: string }[]> = ref([]);
const selected: Ref<number[]> = ref([]);
const removeDialogDisplay = ref(false);
const removeTarget = ref("");
const removeId: Ref<number[]> = ref([]);
const moveToRunningRecordsDisplay = ref(false);
const moveFormToTopDisplay = ref(false);

function removeVisitConfirm(target: number | undefined) {
    if (target !== undefined) {
        const visitName = event.value.visit.get(target);
        removeTarget.value = visitName ? visitName.name : "";
        removeId.value = [target];
    } else {
        removeTarget.value = "All Visit";
        removeId.value = visitId.value;
    }
    removeDialogDisplay.value = true;
}


function removeVisit() {
    visit.value = visit.value.filter(v => !removeId.value.includes(v.id));
    removeId.value = [];
    removeDialogDisplay.value = false;
}

function removeCancel() {
    removeId.value = [];
    removeDialogDisplay.value = false;
}

function addVisit() {
    selected.value.forEach(id => {
        const newVisit = event.value.visit.get(id);
        if (newVisit) {
            visit.value.push(newVisit);
            visit.value.sort((x, y) => x.order - y.order)
        }
    });
    // allOptions.value = allOptions.value.filter(o => !selected.value.includes(o.id));
    selected.value = [];
}

function updateForm() {
    event.value.updateForm({ id, name: name.value, page: page.value, order: order.value });
    event.value.bind(id, visitId.value);
    emit("close");
}

function close() {
    emit("close");
}

function itemTagType(id: number): string {
    if (id === event.value.runningId) {
        return "warning";
    }
    return "primary";
}

function moveToRunningRecordsConfirm() {
    moveToRunningRecordsDisplay.value = true;
}

function moveToRunningRecordsCancal() {
    moveToRunningRecordsDisplay.value = false;
}

function moveToRunningRecords() {
    event.value.moveFormToRunning(id);
    moveToRunningRecordsDisplay.value = false;
    emit("close");
}

function moveFormToTopConfirm() {
    moveFormToTopDisplay.value = true;
}

function moveFormToTopCancel() {
    moveFormToTopDisplay.value = false;
}


function moveFormToTop() {
    event.value.swapFormToTop(id);
    moveFormToTopDisplay.value = false;
    emit("close");
}


onMounted(() => {
    const data = event.value.formDetail(id);
    if (data) {
        visit.value = data.visit;
        name.value = data.name;
        page.value = data.page;
        order.value = data.order;
    }
    allOptions.value = event.value.listVisit().map(v => {
        const { id, item } = v;
        return { id, label: item };
    });
});
</script>

<template>
    <el-form label-width="auto">
        <el-form-item label="Form Name">
            <el-input class="form-name-input" v-model="name" clearable />
            <div>
                <el-button @click="moveFormToTopConfirm" class="move-button" type="primary" plain link>
                    <el-icon>
                        <Upload />
                    </el-icon>
                </el-button>
            </div>
        </el-form-item>
        <el-form-item label="Page">
            <el-input-number v-model="page" size="small" />
        </el-form-item>
        <el-form-item label=" ">
            <el-button @click="moveToRunningRecordsConfirm" class="running" plain type="primary" link>
                Move to Running Records
            </el-button>
        </el-form-item>
    </el-form>
    <el-table :data="visit" max-height="315">
        <el-table-column label="Visit" width="610">
            <template #default="scope">
                <el-tag :type="itemTagType(scope.row.id)" class="item">
                    {{ scope.row.name }}
                </el-tag>
            </template>
        </el-table-column>
        <el-table-column>
            <template #header>
                <div class="operation">
                    <el-button @click="() => { removeVisitConfirm(undefined) }" class="item-button" type="danger" link>
                        <el-icon>
                            <Delete />
                        </el-icon>
                    </el-button>
                </div>
            </template>
            <template #default="scope">
                <div class="operation">
                    <el-button @click="() => { removeVisitConfirm(scope.row.id) }" class="item-button" type="danger"
                        link>
                        <el-icon>
                            <Delete />
                        </el-icon>
                    </el-button>
                </div>
            </template>
        </el-table-column>
    </el-table>
    <div class="new-item">
        <el-select filterable multiple v-model="selected" class="selection" collapse-tags placeholder="Select Visit"
            clearable>
            <el-option v-for="option in options" :key="option.id" :value="option.id" :label="option.label" />
        </el-select>
        <el-button @click="addVisit" class="add-buttom" type="primary" plain>
            <el-icon>
                <Plus />
            </el-icon>
        </el-button>
    </div>
    <div class="close">
        <el-button @click="updateForm" type="primary" plain>
            <el-icon>
                <Check />
            </el-icon>
        </el-button>
        <el-button @click="close" type="danger" plain>
            <el-icon>
                <Close />
            </el-icon>
        </el-button>
    </div>
    <el-dialog v-model="removeDialogDisplay" title="Remove Visit" draggable>
        <div>
            <el-text>Remove
                <el-text type="danger">
                    {{ removeTarget }}
                </el-text>
                from
                <el-text type="primary">
                    {{ name }}
                </el-text>
                ?
            </el-text>
        </div>
        <div class="close">
            <el-button @click="removeVisit" type="primary" plain>
                <el-icon>
                    <Check />
                </el-icon>
            </el-button>
            <el-button @click="removeCancel" type="danger" plain>
                <el-icon>
                    <Close />
                </el-icon>
            </el-button>
        </div>
    </el-dialog>
    <el-dialog v-model="moveToRunningRecordsDisplay" title="Move Form to Running Records">
        <el-text type="danger">{{ name }}</el-text> will be decoupled from other visits, continue?
        <div class="dialog-confirm">
            <el-button @click="moveToRunningRecords" type="primary" plain>
                <el-icon>
                    <Check />
                </el-icon>
            </el-button>
            <el-button @click="moveToRunningRecordsCancal" type="danger" plain>
                <el-icon>
                    <Close />
                </el-icon>
            </el-button>
        </div>
    </el-dialog>
    <el-dialog v-model="moveFormToTopDisplay" title="Move Form to Top">
        <el-text type="danger">{{ name }}</el-text> will be move to top position, continue?
        <div class="dialog-confirm">
            <el-button @click="moveFormToTop" type="primary" plain>
                <el-icon>
                    <Check />
                </el-icon>
            </el-button>
            <el-button @click="moveFormToTopCancel" type="danger" plain>
                <el-icon>
                    <Close />
                </el-icon>
            </el-button>
        </div>
    </el-dialog>
</template>

<style scoped>
.page {
    float: right;
}

.item {
    width: 580px;
    justify-content: left;
}

.operation {
    float: right;
}

.new-item {
    margin-top: 20px;
}

.selection {
    width: 94%;
}

.add-buttom {
    width: auto;
    margin-left: 5px;
}

.close {
    margin-top: 30px
}

.running {
    width: 180px;
    justify-content: left;
}

.dialog-confirm {
    margin-top: 20px;
}

.form-name-input {
    width: 92.5%;
}

.move-button {
    width: 20px;
    margin-left: 5px;
}
</style>