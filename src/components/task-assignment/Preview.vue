<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Assignment } from './assignment';
import { Search } from '@element-plus/icons-vue';

// a map to record the start row index and task count of each developer, for building the merge cell
let developerPositionInfo: Map<string, { start: number, count: number }> = new Map();
const { assignment } = defineProps<{ assignment: Assignment[] }>();
const searchValue = ref("");
const assignmentDisplay = computed(() => {
    let filteredAssignments = assignment;
    if (searchValue.value.length > 0) {
        filteredAssignments = assignment.filter(assign => {
            return assign.developer.toUpperCase().includes(searchValue.value.toUpperCase()) || assign.task.toUpperCase().includes(searchValue.value.toUpperCase());
        }).sort((x, y) => x.developer < y.developer ? -1 : 1);
    }
    const result: { developer: string, tasks: string[] }[] = [];
    filteredAssignments.forEach((assign, index) => {
        if (index === 0 || assign.developer !== filteredAssignments[index - 1].developer) {
            result.push({ developer: assign.developer, tasks: [assign.task] });
        } else {
            result[result.length - 1].tasks.push(assign.task);
        }
    });
    return result;
});

// const assignmentDisplay = [{ developer: "jun.Lei", tasks: ["ta|qc", "ae|dev", "lb|dev"] }];

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


onMounted(() => {
    updatePositionInfo(assignment);
});

</script>

<template>
    <el-input clearable v-model="searchValue" placeholder="Search member or task" :prefix-icon="Search"
        style="margin-bottom: 10px; width: 250px;" />
    <el-table :data="assignmentDisplay" max-height="400px">
        <el-table-column prop="developer" label="Member" width="250px" />
        <el-table-column prop="tasks" label="Task">
            <template #default="scope">
                <el-space wrap>
                    <el-tag style="font-size: medium;" :type="task.split('|')[1] === 'dev' ? 'primary' : 'warning'"
                        v-for="task in scope.row.tasks">{{
                            task.split("|")[0] }}</el-tag>
                </el-space>
            </template>
        </el-table-column>
    </el-table>
</template>