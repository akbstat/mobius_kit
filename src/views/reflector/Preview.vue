<script lang="ts" setup>
import { computed, onMounted, Ref, ref } from 'vue';
import { useReflector } from '../../store/reflector.ts';
import { storeToRefs } from 'pinia';

let { event } = storeToRefs(useReflector());

const allRows: Ref<{
    id: number,
    label: string,
    [key: string]: any,
}[]> = ref([]);

const allHeaders: Ref<{
    id: number;
    field: string;
    label: string;
}[]> = ref([]);

const rows = computed(() => {
    return formSeleted.value.length === 0 ? allRows.value : allRows.value.filter(r => formSeleted.value.includes(r.id));
});
const headers = computed(() => {
    return visitSelected.value.length === 0 ? allHeaders.value : allHeaders.value.filter(h => visitSelected.value.includes(h.id));
});

const formOptions: Ref<{ id: number, label: string }[]> = ref([]);
const visitOptions: Ref<{ id: number, label: string }[]> = ref([]);

const visitSelected: Ref<number[]> = ref([]);
const formSeleted: Ref<number[]> = ref([]);
onMounted(() => {
    const { headers: h, rows: r } = event.value.preview();
    allHeaders.value = h;
    allRows.value = r;
    formOptions.value = r.map(row => {
        const { id, label } = row;
        return { id, label };
    });
    visitOptions.value = h.map(header => {
        const { id, label } = header;
        return { id, label };
    });
});
</script>

<template>
    <div class="selection-area">
        <el-select class="selection" multiple v-model="formSeleted" clearable collapse-tags filterable
            placeholder="Select Form">
            <el-option v-for="f in formOptions" :key="f.id" :value="f.id" :label="f.label" />
        </el-select>
        <el-select class="selection tail" multiple v-model="visitSelected" clearable collapse-tags filterable
            placeholder="Select Visit">
            <el-option v-for="v in visitOptions" :key="v.id" :value="v.id" :label="v.label" />
        </el-select>
    </div>
    <el-table class="event-table" :data="rows" height="622px">
        <el-table-column fixed label="Form / Visit" prop="item" width="200">
            <template #default="scope">
                <el-tooltip effect="dark" placement="right" :content="scope.row.label">
                    <el-tag class="form" type="">
                        {{ scope.row.label }}
                    </el-tag>
                </el-tooltip>
            </template>
        </el-table-column>
        <el-table-column v-for="header in headers" width="130">
            <template #header>
                <el-tooltip effect="dark" placement="top" :content="header.label">
                    <el-tag class="visit" type="">
                        {{ header.label }}
                    </el-tag>
                </el-tooltip>
            </template>
            <template #default="scopes">
                <div class="check">
                    <el-icon v-if="scopes.row[header.field]">
                        <StarFilled />
                    </el-icon>
                </div>
            </template>
        </el-table-column>
    </el-table>
</template>

<style scoped>
.form {
    width: 175px;
    overflow: hidden;
    text-overflow: ellipsis;
    justify-content: left;
}

.visit {
    width: 105px;
    overflow: hidden;
    text-overflow: ellipsis;
    justify-content: left;
}

.event-table {
    padding: 2px;
}

.check {
    display: flex;
    justify-content: center;
}

.selection-area {
    margin: 1.5px 0 1.5px 2px;
}

.selection {
    width: 49.5%;
}

.tail {
    margin-left: 0.5%;
}
</style>