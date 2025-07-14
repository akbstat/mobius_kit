<script lang="ts" setup>
import { ElMessage, FormInstance, FormRules } from 'element-plus';
import { reactive, ref } from 'vue';
import { createAnnotationVersion } from '../../../api/atem/annotation/apis/annotation';

interface FormData { versionName: string, description: string };

const emit = defineEmits<{ (e: "close"): void }>();
const { projectVersionId } = defineProps<{ projectVersionId: number | undefined }>();
const ruleFormRef = ref<FormInstance>();
const formData = reactive<FormData>({
    versionName: "",
    description: "",
});

const rules = reactive<FormRules<FormData>>({
    versionName: [{ required: true, message: "Version name cannot be empty", trigger: "blur" }],
});


async function submit(formEl: FormInstance | undefined) {
    if (formEl) {
        await formEl.validate(async (valid, _) => {
            if (valid) {
                try {
                    await createAnnotationVersion({ projectVersionId: projectVersionId as number, name: formData.versionName, description: formData.description });
                    ElMessage.success("Create annotation version successfully");
                } catch (err) {
                    ElMessage.error(`Failed to create annotation version, because: ${err}`)
                }
                close();
            } else {
                ElMessage.error(`Failed to create annotation version, because: invalid fields`)
            }
        });
    }
}

function close() {
    emit("close");
}
</script>

<template>
    <el-form ref="ruleFormRef" :rules="rules" :model="formData" label-width="auto">
        <el-form-item label="Version Name" prop="versionName">
            <el-input v-model="formData.versionName" clearable />
        </el-form-item>
        <el-form-item label="Description">
            <el-input v-model="formData.description" clearable />
        </el-form-item>
        <el-form-item>
            <div>
                <el-button type="primary" @click="submit(ruleFormRef)" size="small" plain>
                    <el-icon>
                        <Check />
                    </el-icon>
                </el-button>
                <el-button type="danger" @click="close" size="small" plain>
                    <el-icon>
                        <Close />
                    </el-icon>
                </el-button>
            </div>
        </el-form-item>
    </el-form>
</template>

<style scoped></style>