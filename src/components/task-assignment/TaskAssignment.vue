<script lang="ts" setup>
import { computed, ref, nextTick, onMounted } from 'vue';
import { ElMessage, TransferDirection, TransferKey, type InputInstance } from 'element-plus';
import Preview from './Preview.vue';
import { newAssignment, Assignment } from './assignment';

const assignmentPreviewDisplay = ref(false);
const developers = ref<string[]>([]);
const newDeveloper = ref("");
const currentDeveloper = ref("");
const transferTitles: [string, string] = ["Unassigned Task", "Assigned Task"];
const addMemberInputDisplay = ref(false);
const InputRef = ref<InputInstance>();
const assignment: Map<string, string[]> = new Map();

const props = defineProps<{ items: string[] }>();
const emit = defineEmits<{ (e: string, data: Assignment[]): void }>();
const assignedItems = ref<string[]>([]);
const items = ref<string[]>([]);
const options = computed(() => {
    return items.value.map(item => {
        return {
            key: item,
            label: item,
            disable: true,
        };
    })
});

function showDeveloperInput() {
    addMemberInputDisplay.value = true;
    nextTick(() => {
        InputRef.value!.input!.focus();
    })
}

function addDeveloper() {
    if (newDeveloper.value.length === 0) {
        addMemberInputDisplay.value = false;
        return;
    }
    if (developers.value.includes(newDeveloper.value)) {
        ElMessage.error(`Member ${newDeveloper.value} is already existed`);
    } else {
        developers.value.push(newDeveloper.value);
    }
    addMemberInputDisplay.value = false;
    assignment.set(newDeveloper.value, []);
    newDeveloper.value = "";
}

function removeDeveloper(developer: string) {
    developers.value.splice(developers.value.indexOf(developer), 1);
    currentDeveloper.value = "";
    assignment.delete(developer);
    assignedItems.value = [];
}

function developerTagType(developer: string): "" | "success" | "warning" | "info" | "danger" {
    if (currentDeveloper.value === developer) {
        return "success";
    }
    return "";
}

function switchDeveloper(developer: string) {
    ElMessage.success(`Switch to ${developer}`);
    currentDeveloper.value = developer;
    assignedItems.value = assignment.get(currentDeveloper.value) as string[];
    const itemsOfOtherDevelopers = Array.from(assignment.keys()).filter(developer => developer !== currentDeveloper.value).flatMap(key => assignment.get(key)) as string[];
    items.value = props.items.filter(item => !itemsOfOtherDevelopers.includes(item));
}
// (value: TransferKey[], direction: TransferDirection, movedKeys: TransferKey[]) => void
function handleChange(
    _keys: TransferKey[],
    direction: TransferDirection,
    movedKeys: TransferKey[]
) {
    const developer = currentDeveloper.value;
    let items = assignment.get(developer) as string[];
    items = items ? items : [];
    if (direction === "right") {
        if (developer.length > 0) {
            movedKeys.forEach(item => {
                items.push(item as string);
            })
        }
    } else {
        movedKeys.forEach(item => {
            const index = items.indexOf(item as string);
            if (index >= 0) {
                items.splice(index, 1);
            }
        })
    }
    assignment.set(developer, items);
}

function assignConfirm() {
    let developers = Array.from(assignment.keys());
    if (developers.length === 0) {
        return
    }
    const assignmentList: Assignment[] = [];
    developers.forEach(developer => {
        const tasks = assignment.get(developer);
        if (tasks && tasks.length > 0) {
            tasks.forEach(task => {
                assignmentList.push({ developer, task });
            })
        }
    });
    emit("change-assignment", assignmentList);
}

onMounted(() => {
    items.value = props.items
});

</script>

<template>
    <el-container>
        <el-header>
            <el-tag @click="switchDeveloper(developer)" key="developer" @close="removeDeveloper(developer)"
                :type="developerTagType(developer)" class="developerTag" closable size="large"
                v-for="developer in developers"> {{
                    developer
                }}</el-tag>
            <el-input ref="InputRef" v-model="newDeveloper" v-if="addMemberInputDisplay"
                style="width: 150px; margin-bottom: 5px;" clearable @keyup.enter="addDeveloper" @blur="addDeveloper" />
            <el-button v-else style="width: 150px; margin-bottom: 5px" @click="showDeveloperInput">
                <el-icon>
                    <Plus />
                </el-icon>
            </el-button>
        </el-header>
        <el-main>
            <div class="task">
                <el-transfer :titles="transferTitles" filterable v-model="assignedItems" :data="options"
                    @change="handleChange">
                    <template #default="{ option }">
                        <div>
                            <span style="width: 260px; display: inline-block;">{{ option.key.split("|")[0] }}</span>
                            <el-tag size="small" style="width: 40px;"
                                :type="option.key.split('|')[1] === 'dev' ? '' : 'warning'">{{
                                    option.key.split("|")[1] }}</el-tag>
                        </div>
                    </template>
                </el-transfer>
            </div>
        </el-main>
        <el-footer style="height: auto;">
            <el-button style="width: 100px;" type="primary" plain
                @click="() => { assignmentPreviewDisplay = true; }">Preview</el-button>
            <el-button style="width: 100px;" type="primary" plain @click="assignConfirm">Confirm</el-button>
        </el-footer>
    </el-container>
    <el-dialog draggable destroy-on-close title="Assignment Preview" v-model="assignmentPreviewDisplay" width="85%">
        <Preview :assignment="newAssignment(assignment)" />
    </el-dialog>
</template>

<style>
.task .el-transfer-panel__body {
    height: 400px;
}

.task .el-transfer-panel {
    width: 390px;
}

.developerTag {
    width: 150px;
    margin-right: 10px;
    cursor: pointer;
    margin-bottom: 5px;
}
</style>