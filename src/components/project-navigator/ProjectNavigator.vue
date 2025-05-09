<script setup lang="ts">
import { watchEffect } from 'vue';
import { openDirectory } from '../../api/scaffold/project';

const document = "documents";
const stat = "stats";

enum Group {
    Dev = "product",
    Qc = "validation",
}

const prop = defineProps<{ config: { product: string, trial: string, purpose: string, kind: string } }>();
let { config } = prop;

watchEffect(() => {
    config = prop.config;
})

async function openProtocol() {
    await openDirectory(`${config.product}\\${config.trial}\\${document}\\protocol`)
}

async function openCRF() {
    const { product, trial } = config;
    await openDirectory(`${product}\\${trial}\\${document}\\crf`)
}

async function openSpecs() {
    const { product, trial } = config;
    await openDirectory(`${product}\\${trial}\\${document}\\specs`)
}

async function openSap() {
    const { product, trial } = config;
    await openDirectory(`${product}\\${trial}\\${document}\\sap`)
}

async function openRawdata() {
    const { product, trial, purpose } = config;
    await openDirectory(`${product}\\${trial}\\${stat}\\${purpose}\\rawdata`)
}

async function openCommonMacro() {
    const { product, trial, purpose } = config;
    await openDirectory(`${product}\\${trial}\\${stat}\\${purpose}\\macros`)
}

async function openUtility() {
    const { product, trial, purpose } = config;
    await openDirectory(`${product}\\${trial}\\${stat}\\${purpose}\\utility`)
}

async function openProgram(group: Group) {
    const { product, trial, purpose, kind } = config;
    await openDirectory(`${product}\\${trial}\\${stat}\\${purpose}\\${group}\\program\\${projectKind(kind)}`)
}

async function openGroupProgram(group: Group) {
    const { product, trial, purpose } = config;
    await openDirectory(`${product}\\${trial}\\${stat}\\${purpose}\\${group}\\program\\macros`)
}

async function openGroupDataset(group: Group) {
    const { product, trial, purpose, kind } = config;
    await openDirectory(`${product}\\${trial}\\${stat}\\${purpose}\\${group}\\dataset\\${projectKind(kind)}`)
}

async function openOutput() {
    const { product, trial, purpose } = config;
    await openDirectory(`${product}\\${trial}\\${stat}\\${purpose}\\product\\output`)
}

async function openQcResult() {
    const { product, trial, purpose, kind } = config;
    await openDirectory(`${product}\\${trial}\\${stat}\\${purpose}\\validation\\qc-result\\${projectKind(kind)}`)
}

function projectKind(source: string) {
    if (source === "TFLs") return "tfl";
    else return source.toLowerCase();
}

</script>

<template>
    <el-card style="max-width: 100%; margin-bottom: 40px">
        <template #header>
            <div class="card-header">
                <span>Common</span>
            </div>
        </template>
        <el-button type="primary" plain style="width:12.7%" @click="openProtocol">Protocol</el-button>
        <el-button type="primary" plain style="width:12.7%" @click="openCRF">CRF</el-button>
        <el-button type="primary" plain style="width:12.7%" @click="openSpecs">Specs</el-button>
        <el-button type="primary" plain style="width:12.7%" @click="openSap">Sap</el-button>
        <el-button type="primary" plain style="width:12.7%" @click="openRawdata">RawData</el-button>
        <el-button type="primary" plain style="width:12.7%" @click="openCommonMacro">Macro</el-button>
        <el-button type="primary" plain style="width:12.7%" @click="openUtility">Utility</el-button>
    </el-card>
    <el-card style="max-width: 100%; margin-bottom: 40px">
        <template #header>
            <div class="card-header">
                <span>Dev</span>
            </div>
        </template>
        <el-button type="primary" plain style="width:23.5%" @click="() => openProgram(Group.Dev)">Program</el-button>
        <el-button type="primary" plain style="width:23.5%" @click="() => openGroupProgram(Group.Dev)">Macro</el-button>
        <el-button type="primary" plain style="width:23.5%"
            @click="() => openGroupDataset(Group.Dev)">Dataset</el-button>
        <el-button type="primary" plain style="width:23.5%" @click="openOutput">Output</el-button>
    </el-card>
    <el-card style="max-width: 100%">
        <template #header>
            <div class="card-header">
                <span>Qc</span>
            </div>
        </template>
        <el-button type="primary" plain style="width:23.5%" @click="() => openProgram(Group.Qc)">Program</el-button>
        <el-button type="primary" plain style="width:23.5%" @click="() => openGroupProgram(Group.Qc)">Macro</el-button>
        <el-button type="primary" plain style="width:23.5%"
            @click="() => openGroupDataset(Group.Qc)">Dataset</el-button>
        <el-button type="primary" plain style="width:23.5%" @click="openQcResult">QC Result</el-button>
    </el-card>
</template>
