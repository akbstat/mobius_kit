<script lang="ts" setup>
import { Ref, ref } from 'vue';

const data = ref([
    { item: "访视日期", v0: true, v1: false, v2: false, v3: false, v4: false },
    { item: "知情同意书", v0: true, v1: false, v2: false, v3: false, v4: false },
    { item: "人口统计学资料", v0: true, v1: false, v2: true, v3: false, v4: false },
    { item: "湿疹面积和严重程度指数（EASI）评估", v0: true, v1: true, v2: true, v3: false, v4: true },
    { item: "知情同意书", v0: false, v1: false, v2: false, v3: true, v4: false },
    { item: "人口统计学资料", v0: false, v1: false, v2: true, v3: false, v4: false },
    { item: "访视日期", v0: true, v1: true, v2: false, v3: false, v4: false },
    { item: "知情同意书", v0: false, v1: false, v2: true, v3: false, v4: false },
    { item: "人口统计学资料", v0: true, v1: false, v2: false, v3: true, v4: false },
    { item: "湿疹面积和严重程度指数（EASI）评估", v0: true, v1: false, v2: false, v3: false, v4: false },
    { item: "知情同意书", v0: true, v1: false, v2: false, v3: false, v4: false },
    { item: "人口统计学资料", v0: true, v1: false, v2: true, v3: false, v4: false },
    { item: "访视日期", v0: false, v1: true, v2: true, v3: false, v4: true },
    { item: "湿疹面积和严重程度指数（EASI）评估", v0: true, v1: false, v2: false, v3: true, v4: false },
    { item: "人口统计学资料", v0: false, v1: false, v2: true, v3: false, v4: false },
    { item: "访视日期", v0: true, v1: true, v2: false, v3: false, v4: false },
    { item: "知情同意书", v0: false, v1: false, v2: true, v3: false, v4: false },
    { item: "人口统计学资料", v0: true, v1: false, v2: false, v3: true, v4: false },
]);

const visit = ref([
    { name: "v0", label: "V1筛选期（D-35 ~D-1）" },
    { name: "v1", label: "V2第0周（D1）" },
    { name: "v2", label: "V3第2周（D15）" },
    { name: "v3", label: "V4第4周（D29）" },
    { name: "v4", label: "V4第6周（D43）" },
]);

const form = ref([
    { name: "f0", label: "访视日期" },
    { name: "f1", label: "知情同意书" },
    { name: "f2", label: "人口统计学资料" },
    { name: "f3", label: "湿疹面积和严重程度指数（EASI）评估" },
]);

const visitSelected: Ref<null | string[]> = ref(null);
const formSeleted: Ref<null | string[]> = ref(null);

</script>

<template>
    <div class="selection-area">
        <el-select class="selection" multiple v-model="formSeleted" clearable collapse-tags filterable
            placeholder="Select Form">
            <el-option v-for="f in form" :key="f.name" :value="f.name" :label="f.label" />
        </el-select>
        <el-select class="selection tail" multiple v-model="visitSelected" clearable collapse-tags filterable
            placeholder="Select Visit">
            <el-option v-for="v in visit" :key="v.name" :value="v.name" :label="v.label" />
        </el-select>
    </div>
    <el-table class="event-table" :data="data" height="622px">
        <el-table-column fixed label="Form / Visit" prop="item" width="200">
            <template #default="scope">
                <el-tooltip effect="dark" placement="right" :content="scope.row.item">
                    <el-tag class="form" type="">
                        {{ scope.row.item }}
                    </el-tag>
                </el-tooltip>
            </template>
        </el-table-column>
        <el-table-column v-for="v in visit" width="115">
            <template #header>
                <el-tooltip effect="dark" placement="top" :content="v.label">
                    <el-tag class="visit" type="">
                        {{ v.label }}
                    </el-tag>
                </el-tooltip>
            </template>
            <template #default="scopes">
                <div class="check">
                    <el-icon v-if="scopes.row[v.name]">
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
    width: 91px;
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