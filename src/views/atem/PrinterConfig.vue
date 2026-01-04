<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useProjectContext } from '../../store/context';
import { latestAcrfFilepath } from '../../api/utils/project_path';

const { project } = useProjectContext();
const folder = ref("");
const filename = ref("acrf");
const emit = defineEmits<{ (e: "close", filepath: string | undefined): void }>();

function closeDialog() {
    emit("close", undefined);
}

function submit() {
    const filepath = `${folder.value}\\${filename.value}.pdf`;
    emit("close", filepath);
}

onMounted(async () => {
    if (project) {
        const acrf = await latestAcrfFilepath(project);
        folder.value = acrf.split("\\").slice(0, -1).join("\\");
    }
});

</script>

<template>
    <el-form label-width="">
        <el-form-item label="Save To :">
            <el-input clearable class="folder" v-model="folder">
                <template #prefix>
                    <el-icon>
                        <FolderOpened />
                    </el-icon>
                </template>
            </el-input>
            <el-input v-model="filename" clearable class="file">
                <template #suffix>
                    .pdf
                </template>
            </el-input>
        </el-form-item>
        <el-form-item>
            <el-button @click="submit" type="primary" size="small" plain>
                <el-icon>
                    <Check />
                </el-icon>
            </el-button>
            <el-button @click="closeDialog" type="danger" size="small" plain>
                <el-icon>
                    <Close />
                </el-icon>
            </el-button>
        </el-form-item>
    </el-form>

</template>

<style scoped>
.folder {
    width: 70%
}

.file {
    margin-left: 5px;
    width: 25%;
}
</style>