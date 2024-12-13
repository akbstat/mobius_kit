<script lang="ts" setup>
import { onMounted, Ref, ref } from 'vue'; import { useReflector } from '../../store/reflector.ts';
import { storeToRefs } from 'pinia';
import { Form } from "../../api/reflector/reflector";

let { event } = storeToRefs(useReflector());
const { id } = defineProps<{ id: number }>();
const name = ref("");
const form: Ref<Form[]> = ref([]);
const options = ref([{ id: "v1", name: "人口统计学资料" }, { id: "v2", name: "知情同意书" }, { id: "v3", name: "湿疹面积和严重程度指数（EASI）评估" }, { id: "v4", name: "访视日期" }, { id: "v5", name: "人口统计学资料" }, { id: "v6", name: "人口统计学资料-湿疹面积和严重程度指数（EASI）评估" }]);
const selected: Ref<number[]> = ref([]);
const removeDialogDisplay = ref(false);
const runningRecordDisplay = ref(false);
const removeTarget = ref("");

function removeForm(target: string) {
    if (target.length > 0) {
        removeTarget.value = target;
    } else {
        removeTarget.value = "All Form";
    }
    removeDialogDisplay.value = true;
}

function moveToRunningRecords() {
    runningRecordDisplay.value = true;
}

onMounted(() => {
    const data = event.value.visitDetail(id);
    if (data) {
        form.value = data.form;
        name.value = data.name;
    }
});
</script>

<template>
    <el-form label-width="auto">
        <el-form-item label="Visit Name">
            <el-input v-model="name" clearable />
        </el-form-item>
        <el-form-item label=" ">
            <el-button @click="moveToRunningRecords" class="running-record" plain type="primary" link>
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
                    <el-button @click="() => { removeForm('') }" class="item-button" type="danger" link>
                        <el-icon>
                            <Delete />
                        </el-icon>
                    </el-button>
                </div>
            </template>
            <template #default="scope">
                <div class="operation">
                    <el-button @click="() => { removeForm(scope.row.name) }" class="item-button" type="danger" link>
                        <el-icon>
                            <Delete />
                        </el-icon>
                    </el-button>
                </div>
            </template>
        </el-table-column>
    </el-table>
    <div class="new-item">
        <el-select multiple v-model="selected" class="selection" collapse-tags placeholder="Select Form" clearable>
            <el-option v-for="option in options" :key="option.id" :value="option.id" :label="option.name" />
        </el-select>
        <el-button class="add-buttom" type="primary" plain>
            <el-icon>
                <Plus />
            </el-icon>
        </el-button>
    </div>
    <div class="close">
        <el-button type="primary" plain>
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
            <el-button type="primary" plain>
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
    <el-dialog v-model="runningRecordDisplay" title="Move to Running Records" draggable>
        Following forms will be move to <el-text type="primary">Running Records</el-text>, continue?
        <el-scrollbar height="300px">
            <el-tag class="item" v-for="d in form" type="">{{ d.name }}</el-tag>
        </el-scrollbar>
        <div class="close">
            <el-button type="primary" plain>
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