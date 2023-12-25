<script setup lang="ts">
import { ref } from "vue";
import { listFile } from "../../api/inspector/file";
import { TypeLabelAttribute } from "./types/attributes";
import { getType } from "./types/attributes";
import { open } from '@tauri-apps/api/dialog'

interface Filter {
    text: string,
    value: string,
}

interface File {
    directory: string,
    name: string,
    fileType: TypeLabelAttribute,
    modifiedAt: Datetime,
}

interface Datetime {
    value: number,
    display: string,
}

let loading = ref(false)
let fileList = ref<File[]>([]);
let fileTypeFilters = ref<Filter[]>([]);
let directoryFilters = ref<Filter[]>([]);
let directory = ref("");



function filterByType(value: string, row: any): boolean {
    return row.fileType.value === value;
}

function filterByDirectory(value: string, row: any): boolean {
    console.log(value, " ", row.directory);
    return row.directory === value;
}

async function selectDirectory() {
    const dir = (await open({
        directory: true,
    })) as string;
    if (dir.length > 0) {
        directory.value = dir
    }
}

async function fetch() {
    if (directory.value.trim().length === 0) {
        return
    }
    const data = await listFile(directory.value);
    fileList.value = JSON.parse(data).files.map(((item: any) => {
        return {
            directory: item.directory,
            name: item.name,
            fileType: getType(item.extention),
            modifiedAt: { value: item.modified_at, display: new Date((item.modified_at + 3600 * 8) * 1000).toISOString().slice(0, 19) },
        }
    }));
    const typeSet = new Set();
    const directorySet = new Set();
    fileList.value.forEach((item) => {
        typeSet.add(item.fileType.value)
        directorySet.add(item.directory)
    })
    fileTypeFilters.value = Array.from(typeSet).map((item) => { return { text: item, value: item } as Filter });
    directoryFilters.value = Array.from(directorySet).sort().map((item) => { return { text: item, value: item } as Filter });
}
</script>

<template>
    <el-container style="padding:15px">
        <el-button @click="selectDirectory" type="primary" style="width: 100px;">Select</el-button>
        <el-button @click="fetch" type="primary" style="width: 100px;">Fetch</el-button>
        <el-input v-model="directory" style="padding-left: 10px;" placeholder="Please input or select one directory"
            clearable />
    </el-container>
    <el-container style="padding: 0px 15px 0px;">
        <el-table :data="fileList" max-height="470" v-loading="loading">
            <el-table-column label="Directory" width="450" sortable :filters="directoryFilters"
                :filter-method="filterByDirectory">
                <template #default="scope">
                    {{ scope.row.directory }}
                </template>
            </el-table-column>
            <el-table-column label="Filename" width="250" sortable>
                <template #default="scope">
                    {{ scope.row.name }}
                </template></el-table-column>
            <el-table-column label="Modified At" width="220" sortable>
                <template #default="scope">
                    {{ scope.row.modifiedAt.display }}
                </template></el-table-column>
            <el-table-column label="Type" width="100" fixed="right" :filters="fileTypeFilters" :filter-method="filterByType"
                sortable>
                <template #default="scope">
                    <el-tag
                        :style="{ backgroundColor: scope.row.fileType.backgroundColor, color: scope.row.fileType.fontColor, width: 70 + 'px' }">{{
                            scope.row.fileType.value }}</el-tag>
                </template>
            </el-table-column>
        </el-table>
    </el-container>
</template>

<style>
.el-table {
    width: 100%;
    margin: 10 px;
}
</style>