<script lang="ts" setup>
import { onMounted, ref, Ref } from 'vue';
import { ArrowLeft, ArrowRight } from "@element-plus/icons-vue";
import { storeToRefs } from 'pinia';
import FormList from './FormList.vue';
import FormDetail from './FormDetail.vue';
import Configuration from './Configuration.vue';
import EdcVersion from './edcVersion/EdcVersion.vue';
import AnnotationVersionSelection from './annotationVersion/AnnotationVersion.vue';
import { FormInfo } from '../../api/atem/rawdata/apis/rawdata';
import { AnnotationVersion } from '../../api/atem/annotation/interfaces/annotation';
import { listAnnotationVersion } from '../../api/atem/annotation/apis/annotation';
import { useAtem } from '../../store/atem';
import { getDefaultSdtmVersionAndLanguageId } from './utils/helper';

const { languageId, sdtmVersionId, activeProjectVersionId } = storeToRefs(useAtem())
const emit = defineEmits<{ (e: "switchForm", form: FormInfo): void }>();
const annotationVersions: Ref<AnnotationVersion[]> = ref([]);
const selectedForm: Ref<FormInfo | null> = ref(null);
const isCollaspe = ref(false);
const configurationDrawerDisplay = ref(false);
const createAnnotationVersionDialogDisplay = ref(false);

function switchCollapse() {
    isCollaspe.value = !isCollaspe.value;
}

function showConfigurationDrawer() {
    configurationDrawerDisplay.value = true;
}

function changeConfigration() {
    hideConfigurationDrawer();
}

function hideConfigurationDrawer() {
    configurationDrawerDisplay.value = false;
}

async function hideCreateAnnotationVersionDialog() {
    const projectVersionId = activeProjectVersionId.value;
    if (projectVersionId) {
        annotationVersions.value = await listAnnotationVersion(projectVersionId);
    }
    createAnnotationVersionDialogDisplay.value = false;
}

onMounted(async () => {
    try {
        const { language, sdtmVersion } = await getDefaultSdtmVersionAndLanguageId();
        languageId.value = language;
        sdtmVersionId.value = sdtmVersion;
    } catch (error) {
        console.error('Error fetching project versions:', error);
    }
});

</script>

<template>
    <el-container>
        <el-header style="padding: 0 0 0 2px; ">
            <div class="header">
                <el-button @click="switchCollapse" class="sidebar-control" type="primary" plain size="small">
                    <el-icon v-if="isCollaspe">
                        <ArrowRight />
                    </el-icon>
                    <el-icon v-else>
                        <ArrowLeft />
                    </el-icon>
                </el-button>
                <EdcVersion />
                <div class="header-button">
                    <AnnotationVersionSelection />
                    <el-button class="funtion-button" size="small" type="warning" plain>
                        <el-icon>
                            <Cpu />
                        </el-icon>
                    </el-button>
                    <el-button class="funtion-button" size="small" type="primary" plain>
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
            <el-main style="padding: 0;">
                <FormDetail />
            </el-main>
        </el-container>
    </el-container>
    <el-dialog destroy-on-close title="Create New Annotation Version" v-model="createAnnotationVersionDialogDisplay">
        <CreateAnnotationVersion :project-version-id="activeProjectVersionId as number"
            @close="hideCreateAnnotationVersionDialog" />
    </el-dialog>
    <el-drawer v-model="configurationDrawerDisplay" title="Configuration">
        <Configuration @submit="changeConfigration" @cancel="hideConfigurationDrawer" />
    </el-drawer>

</template>

<style scoped>
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