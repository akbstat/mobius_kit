<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { listen } from '@tauri-apps/api/event';
import { writeText } from '@tauri-apps/api/clipboard';
import { ElMessage, ElNotification } from 'element-plus';
import { listAnnotations, exportAnnotations, openPDF, openFile } from "../../api/voyager/voyager";
import { Annotation } from "./voyager";
import { computed } from '@vue/reactivity';
import { open } from '@tauri-apps/api/dialog';
import { Search, Connection, Aim } from '@element-plus/icons-vue';
import { storeToRefs } from 'pinia';
import { useVoyager } from "../../store/voyager";

const dialogDisplay = ref(false);
const { filePath } = storeToRefs(useVoyager())
const annotations = ref<Annotation[]>([]);
const loading = ref(false);
const domainSelected = ref("");
const domains = ref<string[]>([]);
const domainDisplay = computed(() => {
    const filterValue = domainFilter.value.toUpperCase();
    if (filterValue.length === 0) {
        return domains.value;
    }
    return domains.value.filter((domain: string) => domain.includes(filterValue));
});
const globalScope = ref(false);
const exportPath = ref("");
const exportFileName = ref("annotations");
const domainFilter = ref("");
const variableFilter = ref("");
const annotationDisplay = computed(() => {
    if (globalScope.value && variableFilter.value.length > 0) {
        return annotations.value.filter((item: Annotation) => item.variable.includes(variableFilter.value.toUpperCase()));
    }

    const domain = domainSelected.value;
    if (domain.length === 0) {
        return [];
    }
    return annotations.value.filter((item: Annotation) => (item.domain === domain || item.domain === "SUPP" + domain) && item.variable.includes(variableFilter.value.toUpperCase()));
});

listen('tauri://file-drop', event => {
    const payloads = event.payload as string[];
    if (payloads.length > 0) {
        filePath.value = payloads[0].endsWith(".pdf") ? payloads[0] : "";
    }
})

function openExportAnnotationDialog() {
    dialogDisplay.value = true;
    const filepathList = filePath.value.split("\\");
    exportPath.value = filepathList.splice(0, filepathList.length - 1).join("\\");
}

async function openAcrf(page: number) {
    await openPDF(filePath.value, page);
}

async function exportAnnotation() {
    const exportDestination = `${exportPath.value}\\${exportFileName.value}.xlsx`;
    dialogDisplay.value = false;
    loading.value = true;
    try {
        await exportAnnotations(filePath.value, exportDestination);
        loading.value = false;
        ElNotification({
            message: 'Export successfully, Click here to open exported file',
            type: 'success',
            onClick: () => {
                try {
                    openFile(exportDestination)
                } catch (err) {
                    ElMessage({
                        message: `${err}`,
                        type: 'error',
                    })
                    return;
                }
            }
        })
    } catch (err) {
        ElNotification({
            message: `${err}`,
            type: 'error',
        })
    } finally {
        loading.value = false;
    }
}

async function fetchingAnnotations() {
    if (!filePath.value.endsWith(".pdf")) {
        ElMessage({
            message: 'Invalid file, please specify a PDF',
            type: 'error',
        })
        return;
    }
    loading.value = true;
    try {
        annotations.value = (await listAnnotations(filePath.value)).map((annotation) => {
            return new Annotation(annotation);
        });
        const domainSet = new Set<string>();
        annotations.value.forEach((item: Annotation, index: number) => {
            let domain = item.domain;
            if (domain.startsWith("SUPP")) {
                domain = domain.replace("SUPP", "");
                annotations.value[index].supp = true;
            }
            domain = domain.startsWith("SUPP") ? domain.replace("SUPP", "") : domain;
            domainSet.add(domain)
        });
        domains.value = Array.from(domainSet).sort((x, y) => { return x < y ? 0 : 1 });
        domainSelected.value = domains.value[0];
    } catch (error) {
        ElMessage({
            message: `${error}`,
            type: 'error',
        });
    }
    loading.value = false;
}

async function fetchAnnotations() {
    fetchingAnnotations();
    const sleep = (ms: number) => {
        return new Promise(resolve => {
            setTimeout(resolve, ms)
        });
    }
    while (loading.value === true) {
        await sleep(100);
    }
}

function selectDomain(index: string) {
    domainSelected.value = index;
}

function variableTagType(annotation: Annotation): "" | "success" | "warning" | "info" | "danger" {
    return annotation.supp ? "warning" : "";
}

async function copyPages(pages: number[]) {
    await writeText("CRF Page " + pages.join(" "));
    ElMessage({
        message: 'copied',
        type: 'success',
    })
}
async function selectFile() {
    const path = (await open({
        filters: [{
            extensions: ['pdf'],
            name: ''
        }]
    })) as string;
    if (path !== null && path.length > 0) {
        filePath.value = path;
    }
}

