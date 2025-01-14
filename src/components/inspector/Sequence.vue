<script lang="ts" setup>
import { onMounted, Ref, ref } from 'vue';
import { Group, SequenceDetail, sequenceStatus, Timeline } from '../../api/inspector/inspector';
import { timelineNodeColor, groupTagType, statusColor } from "./display";


const showProduction = ref(true);
const showValidation = ref(true);
const timeline: Ref<Timeline[]> = ref([]);
const detail: Ref<SequenceDetail[]> = ref([]);

onMounted(async () => {
    const data = await sequenceStatus("");
    timeline.value = data.timeline;
    detail.value = data.detail;
});

</script>

<template>
    <el-container>
        <el-header class="header">
            <div class="title">
                <span>File Sequence Status of AE</span>
            </div>
            <el-tag type="danger" class="status">Failed: File missing</el-tag>
            <div class="group">
                <el-checkbox v-model="showProduction" label="Production" size="large" />
                <el-checkbox v-model="showValidation" label="Validation" size="large" />
            </div>
        </el-header>
        <el-container>
            <el-aside width="200px">
                <el-timeline class="timeline">
                    <el-timeline-item v-for="line in timeline" :timestamp="line.timestamp"
                        :color="timelineNodeColor(line.pass)" placement="top" size="normal">
                        <el-tag class="file-type-timeline">{{ line.kind }}</el-tag>
                        <el-tag round v-if="line.group === Group.Validation" type="warning" link size="small">v</el-tag>
                    </el-timeline-item>
                </el-timeline>
            </el-aside>
            <el-main class="main-area">
                <el-table :data="detail">
                    <el-table-column label="Filename" prop="item" />
                    <el-table-column label="Type">
                        <template #default="scope">
                            <el-tag class="file-type">{{ scope.row.kind }}</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="Group">
                        <template #default="scope">
                            <div style="margin-bottom: 5px;">
                                <el-tag :type="groupTagType(scope.row.group[0].group)" class="group-tag">
                                    {{ scope.row.group[0].group }}
                                </el-tag>
                            </div>
                            <div>
                                <el-tag :type="groupTagType(scope.row.group[1].group)" class="group-tag">
                                    {{ scope.row.group[1].group }}
                                </el-tag>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="Status">
                        <template #default="scope">
                            <div style="margin-bottom: 5px;">
                                <el-tag :type="statusColor(scope.row.group[0].status)" class="file-status">
                                    {{ scope.row.group[0].status.kind }}
                                </el-tag>
                            </div>
                            <div>
                                <el-tag :type="statusColor(scope.row.group[1].status)" class="file-status">
                                    {{ scope.row.group[1].status.kind }}
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
    width: 100px;
}
</style>