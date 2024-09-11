<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Assignment, SpanMethodProps } from './assignment';
import { Search } from '@element-plus/icons-vue';

// a map to record the start row index and task count of each developer, for building the merge cell
let developerPositionInfo: Map<string, { start: number, count: number }> = new Map();
const { assignment } = defineProps<{ assignment: Assignment[] }>();
const searchValue = ref("");
const assignmentDisplay = computed(() => {
    if (searchValue.value.length > 0) {
        const filteredAssignments = assignment.filter(assign => {
            return assign.developer.toUpperCase().includes(searchValue.value.toUpperCase()) || assign.task.toUpperCase().includes(searchValue.value.toUpperCase());
        });
        updatePositionInfo(filteredAssignments);
        return filteredAssignments;
    }
    updatePositionInfo(assignment);
    return assignment;
});

function updatePositionInfo(assignments: Assignment[]) {
    developerPositionInfo = new Map();
    assignments.forEach((assign, index) => {
        const developer = assign.developer;
        if (!developerPositionInfo.get(developer)) {
            developerPositionInfo.set(developer, { start: index, count: 0 });
        }
        let posistionInfo = developerPositionInfo.get(developer);
        if (posistionInfo) {
            posistionInfo.count += 1;
            developerPositionInfo.set(developer, posistionInfo);
        }
    });
}

function spanMethod(props: SpanMethodProps): { rowspan: number, colspan: number } | undefined {
    const { row, rowIndex, columnIndex } = props;
    if (columnIndex === 0) {
        const devloper = row.developer;
        const posistionInfo = developerPositionInfo.get(devloper);
        if (posistionInfo) {
            if (rowIndex === posistionInfo.start) {
                return {
                    rowspan: posistionInfo.count,
                    colspan: 1,
                }
            } else {
                return {
                    rowspan: 0,
                    colspan: 0,
                }
            }
        }
    }
}

onMounted(() => {
    updatePositionInfo(assignment);
});

</script>

<template>
    <el-input clearable v-model="searchValue" placeholder="Search member or task" :prefix-icon="Search"
        style="margin-bottom: 10px; width: 250px;" />
    <el-table :span-method="spanMethod" :data="assignmentDisplay" max-height="400px">
        <el-table-column prop="developer" label="Member" width="250px" />
        <el-table-column prop="task" label="Task">
            <template #default="scope">
                <div>
                    <span style="width: 300px; display: inline-block;">{{ scope.row.task.split("|")[0] }}</span>
                    <el-tag size="small" style="width: 50px;"
                        :type="scope.row.task.split('|')[1] === 'dev' ? '' : 'warning'">{{
                            scope.row.task.split("|")[1] }}</el-tag>
                </div>
            </template>
        </el-table-column>
    </el-table>
</template>