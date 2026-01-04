<script lang="ts" setup>
import { onBeforeMount, onMounted, reactive, Ref, ref } from 'vue';
import { Config } from './utils/interfaces';
import { useAtem } from '../../store/atem';
import { storeToRefs } from 'pinia';
import { listLanguages, listSdtmVersion } from '../../api/atem/metadata/apis/sdtm';
import { Language, SdtmVersion } from '../../api/atem/metadata/interfaces/sdtm';

import EdcVersion from './edcVersion/EdcVersion.vue';
import { fetchDefaultAnnotationVersionId } from './utils/helper';


const store = useAtem();
const { languageId, sdtmVersionId, activeProjectVersionId, activeAnnoationVersionId } = storeToRefs(store);
const emit = defineEmits<{
    (e: "submit", config: Config): void;
    (e: "cancel"): void;
}>();
const sdtmVersions: Ref<SdtmVersion[]> = ref([]);
const languages: Ref<Language[]> = ref([]);

const config = reactive<Config>({ selectedVersionId: 1, selectedLangId: 1, logSpread: true, projectVersionId: undefined, annotationVersionId: undefined });

async function changeLanguage() {
    if (config.selectedLangId) {
        sdtmVersionId.value = undefined;
        sdtmVersions.value = await listSdtmVersion(config.selectedLangId);
    }
}

function submit() {
    emit("submit", config);
}

function cancel() {
    emit("cancel");
}

async function edcVersionChange(versionId: number) {
    config.projectVersionId = versionId;
    config.annotationVersionId = await fetchDefaultAnnotationVersionId(versionId);
}

onBeforeMount(() => {
    config.projectVersionId = activeProjectVersionId.value;
    config.annotationVersionId = activeAnnoationVersionId.value;
    config.logSpread = false;
    config.selectedLangId = languageId.value || 1;
    config.selectedVersionId = sdtmVersionId.value || 1;
})

onMounted(async () => {
    languages.value = await listLanguages();
    if (languageId.value) {
        sdtmVersions.value = await listSdtmVersion(languageId.value);
    }
})

</script>

<template>
    <el-form label-width="auto">
        <el-form-item label="Version">
            <EdcVersion @change="edcVersionChange" :project-version-id="config.projectVersionId" />
        </el-form-item>
        <!-- <el-form-item label="Version">
            <AnnotationVersion :project-version-id="config.projectVersionId"
                :annotation-version-id="config.annotationVersionId" @change="annotationVersionChange" />
        </el-form-item> -->
        <el-form-item label="Language">
            <el-select @change="changeLanguage" v-model="languageId" size="small">
                <el-option v-for="lang in languages" :key="lang.id" :value="lang.id" :label="lang.name" />
            </el-select>
        </el-form-item>
        <!-- <el-form-item label="SDTMIG Version">
            <el-select v-model="sdtmVersionId" size="small">
                <el-option v-for="version in sdtmVersions" :key="version.id" :value="version.id"
                    :label="version.name" />
            </el-select>
        </el-form-item> -->
        <el-form-item>
            <el-button @click="submit" type="primary" size="small" plain>
                <el-icon>
                    <Check />
                </el-icon>
            </el-button>
            <el-button @click="cancel" type="danger" size="small" plain>
                <el-icon>
                    <Close />
                </el-icon>
            </el-button>
        </el-form-item>
    </el-form>
</template>

<style scoped></style>