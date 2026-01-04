<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, FormInstance, FormRules } from 'element-plus';
import { AnnotationVersion } from '../../../api/atem/annotation/interfaces/annotation';
import { modifyAnnotationVersion } from '../../../api/atem/annotation/apis/annotation';

interface FormData { versionName: string, description: string };

const ruleFormRef = ref<FormInstance>();
const props = defineProps<{ version: AnnotationVersion | undefined }>();
const emit = defineEmits<{ (e: "close", change: boolean): void }>();
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
                if (props.version) {
                    try {
                        await modifyAnnotationVersion(
                            {
                                id: props.version.id,
                                projectVersionId: props.version.projectVersionId as number,
                                name: formData.versionName,
                                description: formData.description,
                            });
                        ElMessage.success("Create annotation version successfully");
                    } catch (err) {
                        ElMessage.error(`Failed to modify annotation version, because: ${err}`)
                    }
                }
                emit("close", true);
            } else {
                ElMessage.error(`Failed to modify annotation version, because: invalid fields`)
            }
        });
    }
}

function close() {
    emit("close", false);
}

onMounted(() => {
    if (props.version) {
        formData.versionName = props.version.name;
        formData.description = props.version.description;
    }
})

</script>

<template>
    <el-form ref="ruleFormRef" :rules="rules" :model="formData" label-width="auto">
        <el-form-item class="item" label="Version Name" prop="versionName">
            <el-input v-model="formData.versionName" class="version-name" clearable />
        </el-form-item>
        <el-form-item class="item" label="Description">
            <el-input v-model="formData.description" class="version-name" clearable />
        </el-form-item>
        <el-form-item>
            <div class="button-area">
                <el-button @click="submit(ruleFormRef)" type="primary" size="small" plain>
                    <el-icon>
                        <Check />
                    </el-icon>
                </el-button>
                <el-button @click="close" type="danger" size="small" plain>
                    <el-icon>
                        <Close />
                    </el-icon>
                </el-button>
            </div>
        </el-form-item>
    </el-form>
    <span></span>
</template>

<style scoped>
.item {
    margin-bottom: 20px;
}
</style>