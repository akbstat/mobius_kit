<script setup lang="ts">
import { watchEffect } from 'vue';
import { openDirectory } from '../../api/scaffold/project';

const document = "documents";
const stat = "stats";

enum Group {
    Dev = "product",
    Qc = "validation",
}

const prop = defineProps<{ config: { product: string, trail: string, purpose: string, kind: string } }>();
let { config } = prop;

watchEffect(() => {
    config = prop.config;
})

async function openProtocol() {
    await openDirectory(`${config.product}\\${config.trail}\\${document}\\protocol`)
}

async function openCRF() {
    const { product, trail } = config;
    await openDirectory(`${product}\\${trail}\\${document}\\crf`)
}

async function openSpecs() {
    const { product, trail } = config;
    await openDirectory(`${product}\\${trail}\\${document}\\specs`)
}

async function openSap() {
    const { product, trail } = config;
    await openDirectory(`${product}\\${trail}\\${document}\\sap`)
}

async function openRawdata() {
    const { product, trail, purpose } = config;
    await openDirectory(`${product}\\${trail}\\${stat}\\${purpose}\\rawdata`)
}

async function openCommonMacro() {
    const { product, trail, purpose } = config;
    await openDirectory(`${product}\\${trail}\\${stat}\\${purpose}\\macros`)
}

async function openUtility() {
    const { product, trail, purpose } = config;
    await openDirectory(`${product}\\${trail}\\${stat}\\${purpose}\\utility`)
}

async function openProgram(group: Group) {
    const { product, trail, purpose, kind } = config;
    await openDirectory(`${product}\\${trail}\\${stat}\\${purpose}\\${group}\\program\\${projectKind(kind)}`)
}

async function openGroupProgram(group: Group) {
    const { product, trail, purpose } = config;
    await openDirectory(`${product}\\${trail}\\${stat}\\${purpose}\\${group}\\program\\macros`)
}

async function openGroupDataset(group: Group) {
    const { product, trail, purpose, kind } = config;
    await openDirectory(`${product}\\${trail}\\${stat}\\${purpose}\\${group}\\dataset\\${projectKind(kind)}`)
}

async function openOutput() {
    const { product, trail, purpose } = config;
    await openDirectory(`${product}\\${trail}\\${stat}\\${purpose}\\product\\output`)
}

async function openQcResult() {
    const { product, trail, purpose, kind } = config;
    await openDirectory(`${product}\\${trail}\\${stat}\\${purpose}\\validation\\qc-result\\${projectKind(kind)}`)
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
