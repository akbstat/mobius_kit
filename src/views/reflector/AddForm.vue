<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { useReflector } from '../../store/reflector.ts';
import { storeToRefs } from 'pinia';
import type { FormInstance, FormRules } from "element-plus";

const { event } = storeToRefs(useReflector());
const emit = defineEmits<{ (e: 'close'): void }>();
const ruleFormRef = ref<FormInstance>();
const form = reactive({
    name: "",
    page: 1,
});

function cancelAddForm() {
    emit("close");
}

function addForm() {
    event.value.addForm({ name: form.name, page: form.page });
    emit("close");
}

function submitForm(formEl: FormInstance | undefined) {
    if (!formEl) return;
    formEl.validate((valid) => {
        if (valid) {
            addForm();
        }
    });
}

function checkFormName(_: any, value: string, callback: any) {
    if (!value || value.length === 0) {
        return callback(new Error("Form name can not be empty."))
    }
    callback();
}

const rules = reactive<FormRules<typeof form>>({
    name: [{ validator: checkFormName, trigger: 'blur' }],
})


</script>

<template>
    <el-form ref="ruleFormRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item prop="name" label="Form Name">
            <el-input v-model="form.name" clearable />
        </el-form-item>
        <el-form-item prop="page" label="Page">
            <el-input-number v-model="form.page" />
        </el-form-item>
        <el-form-item>
            <div class="buttom-area">
                <el-button @click="() => { submitForm(ruleFormRef) }" type="primary" plain>
                    <el-icon>
                        <Check />
                    </el-icon>
                </el-button>
                <el-button @click="cancelAddForm" type="danger" plain>
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