async function selectDirectory() {
    const dir = (await open({
        directory: true,
    })) as string;
    if (dir !== null && dir.length > 0) {
        exportPath.value = dir
    }
}

onMounted(async () => {
    if (filePath.value.length > 0) {
        await fetchAnnotations();
    }
});

</script>

<template>
    <el-container>
        <el-header style="padding: 10px 5px 10px;">
            <el-button type="primary" plain @click="selectFile">Select</el-button>
            <el-button type="warning" plain style="margin-left: 5px;" @click="fetchAnnotations">Fetch</el-button>
            <el-input v-model="filePath" clearable placeholder="Please input filepath of aCRF"
                style="width: 82%; margin-left: 5px;" />
            <el-button type="primary" plain style="margin-left: 7px; width: 40px;" @click="openExportAnnotationDialog">
                <el-icon>
                    <Download />
                </el-icon>
            </el-button>
        </el-header>
        <el-container>
            <el-aside width="14%" style="padding: 0 5px 0;">
                <el-container>
                    <el-header style="padding: 0;margin: 0; height: 40px;">
                        <el-input clearable v-model="domainFilter" style="height: 40px;" placeholder="Domain" />
                    </el-header>
                    <el-main style="padding: 0;margin: 0;">
                        <el-scrollbar height="550px" style="background-color: #18222c;">
                            <el-menu background-color="#18222c" @select="selectDomain">
                                <el-menu-item v-for="domain in domainDisplay" :index="domain">
                                    {{ domain }}
                                </el-menu-item>
                            </el-menu>
                        </el-scrollbar>
                    </el-main>
                </el-container>
            </el-aside>
            <el-main style="padding: 0 5px 5px 0;">
                <el-table v-loading="loading" :data="annotationDisplay" height="590px" max-height="590px">
                    <el-table-column type="expand">
                        <template #default="scope">
                            <el-descriptions size="small" border :column="1" style="margin: 0 40px 0 60px;">
                                <el-descriptions-item v-for="pages in scope.row.pageDescription" width="200px">
                                    <template #label>
                                        <div @click="copyPages(pages.page)" style="cursor: pointer;">
                                            {{ pages.description }}
                                        </div>
                                    </template>
                                    <div style="float: left;" v-for="page in pages.page">
                                        <el-link type="primary" @click="() => { openAcrf(page) }">
                                            {{ page }}&#160;&#160;
                                        </el-link>
                                    </div>
                                    <el-button type="primary" plain style="width: 10px; float: right;"
                                        @click="() => { copyPages(pages.page) }">
                                        <el-icon>
                                            <CopyDocument />
                                        </el-icon>
                                    </el-button>
                                </el-descriptions-item>
                            </el-descriptions>
                        </template>
                    </el-table-column>
                    <el-table-column label="Variable" width="120">
                        <template #default="scope">
                            <el-tag :type="variableTagType(scope.row)" @click="() => { copyPages(scope.row.page) }"
                                style="width: 85px; justify-content: left; cursor: pointer;">
                                {{ scope.row.variable }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="Pages" width="550">
                        <template #default="scope">
                            <div style="float: left;" v-for="page in scope.row.page">
                                <el-link type="primary" @click="() => { openAcrf(page) }">{{ page
                                    }}&#160;&#160;</el-link>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column>
                        <template #header>
                            <el-switch v-model="globalScope" style="margin-right: 5px;" :active-action-icon="Connection"
                                :inactive-action-icon="Aim" />
                            <el-input style="width: 157px" v-model="variableFilter" clearable :suffix-icon="Search" />
                        </template>
                        <template #default="scope">
                            <el-button type="primary" plain style="width: 10px; float: right;"
                                @click="() => { copyPages(scope.row.page) }">
                                <el-icon>
                                    <CopyDocument />
                                </el-icon>
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-main>
        </el-container>
    </el-container>
    <el-dialog width="900px" draggable title="Export Annotations" v-model="dialogDisplay">
        <el-button type="primary" plain style="margin-left: 10px; width: 7%; height: 34px" @click="selectDirectory">
            <el-icon>
                <Folder />
            </el-icon>
        </el-button>
        <el-input v-model="exportPath" style="margin-left: 5px;width: 60%">
            <template #suffix>
                \
            </template>
        </el-input>
        <el-input v-model="exportFileName" style="margin-left: 5px; width: 20%;">
            <template #suffix>
                .xlsx
            </template>
        </el-input>
        <el-button type="primary" plain style="margin-left: 5px; width: 7%; height: 34px" @click="exportAnnotation">
            <el-icon>
                <Download />
            </el-icon>
        </el-button>
    </el-dialog>
</template>
