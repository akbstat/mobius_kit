<script lang="ts" setup>
import { computed, onMounted, ref, Ref } from 'vue';
import { listRtfsWithTitle, Rtf } from '../../api/fusion/fusion';
import { File, Task } from './fusion';
import { Config } from './fusion';

const submitEvent = "submit";
const closeEvent = "close";
const { task, config } = defineProps<{ task: Task, config: Config }>();
const emit = defineEmits<{
    (e: "submit", outputs: File[]): void;
    (e: "close"): void;
}>();
const excludedOutputs = task.files.map(file => file.filename);
const outputs: Ref<Rtf[]> = ref([]);
const selected: Ref<number[]> = ref([]);
const selections = computed(() => {
    return outputs.value.map((output, index) => {
        return { key: index, label: output.name }
    });
});

function submit() {
    const newOutputs = outputs.value.filter((_, index) => selected.value.includes(index)).map(output => {
        return {
            title: output.title,
            path: `${config.output}\\${output.name}`,
            filename: output.name,
        }
    });
    emit(submitEvent, newOutputs);
}

function filterOutput(query: string, output: { label: string }) {
    return output.label.toLowerCase().includes(query.toLowerCase())
}

onMounted(async () => {
    const allOutputs = await listRtfsWithTitle(config.output, config.top.path);
    outputs.value = allOutputs.filter(output => !excludedOutputs.includes(output.name));
})
</script>

<template>
    <el-transfer :filter-method="filterOutput" :titles="['Source', 'Target']" :data="selections" v-model="selected"
        class="output-select" filterable filter-placeholder="Search Outputs" />
    <div style="margin-top: 2%;">
        <el-button type="primary" plain @click="submit">
            <el-icon>
                <Select />
            </el-icon>
        </el-button>
        <el-button type="danger" plain @click="() => { emit(closeEvent) }">
            <el-icon>
                <Close />
            </el-icon>
        </el-button>
    </div>
</template>