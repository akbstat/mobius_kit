<script lang="ts" setup>
import { onMounted, ref, Ref } from 'vue';
import { LogDetail, logDetail } from '../../api/inspector/inspector';

const log: Ref<LogDetail | null> = ref(null);

onMounted(async () => {
    log.value = await logDetail("AE");
});
</script>

<template>
    <el-container>
        <el-header class="header">
            <div class="title"> {{ `Log Details of ${log?.item}` }}</div>
            <div>
                <el-tag type="primary" style="margin-right: 5px">{{ log?.group }}</el-tag>
                <el-tag class="status" type="danger">{{ log?.status.kind }}</el-tag>
            </div>
        </el-header>
        <el-main class="main-area">
            <el-table :data="log?.failures">
                <el-table-column label="Row" width="75" prop="row" />
                <el-table-column prop="content">
                    <template #header>
                        <div>
                            <span>Failed Detail</span>
                            <el-button class="read-log" type="primary" link plain>
                                <el-icon>
                                    <Reading />
                                </el-icon>
                            </el-button>
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
    width: 82%;
}

.read-log {
    float: right;
}
</style>
