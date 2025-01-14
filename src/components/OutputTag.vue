<script setup lang="ts">
import { EpPropMergeType } from 'element-plus/es/utils/index.mjs';
import { computed } from 'vue';

enum OutputType {
    Table = "Table",
    Listing = "Listing",
    Figure = "Figure",
    Unknown = "Unknown"
}

const props = defineProps<{ type: string }>()

const outputType = computed<OutputType>(() => {
    switch (props.type) {
        case OutputType.Table:
            return OutputType.Table;
        case OutputType.Listing:
            return OutputType.Listing;
        case OutputType.Figure:
            return OutputType.Figure;
        default:
    }
    return OutputType.Unknown;
});

function tagType(): EpPropMergeType<StringConstructor, "primary" | "success" | "warning" | "info" | "danger", unknown> | undefined {
    switch (outputType.value) {
        case OutputType.Table:
            return "primary";
        case OutputType.Listing:
            return "success";
        case OutputType.Figure:
            return "danger";
        default:
            return "info";
    }
}

</script>

<template>
    <el-tag :type="tagType()" style="width: 70px;">{{ outputType }}</el-tag>
</template>
