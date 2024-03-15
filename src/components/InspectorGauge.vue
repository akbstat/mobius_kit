<script setup lang="ts">
import * as echarts from "echarts";
import { onMounted } from "vue";

interface Param {
    item: { dev: number, qc: number, all: number },
}

const props = defineProps<Param>();

const { dev, qc, all } = props.item;

function init() {
    let Chart = echarts.init(document.getElementById("gauge"), 'dark');
    const gaugeData = [
        {
            value: all,
            name: 'All',
            title: {
                offsetCenter: ['0%', '-30%']
            },
            detail: {
                valueAnimation: true,
                offsetCenter: ['0%', '-20%']
            },
            itemStyle: {
                color: "#ebb563",
            }
        },
        {
            value: dev,
            name: 'Production',
            title: {
                offsetCenter: ['0%', '0%']
            },
            detail: {
                valueAnimation: true,
                offsetCenter: ['0%', '10%']
            },
            itemStyle: {
                color: "#66b1ff",
            }
        },
        {
            value: qc,
            name: 'Validation',
            title: {
                offsetCenter: ['0%', '30%']
            },
            detail: {
                valueAnimation: true,
                offsetCenter: ['0%', '40%']
            },
            itemStyle: {
                color: "#f78989",
            }
        }
    ];
    let options = {
        backgroundColor: "",
        series: [
            {
                type: 'gauge',
                startAngle: 90,
                endAngle: -270,
                pointer: {
                    show: false
                },
                progress: {
                    show: true,
                    overlap: false,
                    roundCap: true,
                    clip: false,
                    itemStyle: {
                        borderWidth: 0,
                        borderColor: '#464646'
                    }
                },
                axisLine: {
                    lineStyle: {
                        width: 40
                    }
                },
                splitLine: {
                    show: false,
                    distance: 0,
                    length: 10
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    show: false,
                    distance: 50
                },
                data: gaugeData,
                title: {
                    fontSize: 14
                },
                detail: {
                    width: 50,
                    height: 14,
                    fontSize: 12,
                    color: 'inherit',
                    borderColor: 'inherit',
                    borderRadius: 20,
                    borderWidth: 0,
                    formatter: '{value}%'
                }
            }
        ]
    };


    // 渲染图表
    Chart.setOption(options);
}

onMounted(() => {
    init();
});


</script>

<template>
    <div id="gauge"></div>
</template>

<style>
#gauge {
    /* padding-left: 10%; */
    width: 60vh;
    height: 60vh;
}
</style>