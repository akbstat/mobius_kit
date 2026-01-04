<script lang="ts" setup>
import { onMounted, ref, Ref, watch } from 'vue';
import { ArrowLeft, ArrowRight } from "@element-plus/icons-vue";
import { storeToRefs } from 'pinia';
import FormList from './FormList.vue';
import FormDetail from './FormDetail.vue';
import Configuration from './Configuration.vue';
import SearchResult from './SearchResult.vue';
import PrinterConfig from './PrinterConfig.vue';
import { FormInfo } from '../../api/atem/rawdata/apis/rawdata';
import { useAtem } from '../../store/atem';
import { fetchDefaultAnnotationVersionId, fetchDefaultProjectVersionId, getDefaultSdtmVersionAndLanguageId } from './utils/helper';
import { useProjectContext } from '../../store/context';
import { Config } from './utils/interfaces';
import { generateAnnotationByllm, printAcrf } from '../../api/atem/annotation/apis/annotation';
import { ElMessage, ElNotification } from 'element-plus';
import { openFile } from '../../api/utils/directory';

const { languageId, sdtmVersionId, activeFormId, activeProjectVersionId, activeAnnoationVersionId, multiOperation, multiSelector } = storeToRefs(useAtem())
const { project } = storeToRefs(useProjectContext());
const emit = defineEmits<{ (e: "switchForm", form: FormInfo): void }>();
const selectedForm: Ref<FormInfo | null> = ref(null);
const isCollaspe = ref(false);
const configurationDrawerDisplay = ref(false);
const searchText = ref("");
const searchDialogDisplay = ref(false);
const printerDialogDisplay = ref(false);
const loading = ref(false);
const formDetailRef = ref<InstanceType<typeof FormDetail> | null>(null);

function switchCollapse() {
    isCollaspe.value = !isCollaspe.value;
}

function showConfigurationDrawer() {
    configurationDrawerDisplay.value = true;
}

function changeConfigration(config: Config) {
    const { projectVersionId, annotationVersionId } = config;
    activeProjectVersionId.value = projectVersionId;
    activeAnnoationVersionId.value = annotationVersionId;
    hideConfigurationDrawer();
}

function hideConfigurationDrawer() {
    configurationDrawerDisplay.value = false;
}

function showSearchDialog() {
    if (searchText.value.trim().length > 0) {
        searchDialogDisplay.value = true;
    }
}

function hideSearchDialog(formId: number) {
    if (formId && selectedForm.value?.id !== formId) {
        activeFormId.value = formId;
        multiOperation.value = false;
        multiSelector.value.reset();
    }
    searchDialogDisplay.value = false;
}

function showPrinterDialog() {
    printerDialogDisplay.value = true;
}

async function hidePrinterDialog(filepath: string | undefined) {
    if (filepath && activeProjectVersionId.value && activeAnnoationVersionId.value) {
        printAcrf({
            projectVersionId: activeProjectVersionId.value,
            annotationVersionId: activeAnnoationVersionId.value,
            filepath,
        }).then((_) => {
            ElNotification({
                type: "success",
                title: "Success",
                dangerouslyUseHTMLString: true,
                message: "<span style='cursor: pointer'>acrf printed successfully! Click to open the file.<span>",
                onClick: () => {
                    openFile(filepath);
                },
            });
        }).catch((error) => {
            ElNotification.error('Error printing acrf:', error);
        });
    }
    printerDialogDisplay.value = false;
}

async function fetchDefaultVersions() {
    if (project.value) {
        activeProjectVersionId.value = await fetchDefaultProjectVersionId(project.value);
        if (activeProjectVersionId.value) {
            activeAnnoationVersionId.value = await fetchDefaultAnnotationVersionId(activeProjectVersionId.value);
        }
    }
}

async function autoAnnotationByllm() {
    if (activeAnnoationVersionId.value && activeFormId.value) {
        loading.value = true;
        try {
            await generateAnnotationByllm({ annotationVersionId: activeAnnoationVersionId.value, formId: activeFormId.value });
            ElMessage.success("Generate annotation successfully");
        }
        catch (error) {
            ElMessage.error("Failed to generate annotation, because: " + error);
        } finally {
            loading.value = false;
            await formDetailRef.value?.getFormDetail();
        }
    }
}

onMounted(async () => {
    await fetchDefaultVersions();
    multiOperation.value = false;
    multiSelector.value.reset();
    try {
        const { language, sdtmVersion } = await getDefaultSdtmVersionAndLanguageId();
        languageId.value = language;
        sdtmVersionId.value = sdtmVersion;
    } catch (error) {
        console.error('Error fetching project versions:', error);
    }
});

watch(() => project.value, async () => {
    await fetchDefaultVersions();
});

</script>

<template>
    <el-container>
        <el-header style="padding: 0 0 0 2px; height: 45px;">
            <div class="header">
                <el-button @click="switchCollapse" class="sidebar-control" type="primary" plain size="small">
                    <el-icon v-if="isCollaspe">
                        <ArrowRight />
                    </el-icon>
                    <el-icon v-else>
                        <ArrowLeft />
                    </el-icon>
                </el-button>
                <el-input v-model="searchText" @keyup.enter="showSearchDialog" placeholder="Search" class="search-input"
                    size="small" clearable>
                    <template #suffix>
                        <el-icon @click="showSearchDialog" class="search-icon">
                            <Search />
                        </el-icon>
                    </template>
                </el-input>
                <div class="header-button">
                    <!-- <AnnotationVersionSelection /> -->
                    <el-button @click="autoAnnotationByllm" class="funtion-button" size="small" type="warning" plain>
                        <el-icon>
                            <Cpu />
                        </el-icon>
                    </el-button>
                    <el-button @click="showPrinterDialog" class="funtion-button" size="small" type="primary" plain>
                        <el-icon>
                            <Printer />
                        </el-icon>
                    </el-button>
                    <el-button @click="showConfigurationDrawer" class="funtion-button" size="small" type="primary"
                        plain>
                        <el-icon>
                            <Setting />
                        </el-icon>
                    </el-button>
                </div>
            </div>
        </el-header>
        <el-container>
            <el-aside width="collaspe">
                <FormList :collapse="isCollaspe" @switch-form="(form: FormInfo) => { selectedForm = form }" />
            </el-aside>
            <el-main v-loading="loading" element-loading-text="Annotation Generating..." style="padding: 0;">
                <FormDetail ref="formDetailRef" />
            </el-main>
        </el-container>
    </el-container>
    <el-drawer destroy-on-close v-model="configurationDrawerDisplay" title="Configuration" size="35%">
        <Configuration @submit="changeConfigration" @cancel="hideConfigurationDrawer" />
    </el-drawer>
    <el-dialog destroy-on-close v-model="printerDialogDisplay" title="Printer Configuration">
        <PrinterConfig @close="hidePrinterDialog" />
    </el-dialog>
    <el-dialog destroy-on-close v-model="searchDialogDisplay" :title="`Search Result of < ${searchText} >`"
        width="1200px">
        <SearchResult :content="searchText" @close="hideSearchDialog" />
    </el-dialog>
</template>

<style scoped>
.search-input {
    width: 210px;
    margin: 0px 0 2px 5px;
}

.search-icon {
    cursor: pointer;
}

.header {
    padding-left: 18px;
    margin-top: 10px;
}

.annotation-version {
    width: 260px;
}

.header-button {
    float: right;
    margin-right: 10px;
}

.menu-item {
    margin: 0;
    padding: 0;
}

.sidebar-control {
    width: 80px;
    float: left;
    margin-right: 2px;
}

.funtion-button {
    margin-left: 5px;
}
</style>