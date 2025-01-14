<script setup lang="ts">
import { EpPropMergeType } from 'element-plus/es/utils/index.mjs';
import { Item, File } from '../views/inspector/project';
import { reactive, ref, watch } from 'vue';

interface Param {
    item: Item,
}


const props = defineProps<Param>()
const items = ref<File[]>(props.item.timeline);
const filters = reactive<{ dev: boolean, qc: boolean }>({ dev: true, qc: true });

watch(filters, () => {
    if (filters.dev && filters.qc) {
        items.value = props.item.timeline;
    } else if (filters.dev) {
        items.value = props.item.timeline.filter((f: File) => {
            if (f.kind === "Input" || !determineIfQcItemByName(f.name)) {
                return true;
            }
        });
    } else if (filters.qc) {
        items.value = props.item.timeline.filter((f: File) => {
            if (f.kind === "Input" || determineIfQcItemByName(f.name)) {
                return true;
            }
        });
    } else {
        items.value = props.item.timeline.filter((f: File) => {
            if (f.kind === "Input") {
                return true;
            }
        });
    }
});

function determineIfQcItemByName(name: string): boolean {
    return name.startsWith("v-") || name.startsWith("v_")
}

function toISODatetimeInCst(time: number): string {
    return new Date((time + 3600 * 8) * 1000).toISOString().slice(0, 19)
}

function timelineHeight(row: Item): string {
    const row1 = row.groups[0].files.length;
    const row2 = row.groups[1].files.length;
    const max = row1 > row2 ? row1 : row2;
    return (max * 50) + "px";
};

function fileTagType(status: string): EpPropMergeType<StringConstructor, "primary" | "success" | "warning" | "info" | "danger", unknown> | undefined {
    switch (status) {
        case "Missing":
            return "info";
        case "Unexpected":
            return "warning";
        case "NotMatch":
            return "danger";
        default:
            return "primary";
    }
};
</script>

<template>
    <el-container>
        <el-header style="height: 10px;">
            <div style="padding-left: 40px;">
                <el-checkbox v-model="filters.dev" label="Dev" size="small" />
                <el-checkbox v-model="filters.qc" label="Qc" size="small" />
            </div>
            <!-- <el-button type="primary" size="small" plain style="margin:0" @click="filterDev">Dev</el-button>
            <el-button type="primary" size="small" plain style="margin:0" @click="mix">Mix</el-button>
            <el-button type="primary" size="small" plain style="margin:0" @click="filterQc">Qc</el-button> -->

        </el-header>
        <el-main>
            <el-scrollbar :height="timelineHeight(props.item)">
                <div style="margin: 0px 0px 10px 10px;">
                </div>
                <el-timeline style="margin-top: 30px;">
                    <el-timeline-item v-for="(file, index) in items" :key="index"
                        :timestamp="toISODatetimeInCst(file.modified_at)" placement="top">
                        <div style="padding: 5px; border-radius: 5px">
                            <div>
                                <el-tag :type="fileTagType(file.status)" :style="{ width: 70 + 'px' }">{{
                                    file.kind }}</el-tag>
                            </div>
                            <div>
                                <el-text truncated class="w-500px">{{ file.name }}</el-text>
                            </div>
                        </div>
                    </el-timeline-item>
                </el-timeline>
            </el-scrollbar>
        </el-main>
    </el-container>
</template>
