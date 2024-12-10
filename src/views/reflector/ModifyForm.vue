<script lang="ts" setup>
import { Ref, ref } from 'vue';
const name = ref("人口统计学资料")
const page = ref(1);
const data = ref([{ name: "V1筛选期（D-35 ~D-1）" }, { name: "V2第0周（D1）" }, { name: "V3第2周（D15）" }, { name: "V4第4周（D29）" }, { name: "V4第6周（D43）" }, { name: "V2第0周（D1）" }, { name: "V3第2周（D15）" }, { name: "V4第4周（D29）" }, { name: "V4第6周（D43）" }]);
const options = ref([{ id: "v1", name: "V1筛选期（D-35 ~D-1）" }, { id: "v2", name: "V2第0周（D1）" }, { id: "v3", name: "V3第2周（D15）" }, { id: "v4", name: "V4第4周（D29）" }, { id: "v5", name: "V4第6周（D43）" }]);
const selected: Ref<number[]> = ref([]);
const removeDialogDisplay = ref(false);
const removeTarget = ref("");
function removeVisit(target: string) {
    if (target.length > 0) {
        removeTarget.value = target;
    } else {
        removeTarget.value = "All Visit";
    }
    removeDialogDisplay.value = true;
}
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
    <el-table :data="data" max-height="365">
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
                    <el-button @click="() => { removeVisit('') }" class="item-button" type="danger" link>
                        <el-icon>
                            <Delete />
                        </el-icon>
                    </el-button>
                </div>
            </template>
            <template #default="scope">
                <div class="operation">
                    <el-button @click="() => { removeVisit(scope.row.name) }" class="item-button" type="danger" link>
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