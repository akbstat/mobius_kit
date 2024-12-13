<script lang="ts" setup>
import { computed, onMounted, Ref, ref } from 'vue';
import { Event, EventMode } from "./entity/reflector.ts";
import Preview from './Preview.vue';
import Config from './Config.vue';
import AddVisit from './AddVisit.vue';
import AddForm from './AddForm.vue';
import ModifyForm from './ModifyForm.vue';
import ModifyVisit from './ModifyVisit.vue';
import Complete from './Complete.vue';
import SaveConfig from './SaveConfig.vue';
import { listEvents } from '../../api/reflector/reflector';
import { useReflector } from '../../store/reflector.ts';
import { storeToRefs } from 'pinia';

let { event } = storeToRefs(useReflector());
const eventMode: Ref<EventMode> = ref(EventMode.FORM);
const data = computed(() => {
    if (!event) {
        return [];
    }
    return event.value.listItem();
});

const configDisplay = ref(false);
const addFormDisplay = ref(false);
const addVisitDisplay = ref(false);
const modifyFormDisplay = ref(false);
const modifyVisitDisplay = ref(false);
const completeDisplay = ref(false);
const saveConfigDisplay = ref(false);
const removeItemDisplay = ref(false);
const removeTarget = ref("");
const activeId = ref(0);
const previewRenderKey = ref(0);
const removeItemId: Ref<number[]> = ref([]);

function switchKind() {
    eventMode.value = eventMode.value === EventMode.VISIT ? EventMode.FORM : EventMode.VISIT;
    event.value.switchBindingMode();
    activeId.value = 0;
}

function showConfig() {
    configDisplay.value = true;
}

function showAddItem() {
    if (eventMode.value === "Visit") {
        addVisitDisplay.value = true;
        return;
    }
    addFormDisplay.value = true;
}

function showModifyItem(id: number) {
    activeId.value = id;
    if (eventMode.value === "Visit") {
        modifyVisitDisplay.value = true;
        return;
    }
    modifyFormDisplay.value = true;
}

function closeModifyForm() {
    previewRenderKey.value++;
    modifyFormDisplay.value = false;
}

function run() {
    completeDisplay.value = true;
}

function saveConfig() {
    saveConfigDisplay.value = true;
}

function removeItemConfirm(target: number | undefined) {
    if (target === undefined) {
        removeTarget.value = `All ${eventMode.value}`;
        removeItemId.value = data.value.map(item => item.id);
    } else {
        removeTarget.value = event.value.itemName(target);
        removeItemId.value = [target];
    }
    removeItemDisplay.value = true;
}

function removeItem() {
    removeItemId.value.forEach(id => {
        event.value.removeItem(id);
    });
    previewRenderKey.value++;
    removeItemDisplay.value = false;
}

function removeItemCancel() {
    removeItemId.value = [];
    removeItemDisplay.value = false;
}

function moveUp(row: number) {
    if (row < 1) {
        return;
    }
    const front = data.value[row - 1];
    const back = data.value[row];
    event.value.swapItem(front.id, back.id);
    previewRenderKey.value++;
}

function moveDown(row: number) {
    if (row > data.value.length - 1) {
        return;
    }
    const front = data.value[row];
    const back = data.value[row + 1];
    event.value.swapItem(front.id, back.id);
    previewRenderKey.value++;
}

onMounted(async () => {
    const { form, visit, binding } = await listEvents();
    event.value = new Event(form, visit, binding, eventMode.value);
    previewRenderKey.value++;
});

</script>

