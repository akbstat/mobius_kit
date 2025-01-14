<script lang="ts" setup>
import { computed, onMounted, Ref, ref } from 'vue'; import { useReflector } from '../../store/reflector.ts';
import { storeToRefs } from 'pinia';
import { Form } from "../../api/reflector/reflector";
const emit = defineEmits<{ (e: "close"): void }>();
let { event } = storeToRefs(useReflector());
const { id } = defineProps<{ id: number }>();
const name = ref("");
const order = ref(0);
const form: Ref<Form[]> = ref([]);
const formId = computed(() => {
    return form.value.map(f => f.id);
});
const options = computed(() => {
    return allOptions.value.filter(o => !formId.value.includes(o.id));
});
const isRunning = computed(() => {
    return id === event.value.runningId;
});
const allOptions: Ref<{ id: number, label: string }[]> = ref([]);
const selected: Ref<number[]> = ref([]);
const removeDialogDisplay = ref(false);
const runningRecordDisplay = ref(false);
const removeTarget = ref("");
const removeId: Ref<number[]> = ref([]);


function removeFormConfirm(target: number | undefined) {
    if (target !== undefined) {
        const visitName = event.value.form.get(target);
        removeTarget.value = visitName ? visitName.name : "";
        removeId.value = [target];
    } else {
        removeTarget.value = "All Form";
        removeId.value = formId.value;
    }
    removeDialogDisplay.value = true;
}

function removeForm() {
    form.value = form.value.filter(f => !removeId.value.includes(f.id));
    removeId.value = [];
    removeDialogDisplay.value = false;
}

function moveToRunningRecordsConfirm() {
    runningRecordDisplay.value = true;
}

function moveToRunningRecords() {
    event.value.moveVisitToRunning(id);
    runningRecordDisplay.value = false;
    emit("close");
}

function removeCancel() {
    removeId.value = [];
    removeDialogDisplay.value = false;
}

function addForm() {
    selected.value.forEach(id => {
        const newForm = event.value.form.get(id);
        if (newForm) {
            form.value.push(newForm);
            form.value.sort((x, y) => x.order - y.order)
        }
    });
    selected.value = [];
}

function updateVisit() {
    event.value.updateVisit({ id, name: name.value, order: order.value });
    event.value.bind(id, formId.value);
    emit("close");
}


onMounted(() => {
    const data = event.value.visitDetail(id);
    if (data) {
        form.value = data.form;
        form.value = data.form;
        name.value = data.name;
        order.value = data.order;
    }
    allOptions.value = event.value.listForm().map(f => {
        const { id, item } = f;
        return { id, label: item };
    });
});
</script>

<template>
    <el-form label-width="auto">
        <el-form-item label="Visit Name">
            <el-input v-model="name" clearable />
        </el-form-item>
        <el-form-item label=" ">
            <el-button v-if="!isRunning" @click="moveToRunningRecordsConfirm" class="running-record" plain
                type="primary" link>
                Move to Running Records
            </el-button>
        </el-form-item>
    </el-form>
    <el-table :data="form" max-height="365">
        <el-table-column label="Form" width="610">
            <template #default="scope">
                <el-tag class="item">
                    {{ scope.row.name }}
                </el-tag>
            </template>
        </el-table-column>
        <el-table-column>
            <template #header>
                <div class="operation">
                    <el-button @click="() => { removeFormConfirm(undefined) }" class="item-button" type="danger" link>
                        <el-icon>
                            <Delete />
                        </el-icon>
                    </el-button>
                </div>
            </template>
            <template #default="scope">
                <div class="operation">
                    <el-button @click="() => { removeFormConfirm(scope.row.id) }" class="item-button" type="danger"
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
        <el-select filterable multiple v-model="selected" class="selection" collapse-tags placeholder="Select Form"
            clearable>
            <el-option v-for="option in options" :key="option.id" :value="option.id" :label="option.label" />
        </el-select>
        <el-button @click="addForm" class="add-buttom" type="primary" plain>
            <el-icon>
                <Plus />
            </el-icon>
        </el-button>
    </div>
    <div class="close">
        <el-button @click="updateVisit" type="primary" plain>
            <el-icon>
                <Check />
            </el-icon>
        </el-button>
        <el-button type="danger" plain>
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
            <el-button @click="removeForm" type="primary" plain>
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
    <el-dialog v-model="runningRecordDisplay" title="Move to Running Records" draggable>
        Following forms will be move to <el-text type="primary">Running Records</el-text>, continue?
        <el-scrollbar height="300px">
            <el-tag class="item" v-for="d in form" type="primary">{{ d.name }}</el-tag>
        </el-scrollbar>
        <div class="close">
            <el-button @click="moveToRunningRecords" type="primary" plain>
                <el-icon>
                    <Check />
                </el-icon>
            </el-button>
            <el-button type="danger" plain>
                <el-icon>
                    <Close />
                </el-icon>
            </el-button>
        </div>
    </el-dialog>
</template>

<style scoped>
.running-record {
    width: 180px;
    justify-content: left;
}

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
</style>