<script lang="ts" setup>
import { ref } from 'vue';
import { open } from '@tauri-apps/api/dialog';
import { configRootDir, Project, ProjectKind } from '../../api/inspector/inspector';

const props = defineProps<{
    project: Project;
    kind: ProjectKind;
    configFile: string;
    qcIgnore: string[],
}>();
const emit = defineEmits<{ (e: "update", config: string, qcIgnore: string[]): void; (e: "close"): void }>();
const configFile = ref(props.configFile);
const qcIgnore = ref(props.qcIgnore);

async function selectConfig() {
    const { product, trial, purpose } = props.project;
    const kind = props.kind;
    const defaultPath = await configRootDir({ product, trial, purpose, kind });
    configFile.value = (await open({
        defaultPath,
        filters: [{
            extensions: ['xlsx'],
            name: ''
        }]
    })) as string;
}

function close() {
    emit("close");
}

function submit() {
    emit("update", configFile.value, qcIgnore.value);
}


</script>

<template>
    <el-form label-width="auto">
        <el-form-item label="Configuration">
            <el-input v-model="configFile" clearable>
                <template #prepend>
                    <el-button @click="selectConfig">
                        <el-icon>
                            <FolderOpened />
                        </el-icon>
                    </el-button>
                </template>
            </el-input>
        </el-form-item>
        <el-form-item label="Qc Ignore Option">
            <el-checkbox-group v-model="qcIgnore">
                <el-checkbox label="Attribute Difference" value="Attribute Difference" />
                <el-checkbox label="Not Excatly Equal" value="Not Excatly Equal" />
            </el-checkbox-group>
        </el-form-item>
        <el-form-item>
            <el-button @click="submit" type="primary" plain>
                <el-icon>
                    <Check />
                </el-icon>
            </el-button>
            <el-button @click="close" type="danger" plain>
                <el-icon>
                    <Close />
                </el-icon>
            </el-button>
        </el-form-item>
    </el-form>
</template>

<style scoped></style>