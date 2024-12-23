<script lang="ts" setup>
import { computed, reactive, ref } from 'vue';
import { useReflector } from '../../store/reflector.ts';
import { storeToRefs } from 'pinia';
import type { FormInstance, FormRules } from "element-plus";

const { event } = storeToRefs(useReflector());
const emit = defineEmits<{ (e: 'close'): void }>();
const ruleFormRef = ref<FormInstance>();
const visitNameEditable = computed(() => {
    return visit.running;
});
const visit = reactive({
    name: "",
    running: false,
});

function cancelAddVisit() {
    emit("close");
}

function addVisit() {
    event.value.addVisit({ name: visit.name, running: visit.running });
    emit("close");
}

function submitForm(formEl: FormInstance | undefined) {
    if (!formEl) return;
    formEl.validate((valid) => {
        if (valid) {
            addVisit();
        }
    });
}

function checkVisitName(_: any, value: string, callback: any) {
    if (!value || value.length === 0) {
        return callback(new Error("Visit name can not be empty."))
    }
    callback();
}

const rules = reactive<FormRules<typeof visit>>({
    name: [{ validator: checkVisitName, trigger: 'blur' }],
})

function runningSwitch() {
    if (visit.running) {
        visit.name = "Running Records";
        return;
    }
    visit.name = "";
}


</script>

<template>
    <el-form ref="ruleFormRef" :rules="rules" :model="visit" label-width="auto">
        <el-form-item prop="name" label="Visit Name">
            <el-input :disabled="visitNameEditable" v-model="visit.name" clearable />
        </el-form-item>
        <el-form-item label="Running Records">
            <el-switch @change="runningSwitch" v-model="visit.running" />
        </el-form-item>
        <el-form-item>
            <div class="buttom-area">
                <el-button @click="submitForm(ruleFormRef)" type="primary" plain>
                    <el-icon>
                        <Check />
                    </el-icon>
                </el-button>
                <el-button @click="cancelAddVisit" type="danger" plain>
                    <el-icon>
                        <Close />
                    </el-icon>
                </el-button>
            </div>
        </el-form-item>
    </el-form>

</template>

<style scoped>
.buttom-area {
    margin-top: 15px;
}
</style>