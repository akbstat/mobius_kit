<script lang="ts" setup>
import { computed, Ref, ref } from 'vue';
import Preview from './Preview.vue';
import Config from './Config.vue';
import AddVisit from './AddVisit.vue';
import AddForm from './AddForm.vue';
import ModifyForm from './ModifyForm.vue';
import ModifyVisit from './ModifyVisit.vue';
import Complete from './Complete.vue';
import SaveConfig from './SaveConfig.vue';

const kindLabel: Ref<"Visit" | "Form"> = ref("Visit");
const data = computed(() => {
    if (kindLabel.value === "Visit") {
        return visits.value;
    }
    return forms.value;
});
const forms = ref([{ "item": "访视日期" }, { "item": "知情同意书" }, { "item": "人口统计学资料" }, { "item": "人口统计学资料-湿疹面积和严重程度指数（EASI）评估" }, { "item": "知情同意书" }, { "item": "人口统计学资料" }, { "item": "访视日期" }, { "item": "湿疹面积和严重程度指数（EASI）评估" }, { "item": "人口统计学资料" }, { "item": "访视日期" }, { "item": "知情同意书" }, { "item": "人口统计学资料" }, { "item": "访视日期" }, { "item": "知情同意书" }, { "item": "人口统计学资料" }, { "item": "访视日期" }, { "item": "知情同意书" }, { "item": "人口统计学资料" }, { "item": "湿疹面积和严重程度指数（EASI）评估" }, { "item": "知情同意书" }, { "item": "人口统计学资料" }])
const visits = ref([{ "item": "V1筛选期（D-35 ~D-1）" }, { "item": "V2第0周（D1）" }, { "item": "V3第2周（D15）" }, { "item": "V4第4周（D29）" }, { "item": "V4第6周（D43）" }, { "item": "V1筛选期（D-35 ~D-1）" }, { "item": "V2第0周（D1）" }, { "item": "V3第2周（D15）" }, { "item": "V4第4周（D29）" }, { "item": "V4第6周（D43）" }, { "item": "V1筛选期（D-35 ~D-1）" }, { "item": "V2第0周（D1）" }, { "item": "V3第2周（D15）" }, { "item": "V4第4周（D29）" }, { "item": "V4第6周（D43）" },])

const configDisplay = ref(false);
const addFormDisplay = ref(false);
const addVisitDisplay = ref(false);
const modifyFormDisplay = ref(false);
const modifyVisitDisplay = ref(false);
const completeDisplay = ref(false);
const saveConfigDisplay = ref(false);
const removeItemDisplay = ref(false);
const removeTarget = ref("");

function switchKind() {
    kindLabel.value = kindLabel.value === "Visit" ? "Form" : "Visit";
}

function showConfig() {
    configDisplay.value = true;
}

function showAddItem() {
    if (kindLabel.value === "Visit") {
        addVisitDisplay.value = true;
        return;
    }
    addFormDisplay.value = true;
}

function showModifyItem() {
    if (kindLabel.value === "Visit") {
        modifyVisitDisplay.value = true;
        return;
    }
    modifyFormDisplay.value = true;
}

function run() {
    completeDisplay.value = true;
}

function saveConfig() {
    saveConfigDisplay.value = true;
}

function removeItem(target: string) {
    if (target.length === 0) {
        removeTarget.value = `All ${kindLabel.value}`;
    } else {
        removeTarget.value = target;
    }
    removeItemDisplay.value = true;
}
</script>

<template>
    <el-container>
        <el-aside class="preview-module">
            <Preview />
        </el-aside>
        <el-main class="item-module">
            <el-container>
                <el-header class="item-module-header ">
                    <div class="config-bar">
                        <el-button @click="switchKind" type="primary" class="kind" plain>
                            {{ kindLabel }}
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
                        <el-button @click="() => { removeItem('') }" class="config" type="danger" plain>
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
                                <el-button class="item-button" type="info" link>
                                    <el-icon>
                                        <CaretTop />
                                    </el-icon>
                                </el-button>
                                <el-button class="item-button" type="info" link>
                                    <el-icon>
                                        <CaretBottom />
                                    </el-icon>
                                </el-button>
                                <el-button @click="showModifyItem" class="item-button" type="primary" link>
                                    <el-icon>
                                        <Edit />
                                    </el-icon>
                                </el-button>
                                <el-button @click="() => { removeItem(scope.row.item) }" class="item-button"
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
    <el-drawer direction="ltr" size="69.5%" v-model="modifyFormDisplay" title="Modify Form">
        <ModifyForm />
    </el-drawer>
    <el-drawer direction="ltr" size="69.5%" v-model="modifyVisitDisplay" title="Modify Visit">
        <ModifyVisit />
    </el-drawer>
    <el-dialog v-model="completeDisplay" draggable title="Complete">
        <Complete />
    </el-dialog>
    <el-dialog v-model="saveConfigDisplay" draggable title="Save Configuration">
        <SaveConfig />
    </el-dialog>
    <el-dialog v-model="removeItemDisplay" draggable :title="`Remove ${kindLabel}`">
        <el-text>
            Remove
            <el-text type="danger">{{ removeTarget }}</el-text>
            ?
        </el-text>
        <div style="margin-top: 30px;">
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