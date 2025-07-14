<script lang="ts" setup>
import { onMounted, ref, Ref } from 'vue';
import { listSdtmDomains } from '../../api/atem/metadata/apis/sdtm';
import { createOrUpdateDomainForForm } from '../../api/atem/annotation/apis/domain';
import { Domain } from '../../api/atem/annotation/interfaces/domain';
import { ElMessage } from 'element-plus';
import { useAtem } from '../../store/atem';

const { activeAnnoationVersionId, sdtmVersionId, activeFormDomains } = useAtem();
const { formId, existedDomain } = defineProps<{ formId: number, existedDomain?: Domain }>();
const emit = defineEmits<{ (e: "close", submit: boolean): void }>();
const incommingDomain: Ref<Domain> = ref({ name: "", description: "" });
const domainList: Ref<Domain[]> = ref([]);


/**
 * update domain name and description according selection of domain
 * @param value 
 */
function changeDomainEvent(value: number) {
    const domain = domainList.value[value];
    if (domain) {
        const { name, description } = domainList.value[value];
        incommingDomain.value = { name, description };
        return;
    }
    incommingDomain.value.description = "";
}

function close(submit: boolean) {
    emit("close", submit);
}

function changeDomainDisable(): boolean {
    return existedDomain ? true : false;
}

async function submit() {
    let operation = "Create";
    if (existedDomain) {
        incommingDomain.value.id = existedDomain.id;
        operation = "Update";
    }
    const annotationVersionId = activeAnnoationVersionId;
    if (annotationVersionId) {
        try {
            await createOrUpdateDomainForForm({ formId: formId, annotationVersionId, domain: incommingDomain.value });
            ElMessage.success(`${operation} domain succesfully`);
        } catch (err) {
            ElMessage.success(`${operation} domain failed: ${err}`);
        }
    }
    close(true);
}

onMounted(async () => {
    const inUseDomain = new Set(activeFormDomains.map(domain => domain.name));
    const sdtmDomainsMap = new Map(((await listSdtmDomains(sdtmVersionId)).filter(domain => !inUseDomain.has(domain.name))).map(domain => {
        return [domain.name, domain];
    }));
    if (existedDomain) {
        const { name, description } = existedDomain;
        incommingDomain.value = { name, description };
    }
    domainList.value = Array.from(sdtmDomainsMap.values()).map(domain => {
        const { name, description } = domain;
        return { name, description };
    }).sort((x, y) => {
        if (x.name < y.name) {
            return -1;
        }
        return 1;
    });
});
</script>

<template>
    <el-select :disabled="changeDomainDisable()" filterable clearable allow-create @change="changeDomainEvent"
        v-model="incommingDomain.name" class="domain-select">
        <el-option v-for="(domain, index) in domainList" :key="index" :value="index" :label="domain.name"></el-option>
    </el-select>
    <el-input v-model="incommingDomain.description" clearable class="domain-description" />
    <div class="button-area">
        <el-button type="primary" @click="submit" size="small" plain>
            <el-icon>
                <Check />
            </el-icon>
        </el-button>
        <el-button type="danger" @click="() => { close(false) }" size="small" plain>
            <el-icon>
                <Close />
            </el-icon>
        </el-button>
    </div>
</template>

<style scoped>
.domain-select {
    width: 25%;
    margin-right: 5px;
}

.domain-description {
    width: 70%;
    ;
}

.button-area {
    margin-top: 10px;
}
</style>