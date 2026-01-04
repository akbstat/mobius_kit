<script lang="ts" setup>
import { computed, onMounted, ref, Ref, watch } from 'vue';
import { useAtem } from '../../store/atem';
import { createOrUpdateAnnotation } from '../../api/atem/annotation/apis/annotation';
import { listSdtmDomains, listSdtmVariables } from '../../api/atem/metadata/apis/sdtm';
import { AnnotationKind } from '../../api/atem/annotation/interfaces/annotation';
import { getItemById, getOptionById, getUnitById } from '../../api/atem/rawdata/apis/rawdata';
import { defaultTarget, Target } from './utils/interfaces';

const { activeFormDomains, activeAnnoationVersionId, activeFormId, sdtmVersionId, multiSelector } = useAtem();
const emit = defineEmits<{ (e: "submit"): void; (e: "cancel"): void }>();
const variables: Ref<string[]> = ref([]);
const target: Ref<Target[]> = ref([]);
const whenVariable = ref("");
const selectedDomainId: Ref<number | undefined> = ref(undefined);
const selectedDomainName = computed(() => {
    if (selectedDomainId.value) {
        const domain = activeFormDomains.filter((e) => e.id === selectedDomainId.value);
        if (domain.length > 0) {
            return domain[0].name;
        }
    }
    return "";
});
const selectedVariable = ref("");
const imcomingVariable = computed(() => {
    return {
        domainId: selectedDomainId.value as number,
        variableName: selectedVariable.value,
        supp: supp.value,
    };
});
const isAssign = ref(false);
const supp = ref(false);

function supplementalChange() {
    if (supp.value) {
        target.value.forEach(t => {
            t.whenValue = "";
        });
    }
    clearDisplayAndChange();
}

function clearDisplayAndChange() {
    whenVariable.value = "";
    target.value.forEach(t => {
        annotationDisplayCaculation(t);
    });
}

function cancel() {
    multiSelector.reset();
    emit("cancel");
}

function changeDomain() {
    selectedVariable.value = "";
    clearDisplayAndChange();
}

async function submit() {
    if (activeAnnoationVersionId && activeFormId) {
        for (const t of target.value) {
            await createOrUpdateAnnotation({
                formId: activeFormId,
                annotationVersionId: activeAnnoationVersionId,
                id: undefined,
                location: { sourceId: t.id, kind: t.kind },
                assign: isAssign.value,
                annotationDisplay: t.annotationDisplay,
                newVariable: imcomingVariable.value,
                notSubmit: false,
                logSpread: false,
            });
        }
        emit("submit")
    }
    multiSelector.reset();
}

function annotationDisplayCaculation(target: Target) {
    let displayContent = "";
    if (selectedVariable.value.length > 0) {
        displayContent = selectedVariable.value;
        if (target.assignValue.length > 0) {
            displayContent += ` = ${target.assignValue}`;
        }
        if (supp.value) {
            displayContent += ` in SUPP${selectedDomainName.value}`;
        } else if (target.whenValue.length > 0 && whenVariable.value.length > 0) {
            displayContent += ` when ${whenVariable.value} = ${target.whenValue}`;
        }
    }
    target.annotationDisplay = displayContent;
}

function updateTarget() {
    target.value.forEach(t => {
        annotationDisplayCaculation(t);
    });
}


function queryVariable(queryString: string, cb: (arg: any) => void) {
    if (!selectedDomainName.value) {
        cb([]);
        return;
    }
    return variables.value.map(v => { return { value: v } }).filter(v => v.value.toLowerCase().includes(queryString.toLowerCase()))
}


onMounted(async () => {
    selectedDomainId.value = activeFormDomains[0].id;
    const items = [];
    const itemValues = [];
    const options = [];
    const units = [];
    for (const id of Array.from(multiSelector.itemId).sort()) {
        const item = await getItemById(id);
        if (item) {
            items.push({ ...defaultTarget, id: item.id, display: item.label, kind: AnnotationKind.Item });
        }
    }
    for (const id of Array.from(multiSelector.itemValueId).sort()) {
        const value = await getItemById(id);
        if (value) {
            itemValues.push({ ...defaultTarget, id: value.id, display: value.itemDefualtValue, kind: AnnotationKind.ItemValue });
        }
    }
    for (const id of Array.from(multiSelector.optionId).sort()) {
        const option = await getOptionById(id);
        if (option) {
            options.push({ ...defaultTarget, id: option.id, display: option.optionDisplay, kind: AnnotationKind.Option });
        }
    }
    for (const id of Array.from(multiSelector.unitId).sort()) {
        const unit = await getUnitById(id);
        if (unit) {
            units.push({ ...defaultTarget, id: unit.id, display: unit.name, kind: AnnotationKind.Unit });
        }
    }
    target.value = items.concat(itemValues).concat(options).concat(units);
});

watch(() => selectedDomainId.value, async () => {
    if (selectedDomainId.value !== undefined) {
        const sdtmDomains = (await listSdtmDomains(sdtmVersionId)).filter(domain => selectedDomainName.value === domain.name);
        if (sdtmDomains.length > 0) {
            const domain = sdtmDomains[0];
            variables.value = (await listSdtmVariables(domain.id)).map(variable => variable.name);
        }
    }
});
</script>

<template>
    <el-form label-width="auto">
        <el-form-item label="Supplemental">
            <el-switch @change="supplementalChange" v-model="supp" />
        </el-form-item>
        <el-form-item label="Domain">
            <el-select @change="changeDomain" v-model="selectedDomainId">
                <el-option v-for="domain in activeFormDomains" :key="domain.id"
                    :label="`${domain.name}(${domain.description})`" :value="domain.id as number" />
            </el-select>
        </el-form-item>
        <el-form-item label="Variable">
            <el-autocomplete clearable @clear="updateTarget" @select="updateTarget" @change="updateTarget"
                :fetch-suggestions="queryVariable" v-model="selectedVariable">
            </el-autocomplete>
        </el-form-item>
        <el-form-item label="Assign">
            <el-switch v-model="isAssign" />
        </el-form-item>
        <el-form-item label="Display">
            <el-table :data="target" max-height="250px" show-overflow-tooltip>
                <el-table-column label="Source" width="150px" prop="display" />
                <el-table-column label="Value" width="150px">
                    <template #default="scope">
                        <el-input size="small" clearable v-model="scope.row.assignValue"
                            @change="() => { annotationDisplayCaculation(scope.row) }"></el-input>
                    </template>
                </el-table-column>
                <el-table-column v-if="!supp" width="280px">
                    <template #header>
                        <el-autocomplete size="small" clearable @clear="updateTarget" @select="updateTarget"
                            @change="updateTarget" :fetch-suggestions="queryVariable" v-model="whenVariable">
                            <template #prepend>When</template>
                        </el-autocomplete>
                    </template>
                    <template #default="scope">
                        <el-input size="small" clearable v-model="scope.row.whenValue"
                            @change="() => { annotationDisplayCaculation(scope.row) }"></el-input>
                    </template>
                </el-table-column>
                <el-table-column label="Display">
                    <template #default="scope">
                        <el-input size="small" clearable v-model="scope.row.annotationDisplay"></el-input>
                    </template>
                </el-table-column>
            </el-table>
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

<style scoped>
.condition {
    margin-top: 2px;
    width: 100%;
    display: flex;
}

.hint {
    width: 30px;
    text-align: center;
}


.prepend-tag {
    text-align: center;
    width: 30px;
}
</style>