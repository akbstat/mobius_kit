<script lang="ts" setup>
import { ElMessage, ElScrollbar } from 'element-plus';
import { computed, onMounted, Ref, ref } from 'vue';
import { clearFusionTask, fetchLog, fetcProgress } from '../../api/fusion/fusion';

const emit = defineEmits<{ (e: "close"): void }>();

let intervalId = 0;
const progress = ref(0);
const status = computed(() => {
    return progress.value >= 100 ? "success" : "";
});
const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>();
const logs: Ref<string[]> = ref([]);
const stopProgress = ref(false);

function update() {
    progress.value = 0;
    const sleep = (ms: number) => {
        return new Promise(resolve => {
            setTimeout(resolve, ms)
        });
    }
    intervalId = setInterval(async () => {
        if (progress.value >= 100) {
            clearInterval(intervalId);
            clearFusionTask();
            fusionComplete();
        }
        if (!stopProgress.value) {
            progress.value = await fetcProgress(progress.value);
            (await fetchLog()).forEach(log => {
                if (log.startsWith("[ERR")) {
                    stopProgress.value = true;
                }
                logs.value.push(log);
            });
        }
        scrollbarRef.value!.setScrollTop(logs.value.length * 100);
        await sleep(100);
    }, 100);
}

function fusionComplete() {
    ElMessage.success("Execution Completed");
    emit("close");
}

function logTextType(log: string): string {
    if (log.startsWith("[ERROR")) {
        return "danger";
    } else if (log.startsWith("[WARNING")) {
        return "warning";
    }
    return "primary"
}

onMounted(() => {
    update();
})

</script>

<template>
    <div>
        <el-progress :status="status" :text-inside="true" :stroke-width="26" :percentage="progress.toFixed(2)" />
    </div>
    <div
        style="background-color: rgb(24.4, 33.8, 43.5);margin: 10px 3px 10px 3px ; border: 3px groove rgb(42, 89, 137.5) ; ">
        <el-scrollbar ref="scrollbarRef" height="440px">
            <div style="margin: 5px; white-space: pre-wrap;" v-for="log in logs">
                <el-text :type="logTextType(log)">{{ log }}</el-text>
            </div>
        </el-scrollbar>
    </div>
</template>
