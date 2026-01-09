<script lang="ts" setup>
import { ref } from 'vue';
import { FilterOption, GroupOption } from '../../api/inspector/inspector';
import { Check, Close } from '@element-plus/icons-vue';

const { option, sourcers } = defineProps<{ option: FilterOption, sourcers: string[] }>();
const emit = defineEmits<{ (e: "close", option: FilterOption | undefined): void }>();
const filterConfig = ref(option);
const defaultFilterOption = {
    sourcers: [],
    groupOption: GroupOption.Both,
    onlyFailedLog: false,
    onlyFailedQc: false,
    onlyFailedSequence: false,
    itemDisplay: true,
    groupisplay: true,
    logDisplay: true,
    qcResultDisplay: true,
    sequenceDisplay: true,
};

function restore() {
    filterConfig.value = defaultFilterOption;
    submit();
}

function submit() {
    emit("close", filterConfig.value);
}

function cancel() {
    emit("close", undefined);
}
</script>

<template>
    <el-form :model="filterConfig" label-width="auto">
        <el-form-item label="Sourcer">
            <el-select multiple v-model="filterConfig.sourcers">
                <el-option v-for="sourcer in sourcers" :value="sourcer" :label="sourcer" />
            </el-select>
        </el-form-item>
        <el-form-item label="Group">
            <el-radio-group size="small" v-model="filterConfig.groupOption" fill="#409eff">
                <el-radio label="Both" :value="GroupOption.Both" />
                <el-radio label="Production" :value="GroupOption.Production" />
                <el-radio label="Validation" :value="GroupOption.Validation" />
            </el-radio-group>
        </el-form-item>
        <el-form-item label="Status">
            <el-checkbox style="width: 100%;" v-model="filterConfig.onlyFailedLog" label="Only Failed Logs"
                size="default" />
            <el-checkbox style="width: 100%;" v-model="filterConfig.onlyFailedQc" label="Only Failed QC Result"
                size="default" />
            <el-checkbox style="width: 100%;" v-model="filterConfig.onlyFailedSequence" label="Only Failed Sequences"
                size="default" />
        </el-form-item>
        <el-form-item label="Columns">
            <el-checkbox style="width: 100%;" v-model="filterConfig.itemDisplay" label="Item" size="default" />
            <el-checkbox style="width: 100%;" v-model="filterConfig.groupisplay" label="Group" size="default" />
            <el-checkbox style="width: 100%;" v-model="filterConfig.logDisplay" label="Log" size="default" />
            <el-checkbox style="width: 100%;" v-model="filterConfig.qcResultDisplay" label="Qc Result" size="default" />
            <el-checkbox style="width: 100%;" v-model="filterConfig.sequenceDisplay" label="Sequence" size="default" />
        </el-form-item>
        <el-form-item>
            <el-button @click="submit" type="primary" plain>
                <el-icon>
                    <Check />
                </el-icon>
            </el-button>
            <el-button @click="restore" type="warning" plain>
                <el-icon>
                    <RefreshLeft />
                </el-icon>
            </el-button>
            <el-button @click="cancel" type="danger" plain>
                <el-icon>
                    <Close />
                </el-icon>
            </el-button>
        </el-form-item>
    </el-form>
</template>