<script lang="ts" setup>
import * as echarts from "echarts";
import { onMounted } from "vue";
import { gaugeColor } from "./display";
import { GraphData, graphData } from "../../api/inspector/inspector";


function initSummary(data: GraphData) {
    const { complete, building, notStart } = data;
    const total = complete + building + notStart;
    const chart = echarts.init(document.getElementById("summary"), 'dark');
    const option = {
        title: {
            text: 'Item Status Summary'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        backgroundColor: "",
        legend: {},
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            boundaryGap: [0, 0.01]
        },
        yAxis: {
            type: 'category',
            data: ['NotStart', 'Building', 'Complete']
        },
        series: [
            {
                type: 'bar',
                label: {
                    show: true,
                    position: 'right',
                    formatter: (params: any) => `${params.value} (${params.value / total * 100}%)`
                },
                data: [{
                    value: notStart,
                    itemStyle: {
                        color: '#F56C6C'
                    }
                }, {
                    value: building,
                    itemStyle: {
                        color: '#409EFF'
                    }
                }, {
                    value: complete,
                    itemStyle: {
                        color: '#67C23A'
                    }
                },],
                barCategoryGap: "70%"
            },
        ]
    };
    chart.setOption(option);
}

function initGauge(id: string, value: number, name: string) {
    let Chart = echarts.init(document.getElementById(id), 'dark');
    const gaugeData = [
        {
            value,
            name,
            title: {
                offsetCenter: ['0%', '0%']
            },
            detail: {
                valueAnimation: true,
                offsetCenter: ['0%', '30%']
            },
            itemStyle: {
                color: gaugeColor(value),
            }
        },
    ];
    let options = {
        backgroundColor: "",
        series: [
            {
                type: 'gauge',
                startAngle: 90,
                endAngle: -270,
                center: ['50%', '50%'],
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
                        width: 10
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

function initLog(value: number) {
    initGauge("log", value, "Log Passed");
}

function initQc(value: number) {
    initGauge("qc", value, "Validation Passed");
}

onMounted(async () => {
    const data = await graphData();
    initSummary(data);
    initLog(data.logPassPercentage);
    initQc(data.qcPassPercentage);
});
</script>

<template>
    <div class="graph">
        <div id="summary" />
        <div>
            <div id="log" />
            <div id="qc" />
        </div>
    </div>
</template>

<style scoped>
.graph {
    display: flex;
}

#summary {
    width: 110vh;
    height: 55vh;
}

#log {
    width: 30vh;
    height: 30vh;
}

#qc {
    width: 30vh;
    height: 30vh;
}
</style>