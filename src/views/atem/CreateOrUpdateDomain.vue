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


function close(submit: boolean) {
    emit("close", submit);
}

function changeDomainDisable(): boolean {
    return existedDomain ? true : false;
}

function queryDomain(queryString: string, _cb: (arg: any) => void) {
    return domainList.value.map(v => { return { value: v.name } }).filter(v => v.value.toLowerCase().includes(queryString.toLowerCase()))
}

function changeDomain(value: string) {
    incommingDomain.value.name = value.toUpperCase();
    if (value.length > 0) {
        const { name, description } = domainList.value.filter((d: Domain) => d.name === value.toUpperCase())[0] || { name: value.toUpperCase(), description: "" };
        incommingDomain.value = { name, description };
        return;
    }
    incommingDomain.value.description = "";
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

    <el-autocomplete style="width: 25%;margin-right: 5px;" clearable :disabled="changeDomainDisable()"
        @change="changeDomain" :fetch-suggestions="queryDomain" v-model="incommingDomain.name"
        placeholder="Domain Name">
    </el-autocomplete>

    <el-input v-model="incommingDomain.description" clearable class="domain-description" placeholder="Domain Label" />
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
.domain-description {
    width: 70%;
    ;
}

.button-area {
    margin-top: 10px;
}
</style>