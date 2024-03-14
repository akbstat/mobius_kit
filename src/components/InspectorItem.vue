<script setup lang="ts">
import Timeline from "./Timeline.vue";
import { Item, popContent } from '../views/inspector/project';
import { EpPropMergeType } from "element-plus/es/utils/vue/props/index.mjs";

interface Param {
    item: Item,
}

const props = defineProps<Param>()

const fileTagType = (status: string): EpPropMergeType<StringConstructor, "" | "success" | "warning" | "info" | "danger", unknown> | undefined => {
    switch (status) {
        case "Missing":
            return "info";
        case "Unexpected":
            return "warning";
        case "NotMatch":
            return "danger";
        default:
            return "";
    }
};


</script>

<template>
    <el-container>
        <el-aside width="250px">
            <Timeline :item="props.item" />
        </el-aside>
        <el-main>
            <el-row>
                <el-col :span="12">
                    <el-table :data="props.item.groups[0].files">
                        <el-table-column label="Name" prop="name">
                            <template #default="scope">
                                <el-text truncated class="w-500px">{{ scope.row.name }}</el-text>
                            </template>
                        </el-table-column>
                        <el-table-column label="Type">

                            <template #default="scope">
                                <el-popover trigger="hover" :content="popContent(scope.row.status)"
                                    placement="top-start" :width="300">
                                    <template #reference>
                                        <el-tag :type="fileTagType(scope.row.status)" :style="{ width: 70 + 'px' }">{{
                scope.row.kind
            }}</el-tag>
                                    </template>
                                </el-popover>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-col>
                <el-col :span="12">
                    <el-table :data="props.item.groups[1].files">
                        <el-table-column label="Name" prop="name">

                            <template #default="scope">
                                <el-text truncated class="w-500px">{{ scope.row.name }}</el-text>
                            </template>
                        </el-table-column>
                        <el-table-column label="Type">

                            <template #default="scope">
                                <el-popover trigger="hover" :content="popContent(scope.row.status)"
                                    placement="top-start" :width="300">
                                    <template #reference>
                                        <el-tag :type="fileTagType(scope.row.status)" :style="{ width: 70 + 'px' }">{{
                scope.row.kind
                                            }}</el-tag>
                                    </template>
                                </el-popover>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-col>
            </el-row>
        </el-main>
    </el-container>
</template>
