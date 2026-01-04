<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { onMounted, ref, Ref } from 'vue';
import { useAtem } from '../../store/atem';
import { searchAnnotation } from '../../api/atem/annotation/apis/annotation';
import { watch } from 'vue';
import { searchFormItem, SearchResult } from '../../api/atem/rawdata/apis/rawdata';

const searchTypes = [{ value: 1, label: "Form Item" }, { value: 2, label: "Annotation" }];
const emit = defineEmits<{ (e: "close", formId: number): void }>();
const { content } = defineProps<{ content: string }>();
const { activeAnnoationVersionId, activeProjectVersionId } = storeToRefs(useAtem());
const searchType = ref(searchTypes[0].value);
const searchResults: Ref<SearchResult[]> = ref([]);

function fowardToForm(formId: number) {
    emit("close", formId);
}

async function updateSearchResults() {
    if (!activeProjectVersionId.value) {
        searchResults.value = [];
        return;
    }
    if (searchType.value === 1) {
        searchResults.value = await searchFormItem({
            projectVersionId: activeProjectVersionId.value as number,
            search: content,
        });
    } else {
        searchResults.value = activeAnnoationVersionId.value ? await searchAnnotation({
            projectVersionId: activeProjectVersionId.value as number,
            annotationVersionId: activeAnnoationVersionId.value as number,
            search: content,
        }) : [];
    }
}

watch(() => searchType.value, updateSearchResults);
onMounted(updateSearchResults);

</script>

<template>
    <el-radio-group v-model="searchType" size="small">
        <el-radio-button v-for="option in searchTypes" :label="option.label" :value="option.value"
            :key="option.value" />
    </el-radio-group>
    <el-table :data="searchResults" max-height="480px">
        <el-table-column label="Form" width="250px">
            <template #default="scope">
                <el-link @click="() => { fowardToForm(scope.row.form.id) }" type="primary">
                    {{ scope.row.form.description }} [{{ scope.row.form.name }}]</el-link>
            </template>
        </el-table-column>
        <el-table-column label="Type" width="120px">
            <template #default="scope">
                <el-tag size="small" style="width:80px">{{ scope.row.kind }}</el-tag>
            </template>
        </el-table-column>
        <el-table-column label="Content" prop="content" />
    </el-table>

</template>

<style scoped></style>