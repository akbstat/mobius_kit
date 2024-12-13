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
            visit.value.sort((x, y) => x.id - y.id)
        }
    });
    allOptions.value = allOptions.value.filter(o => !selected.value.includes(o.id));
    selected.value = [];
}

function updateForm() {
    event.value.updateForm({ id, name: name.value, page: page.value });
    event.value.bind(id, visitId.value);
    emit("close");
}

function close() {
    emit("close");
}

onMounted(() => {
    const data = event.value.formDetail(id);
    if (data) {
        visit.value = data.visit;
        name.value = data.name;
        page.value = data.page;
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
            <el-input v-model="name" clearable />
        </el-form-item>
        <el-form-item label="Page">
            <el-input-number v-model="page" size="small" />
        </el-form-item>
    </el-form>
    <el-table :data="visit" max-height="365">
        <el-table-column label="Visit" width="610">
            <template #default="scope">
                <el-tag class="item">
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
        <el-select multiple v-model="selected" class="selection" collapse-tags placeholder="Select Visit" clearable>
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
</style>