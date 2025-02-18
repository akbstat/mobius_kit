<script lang="ts" setup>
import { computed, onMounted, ref, Ref } from 'vue';
import { qcDetailMain, qcDetailSupp, QcDetail, QcDetailRequest, openQcFile, StatusKind } from '../../api/inspector/inspector';
import { statusColor, statusContent } from './display';
import { ElMessage } from 'element-plus';

const props = defineProps<{ param: QcDetailRequest, supp: boolean }>();
const { product, trial, purpose, kind, item, ignore } = props.param;
const { supp } = props;
const qcDetails: Ref<QcDetail[]> = ref([]);
const disabled = computed(() => {
    if (qcDetails.value.length > 0) {
        const qc = qcDetails.value[0];
        return qc.status.kind === StatusKind.Missing ? true : false;
    }
    return true;
});

async function openQcDetail() {
    try {
        await openQcFile({ product, trial, purpose, kind, item, supp })
    } catch (error) {
        ElMessage.error(`Failed to open file, because: ${error}`);
    }
}

onMounted(async () => {
    qcDetails.value = [supp ? await qcDetailSupp({ product, trial, purpose, kind, item, ignore }) : await qcDetailMain({ product, trial, purpose, kind, item, ignore })];
});
</script>

<template>
    <el-table :data="qcDetails">
        <el-table-column label="Status">
            <template #default="scope">
                <el-tag class="status-tag" :type="statusColor(scope.row.status)">
                    {{ statusContent(scope.row.status, true) }}
                </el-tag>
            </template>
        </el-table-column>
        <el-table-column width="50">
            <template #default>
                <el-button :disabled="disabled" @click="openQcDetail" type="primary" link>
                    <el-icon>
                        <Reading />
                    </el-icon>
                </el-button>
            </template>
        </el-table-column>
    </el-table>
</template>

<style scoped>
.status-tag {
    width: 100%
}
</style>