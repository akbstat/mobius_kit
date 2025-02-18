<script lang="ts" setup>
import { computed, onMounted, ref, Ref } from 'vue';
import { LogDetail, logDetail, LogDetailRequest, LogRow, Status } from '../../api/inspector/inspector';
import { statusColor } from './display';


const props = defineProps<{ param: LogDetailRequest }>();
const { product, trial, purpose, kind, item, group } = props.param;
const log: Ref<LogDetail | null> = ref(null);
const failedOnly = ref(false);
const logRow = computed(() => {
    if (!log.value) {
        return [];
    }
    if (failedOnly.value) {
        return log.value.details.filter(r => !r.pass);
    }
    return log.value.details;
});

function rowStyle({ row }: { row: LogRow }) {
    if (!row.pass) {
        return {
            backgroundColor: "var(--el-color-danger-light-9)",
            color: "var(--el-color-danger)",
        };
    }
    return {};
}

onMounted(async () => {
    log.value = await logDetail({ product, trial, purpose, kind, item, group });
});
</script>

<template>
    <el-container v-if="log">
        <el-header class="header">
            <div class="title"> {{ `Log Details of ${item}` }}</div>
            <div>
                <el-tag type="primary" style="margin-right: 5px">{{ group }}</el-tag>
                <el-tag class="status" :type="statusColor(log?.status as Status)">{{ log?.status.kind }}</el-tag>
            </div>
        </el-header>
        <el-main class="main-area">
            <el-table :row-style="rowStyle" :data="logRow" max-height="610" height="610">
                <el-table-column label="Row" width="75">
                    <template #default="scope">
                        {{ scope.row.row + 1 }}
                    </template>
                </el-table-column>
                <el-table-column prop="content">
                    <template #header>
                        <div>
                            <span>Content</span>
                            <el-switch style="--el-switch-on-color: #ff4949" size="small" class="read-log"
                                v-model="failedOnly" />
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </el-main>
    </el-container>
</template>

<style scoped>
.header {
    padding: 0;
    margin-bottom: 10px;
}

.main-area {
    padding: 0;
}

.title {
    margin-bottom: 10px;
}

.status {
    width: 90.5%;
}

.read-log {
    float: right;
}
</style>
