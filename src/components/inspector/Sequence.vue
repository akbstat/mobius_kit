<script lang="ts" setup>
import { computed, onMounted, Ref, ref } from 'vue';
import { Group, SequenceDetail, SequenceDetailRequest, sequenceStatus, StatusKind, Timeline } from '../../api/inspector/inspector';
import { timelineNodeColor, groupTagType, statusColor, statusContent } from "./display";

const props = defineProps<{ param: SequenceDetailRequest, group: Group }>();
const { product, trial, purpose, kind, item, supp } = props.param;
const showProduction = ref(true);
const showValidation = ref(true);
const timeline: Ref<Timeline[]> = ref([]);
const detail: Ref<SequenceDetail[]> = ref([]);

const detailDisplay = computed(() => {
    const display: SequenceDetail[] = [];
    detail.value.forEach((d) => {
        const row = { ...d };
        row.group = [];
        d.group.forEach((g) => {
            if (showProduction.value && g.group === 'Production') {
                row.group.push(g);
            }
            if (showValidation.value && g.group === 'Validation') {
                row.group.push(g);
            }
        });
        if (row.group.length > 0) display.push(row);
    });
    return display;
});

const timelineDisplay = computed(() => {
    const display: Timeline[] = [];
    timeline.value.forEach((t) => {
        if (showProduction.value && t.group === 'Production') {
            display.push(t);
        }
        if (showValidation.value && t.group === 'Validation') {
            display.push(t);
        }
    });
    return display;
});

const totalStatus = computed(() => {
    let status = true;
    detailDisplay.value.forEach((d) => {
        d.group.forEach((g) => {
            if (g.status.kind !== StatusKind.Pass) status = false;
        });
    });
    return status;
});

onMounted(async () => {
    const data = await sequenceStatus({ product, trial, purpose, kind, item, supp });
    timeline.value = data.timeline;
    detail.value = data.detail;
    switch (props.group) {
        case Group.Production:
            showValidation.value = false;
            break;
        case Group.Validation:
            showProduction.value = false;
            break;
    }
});

</script>

<template>
    <el-container>
        <el-header class="header">
            <div class="title">
                <span>File Sequence Status of {{ item.toUpperCase() }}</span>
            </div>
            <div>
                <el-tag :type="totalStatus ? 'success' : 'danger'" class="status">{{ totalStatus ? 'Pass' : 'Failed'
                    }}</el-tag>
                <div class="group">
                    <el-checkbox v-model="showProduction" label="Production" size="large" />
                    <el-checkbox v-model="showValidation" label="Validation" size="large" />
                </div>
            </div>
        </el-header>
        <el-container>
            <el-aside width="200px">
                <el-scrollbar max-height="610" height="610">
                    <el-timeline class="timeline">
                        <el-timeline-item v-for="line in timelineDisplay" :timestamp="line.timestamp"
                            :color="timelineNodeColor(line.pass)" placement="top" size="normal">
                            <div class="item">
                                <div class="item-name">
                                    <el-text truncated>{{ line.item }}</el-text>
                                </div>
                                <div>
                                    <el-tag :type="groupTagType(line.group)" class="file-type-timeline">{{ line.kind
                                        }}</el-tag>
                                </div>
                            </div>
                        </el-timeline-item>
                    </el-timeline>
                </el-scrollbar>
            </el-aside>
            <el-main class="main-area">
                <el-table :data="detailDisplay">
                    <el-table-column label="Type" width="105">
                        <template #default="scope">
                            <el-tag class="file-type">{{ scope.row.kind }}</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="Filename" prop="item" width="105">
                        <template #default="scope">
                            <div style="padding-top: 7px;">
                                <div v-for="group in scope.row.group">
                                    <el-text truncated>{{ group.item }}</el-text>
                                </div>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="Group" width="120">
                        <template #default="scope">
                            <div v-for="group in scope.row.group" style="margin: 5px 0 5px 0;">
                                <el-tag :type="groupTagType(group.group)" class="group-tag">
                                    {{ group.group }}
                                </el-tag>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="Status">
                        <template #default="scope">
                            <div v-for="group in scope.row.group" style="margin: 5px 0 5px 0;">
                                <el-tag :type="statusColor(group.status)" class="file-status">
                                    {{ statusContent(group.status, true) }}
                                </el-tag>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </el-main>
        </el-container>
    </el-container>
</template>

<style scoped>
.main-area {
    padding: 20px 0 0 5px;
}

.title {
    margin-bottom: 10px;
}

.header {
    padding: 0;
    margin-bottom: 10px;
}

.status {
    width: 200px;
    margin-top: 7px;
}

.group {
    float: right;
    display: flex;
    justify-content: right;
}

.group-tag {
    width: 100px;
}

.timeline {
    margin-top: 35px;
    padding-left: 5px;
}

.file-type {
    width: 80px;
}


.file-type-timeline {
    width: 65px;
    margin-right: 5px;
}

.file-status {
    width: 180px;
}

.item {
    display: flex;
}

.item-name {
    width: 50%;
}
</style>