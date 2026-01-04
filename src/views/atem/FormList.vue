<script lang="ts" setup>
import { computed, onMounted, ref, Ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { FormInfo, listForms } from '../../api/atem/rawdata/apis/rawdata';
import { useAtem } from '../../store/atem';

const { activeFormId, activeProjectVersionId, multiSelector, multiOperation } = storeToRefs(useAtem());

const props = defineProps<{ collapse: boolean }>()
const forms: Ref<FormInfo[]> = ref([]);
const emit = defineEmits<{ (e: "switchForm", form: FormInfo): void }>();
const menuStyle = computed(() => { return { width: props.collapse ? '105px' : '210px' } });
function switchForm(form: FormInfo) {
    activeFormId.value = form.id;
    multiOperation.value = false;
    multiSelector.value.reset();
    emit("switchForm", form);
}

async function getForms() {
    if (activeProjectVersionId.value) {
        try {
            const reply = await listForms(activeProjectVersionId.value);
            forms.value = reply;
        } catch (error) {
            console.error('Error fetching forms:', error);
        }
    } else {
        forms.value = [];
    }
    activeFormId.value = forms.value.length > 0 ? forms.value[0].id : undefined;
}

onMounted(getForms);

watch(() => activeProjectVersionId.value, getForms);
</script>

<template>
    <el-scrollbar height="615px">
        <!-- <el-input :style="menuStyle" clearable></el-input> -->
        <el-menu :style="menuStyle" :collapse="collapse" default-active="1">
            <el-menu-item @click="() => { switchForm(form) }" class="menu-item" v-for="form in forms"
                :index="`${form.id}`">
                <template #title>
                    <el-text style="width: 150px;" truncated>
                        {{ form.description }}
                    </el-text>
                </template>
                <el-tag size="small" class="form-name">
                    {{ form.name }}
                </el-tag>
            </el-menu-item>
        </el-menu>
    </el-scrollbar>
</template>

<style scoped>
.form-name {
    padding-top: 2px;
    width: 80px;
    margin-right: 5px;
    font-size: 10px;
}
</style>