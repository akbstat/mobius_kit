<script lang="ts" setup>
import { ElScrollbar } from 'element-plus';
import { computed, onMounted, Ref, ref } from 'vue';
import { clearFusionTask, fetchLog, fetcProgress, fetchPreviousLog } from '../../api/fusion/fusion';
import { EpPropMergeType } from 'element-plus/es/utils/index.mjs';

const { previousTaskStartTime } = defineProps<{ previousTaskStartTime: number }>();
const emit = defineEmits<{ (e: "close", isCancelled: boolean): void }>();

let intervalId = 0;
const progress = ref(0);
const status = computed(() => {
    return progress.value >= 100 ? "success" : "";
});
const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>();
const logs: Ref<string[]> = ref([]);
const stopProgress = ref(false);
const timeConsumming = ref(0);
const stopConfirmDisplay = ref(false);
function timeConsummingDisplay(): string {
    const consuming = timeConsumming.value / 1000;
    if (consuming > 3600) {
        return `${(consuming / 3600).toFixed(2)} hr`;
    } else if (consuming > 60) {
        return `${(consuming / 60).toFixed(2)} min`;
    }
    return `${consuming.toFixed(2)} sec`;
}

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
            return;
        }
        if (!stopProgress.value) {
            progress.value = await fetcProgress(progress.value);
            (await fetchLog()).forEach(log => {
                if (log.startsWith("[ERR")) {
                    stopProgress.value = true;
                }
                logs.value.push(log);
            });
        } else {
            clearInterval(intervalId);
        }
        if (scrollbarRef.value) {
            scrollbarRef.value!.setScrollTop(logs.value.length * 100);
        }
        timeConsumming.value = (new Date()).valueOf() - previousTaskStartTime;
        await sleep(100);
    }, 100);
}

function fusionComplete() {
    emit("close", false);
}

function fusionCancel() {
    clearFusionTask();
    emit("close", true);
}

function logTextType(log: string): EpPropMergeType<StringConstructor, "" | "info" | "success" | "warning" | "danger" | "primary", unknown> | undefined {
    if (log.startsWith("[ERROR")) {
        return "danger";
    } else if (log.startsWith("[WARNING")) {
        return "warning";
    }
    return "primary"
}

onMounted(async () => {
    logs.value = await fetchPreviousLog();
    update();
})

</script>

<template>
    <div>
        <el-progress :duration="10" striped-flow striped :status="status" :text-inside="true" :stroke-width="26"
            :percentage="parseFloat(progress.toFixed(2))" />
    </div>
    <div
        style="background-color: rgb(24.4, 33.8, 43.5);margin: 10px 3px 10px 3px ; border: 3px groove rgb(42, 89, 137.5) ; ">
        <el-scrollbar ref="scrollbarRef" height="440px">
            <div style="margin: 5px; white-space: pre-wrap;" v-for="log in logs">
                <el-text :type="logTextType(log)">{{ log }}</el-text>
            </div>
        </el-scrollbar>
    </div>
    <el-text style="margin-left: 5px;" type="primary">Time Consuming: {{ timeConsummingDisplay() }}</el-text>
    <el-button style="float: right; margin-right: 2px;" size="small" plain type="danger"
        @click="stopConfirmDisplay = true">
        <el-icon>
            <VideoPause />
        </el-icon>
    </el-button>
    <el-dialog draggable v-model="stopConfirmDisplay" title="All running tasks will be cancelled, please confirm">
        <el-button @click="fusionCancel" plain type="danger">
            <el-icon>
                <Select />
            </el-icon>
        </el-button>
        <el-button @click="() => { stopConfirmDisplay = false }" plain>
            <el-icon>
                <CloseBold />
            </el-icon>
        </el-button>
    </el-dialog>
</template>