<template>
    <el-container>
        <el-aside class="preview-module">
            <Preview :key="previewRenderKey" />
        </el-aside>
        <el-main class="item-module">
            <el-container>
                <el-header class="item-module-header ">
                    <div class="config-bar">
                        <el-button @click="switchKind" type="primary" class="kind" plain>
                            {{ event.mode }}
                        </el-button>
                        <el-button @click="saveConfig" class="config" type="primary" plain>
                            <el-icon>
                                <CollectionTag />
                            </el-icon>
                        </el-button>
                        <el-button @click="showConfig" class="config" type="primary" plain>
                            <el-icon>
                                <Setting />
                            </el-icon>
                        </el-button>
                        <el-button @click="run" class="config" type="primary" plain>
                            <el-icon>
                                <VideoPlay />
                            </el-icon>
                        </el-button>
                        <el-button @click="() => { removeItemConfirm(undefined) }" class="config" type="danger" plain>
                            <el-icon>
                                <Delete />
                            </el-icon>
                        </el-button>
                    </div>
                </el-header>
                <el-main style="padding: 0; margin: 0">
                    <el-table :data="data" height="620px">
                        <el-table-column label="Item" width="264">
                            <template #default="scope">
                                <el-tooltip effect="dark" placement="left" :content="scope.row.item">
                                    <el-tag class="item-tag">{{ scope.row.item }}</el-tag>
                                </el-tooltip>
                            </template>
                        </el-table-column>
                        <el-table-column label="">
                            <template #header>
                                <el-button @click="showAddItem" class="item-button header" type="primary" link>
                                    <el-icon>
                                        <DocumentAdd />
                                    </el-icon>
                                </el-button>
                            </template>
                            <template #default="scope">
                                <el-button @click="() => { moveUp(scope.$index) }" class="item-button" type="info" link>
                                    <el-icon>
                                        <CaretTop />
                                    </el-icon>
                                </el-button>
                                <el-button @click="() => { moveDown(scope.$index) }" class="item-button" type="info"
                                    link>
                                    <el-icon>
                                        <CaretBottom />
                                    </el-icon>
                                </el-button>
                                <el-button @click="() => { showModifyItem(scope.row.id) }" class="item-button"
                                    type="primary" link>
                                    <el-icon>
                                        <Edit />
                                    </el-icon>
                                </el-button>
                                <el-button @click="() => { removeItemConfirm(scope.row.id) }" class="item-button"
                                    type="danger" link>
                                    <el-icon>
                                        <Delete />
                                    </el-icon>
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-main>
            </el-container>
        </el-main>
    </el-container>
    <el-drawer size="50%" v-model="configDisplay" title="Configuration">
        <Config />
    </el-drawer>
    <el-dialog v-model="addVisitDisplay" title="Create New Visit" draggable>
        <AddVisit />
    </el-dialog>
    <el-dialog v-model="addFormDisplay" title="Create New Form" draggable>
        <AddForm />
    </el-dialog>
    <el-drawer direction="ltr" size="69.5%" v-model="modifyFormDisplay" title="Modify Form" destroy-on-close>
        <ModifyForm :id="activeId" @close="closeModifyForm" />
    </el-drawer>
    <el-drawer direction="ltr" size="69.5%" v-model="modifyVisitDisplay" title="Modify Visit" destroy-on-close>
        <ModifyVisit :id="activeId" />
    </el-drawer>
    <el-dialog v-model="completeDisplay" draggable title="Complete">
        <Complete />
    </el-dialog>
    <el-dialog v-model="saveConfigDisplay" draggable title="Save Configuration">
        <SaveConfig />
    </el-dialog>
    <el-dialog v-model="removeItemDisplay" draggable :title="`Remove ${eventMode}`">
        <el-text>
            Remove
            <el-text type="danger">{{ removeTarget }}</el-text>
            ?
        </el-text>
        <div style="margin-top: 30px;">
            <el-button @click="removeItem" type="primary" plain>
                <el-icon>
                    <Check />
                </el-icon>
            </el-button>
            <el-button @click="removeItemCancel" type="danger" plain>
                <el-icon>
                    <Close />
                </el-icon>
            </el-button>
        </div>
    </el-dialog>
</template>

<style scoped>
.item-module {
    padding: 0;
    margin: 0 0 0 3px
}

.item-module-header {
    padding: 0;
    margin: 2px 0 2px 0;
    height: auto;
}

.config {
    height: auto;
    width: 40px;
    margin-left: 2px;
    float: right;
}

.config-bar {
    display: flex;
}

.item-button {
    width: 15px;
}

.item-button.header {
    float: right
}

.item-tag {
    width: 230px;
    overflow: hidden;
    text-overflow: ellipsis;
    justify-content: left;
}

.kind {
    height: 34px;
    width: 295px;
    margin-right: 2px;
}

.preview-module {
    width: 65%;
}
</style>