<script lang="ts" setup>
import { computed, onMounted, ref, Ref, watch } from 'vue';
import { useAtem } from '../../store/atem';
import { createOrUpdateAnnotation } from '../../api/atem/annotation/apis/annotation';
import { listSdtmDomains, listSdtmVariables } from '../../api/atem/metadata/apis/sdtm';
import { Annotation, AnnotationKind } from '../../api/atem/annotation/interfaces/annotation';
import { AnnotationLocation } from '../../api/atem/annotation/interfaces/annotation';

const { activeFormDomains, activeAnnoationVersionId, activeFormId, sdtmVersionId } = useAtem();
const notSubmitDisplay = "[NOT SUBMITTED]";
const { annotation, location } = defineProps<{ annotation?: Annotation, kind: AnnotationKind, location: AnnotationLocation }>();
const emit = defineEmits<{ (e: "submit"): void; (e: "cancel"): void }>();
const variables: Ref<string[]> = ref([]);

const whenVariable = ref("");
const whenValue = ref("");
const assignValue = ref("");
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
    if (selectedVariable.value !== annotation?.variable?.name || supp.value != annotation?.variable?.supp) {
        return {
            domainId: selectedDomainId.value as number,
            variableName: selectedVariable.value,
            supp: supp.value,
        };
    }
    return undefined;
});
const notSubmit = ref(false);
const isAssign = ref(false);
const supp = ref(false);
const display = ref("");


function clearDisplayAndChange() {
    display.value = "";
    whenVariable.value = "";
    whenValue.value = "";
    assignValue.value = "";
    displayChange();
}

function cancel() {
    emit("cancel");
}

function changeDomain() {
    selectedVariable.value = "";
    clearDisplayAndChange();
}

async function submit() {
    if (activeAnnoationVersionId && activeFormId) {
        await createOrUpdateAnnotation({
            formId: activeFormId,
            annotationVersionId: activeAnnoationVersionId,
            id: annotation?.id,
            location,
            assign: isAssign.value,
            annotationDisplay: notSubmit.value ? notSubmitDisplay : display.value,
            newVariable: notSubmit.value ? undefined : imcomingVariable.value,
            notSubmit: notSubmit.value,
        });
        emit("submit")
    }
}

function notSubmitted() {
    isAssign.value = true;
    selectedDomainId.value = undefined;
    selectedVariable.value = "";
    display.value = notSubmitDisplay;
}

function displayChange(_?: any) {
    if (notSubmit.value) {
        notSubmitted()
        return;
    }
    let displayContent = "";
    if (selectedVariable.value.length > 0) {
        displayContent = selectedVariable.value;
        if (assignValue.value.length > 0) {
            displayContent += ` = ${assignValue.value}`;
        }
        if (supp.value) {
            displayContent += ` in SUPP${selectedDomainName.value}`;
        } else if (whenVariable.value.length > 0 && whenValue.value.length > 0) {
            displayContent += ` when ${whenVariable.value} = ${whenValue.value}`;
        }
    }
    display.value = displayContent;
}

function queryVariable(queryString: string, cb: (arg: any) => void) {
    if (!selectedDomainName.value) {
        cb([]);
        return;
    }
    return variables.value.map(v => { return { value: v } }).filter(v => v.value.toLowerCase().includes(queryString.toLowerCase()))
}


onMounted(async () => {
    if (annotation?.variable) {
        selectedDomainId.value = annotation.variable.domainId;
    } else if (activeFormDomains.length > 0) {
        selectedDomainId.value = activeFormDomains[0].id;
    }
    if (annotation) {
        const { variable, assign, annotationDisplay } = annotation;
        if (annotationDisplay.trim() === notSubmitDisplay) {
            notSubmit.value = true;
            notSubmitted();
            return;
        }
        supp.value = variable ? variable.supp : false;
        selectedVariable.value = variable ? variable.name : "";
        isAssign.value = assign;
        display.value = annotationDisplay;
    }
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
        <el-form-item label="Not Submit">
            <el-switch v-model="notSubmit" @change="clearDisplayAndChange" />
        </el-form-item>
        <el-form-item v-if="!notSubmit" label="Supplemental">
            <el-switch @change="clearDisplayAndChange" :disabled="notSubmit" v-model="supp" />
        </el-form-item>
        <el-form-item v-if="!notSubmit" label="Domain">
            <el-select @change="changeDomain" :disabled="notSubmit" v-model="selectedDomainId">
                <el-option v-for="domain in activeFormDomains" :key="domain.id"
                    :label="`${domain.name}(${domain.description})`" :value="domain.id as number" />
            </el-select>
        </el-form-item>

        <el-form-item v-if="!notSubmit" label="Variable">
            <el-autocomplete clearable :disabled="notSubmit" @clear="displayChange" @select="displayChange"
                @change="displayChange" :fetch-suggestions="queryVariable" v-model="selectedVariable">
            </el-autocomplete>
        </el-form-item>
        <el-form-item label="Assign">
            <el-switch :disabled="notSubmit" v-model="isAssign" />
        </el-form-item>
        <el-form-item label="Display">
            <el-input :disabled="notSubmit" clearable v-model="display" />
            <div class="condition">
                <el-input v-if="!notSubmit" :disabled="notSubmit" @change="displayChange" v-model="assignValue"
                    clearable>
                    <template #prepend>=</template>
                </el-input>
            </div>
            <div class="condition">
                <el-autocomplete v-if="!notSubmit && !supp" :disabled="notSubmit" @clear="displayChange"
                    @select="displayChange" @change="displayChange" clearable :fetch-suggestions="queryVariable"
                    v-model="whenVariable">
                    <template #prefix>
                        <div class="hint">when</div>
                    </template>
                </el-autocomplete>
                <el-input v-if="!notSubmit && !supp" clearable :disabled="notSubmit" @change="displayChange"
                    v-model="whenValue"><template #prepend>=</template></el-input>
            </div>
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