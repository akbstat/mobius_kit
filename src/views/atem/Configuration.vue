<script lang="ts" setup>
import { onMounted, Ref, ref } from 'vue';
import { Config } from './utils/interfaces';
import { useAtem } from '../../store/atem';
import { storeToRefs } from 'pinia';
import { listLanguages, listSdtmVersion } from '../../api/atem/metadata/apis/sdtm';
import { Language, SdtmVersion } from '../../api/atem/metadata/interfaces/sdtm';


const store = useAtem();
const { languageId, sdtmVersionId } = storeToRefs(store);
const emit = defineEmits<{
    (e: "submit", config: Config): void;
    (e: "cancel"): void;
}>();
const sdtmVersions: Ref<SdtmVersion[]> = ref([]);
const languages: Ref<Language[]> = ref([]);
const logSpread = ref(true);
const config: Ref<Config> = ref({ selectedVersionId: 1, selectedLangId: 1, logSpread: true });

async function changeLanguage() {
    if (languageId.value) {
        sdtmVersionId.value = undefined;
        sdtmVersions.value = await listSdtmVersion(languageId.value);
    }
}

function submit() {
    emit("submit", config.value);
}

function cancel() {
    emit("cancel");
}

onMounted(async () => {
    languages.value = await listLanguages();
    if (languageId.value) {
        sdtmVersions.value = await listSdtmVersion(languageId.value);
    }
})

</script>

<template>
    <el-form label-width="auto">
        <el-form-item label="Language">
            <el-select @change="changeLanguage" v-model="languageId" size="small">
                <el-option v-for="lang in languages" :key="lang.id" :value="lang.id" :label="lang.name" />
            </el-select>
        </el-form-item>
        <el-form-item label="SDTMIG Version">
            <el-select v-model="sdtmVersionId" size="small">
                <el-option v-for="version in sdtmVersions" :key="version.id" :value="version.id"
                    :label="version.name" />
            </el-select>
        </el-form-item>
        <el-form-item label="Log Spread">
            <el-switch v-model="logSpread" size="small" />
        </el-form-item>
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