<script setup lang="ts">
import * as echarts from "echarts";
import { onMounted } from "vue";

interface Param {
    item: { dev: number[], qc: number[] },
}

const props = defineProps<Param>();

const { dev, qc } = props.item;

function init() {
    let Chart = echarts.init(document.getElementById("summary"), 'dark');
    let options = {
        tooltip: {},
        backgroundColor: "",
        xAxis: {
            type: "value",
        },
        yAxis: {
            type: "category",
            data: ["NotStart", "Building", "Changed", "Unexpect", "Ready/Pass", "NotMatch", "NA"].reverse(),
        },
        series: [
            {
                name: "Production",
                type: "bar",
                data: dev,
                label: {
                    show: true,
                    position: 'right',
                    valueAnimation: true
                },
                itemStyle: {
                    color: "#66b1ff",
                }
            },
            {
                name: "Validation",
                type: "bar",
                data: qc,
                label: {
                    show: true,
                    position: 'right',
                    valueAnimation: true
                },
                itemStyle: {
                    color: "#f78989",
                }
            },
        ],
        legend: {
            show: true
        },
    };

    // 渲染图表
    Chart.setOption(options);
}

onMounted(() => {
    init();
});


</script>

<template>
    <div id="summary"></div>
</template>

<style>
#summary {
    width: 110vh;
    height: 60vh;
}
</style>