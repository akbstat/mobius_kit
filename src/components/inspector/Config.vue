<script lang="ts" setup>
import { ref } from 'vue';
import { open } from '@tauri-apps/api/dialog';
import { configRootDir, Project, ProjectKind } from '../../api/inspector/inspector';

const props = defineProps<{
    project: Project;
    kind: ProjectKind;
    configFile: string;
    tracker: string,
    qcIgnore: string[],
    externalLogPatterns: {
        issue: string[],
        whiteList: string[],
    }
}>();
const emit = defineEmits<{
    (e: "update", config: string, tracker: string, qcIgnore: string[], logExternal: {
        issue: string[],
        whiteList: string[],
    }): void; (e: "close"): void
}>();
const configFile = ref(props.configFile);
const tracker = ref(props.tracker);
const qcIgnore = ref(props.qcIgnore);
const logWhiteListPatterns = ref(props.externalLogPatterns.whiteList ?? []);
const logIssuePatterns = ref(props.externalLogPatterns.issue ?? []);

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

async function selectTracker() {
    const { product, trial, purpose } = props.project;
    const kind = props.kind;
    const defaultPath = await configRootDir({ product, trial, purpose, kind });
    tracker.value = (await open({
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
    emit("update", configFile.value, tracker.value, qcIgnore.value, { whiteList: logWhiteListPatterns.value, issue: logIssuePatterns.value });
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
        <el-form-item label="Tracker">
            <el-input v-model="tracker" clearable>
                <template #prepend>
                    <el-button @click="selectTracker">
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
                <br />
                <el-checkbox label="NVar Difference" value="NVar Difference" />
                <br />
                <el-checkbox label="NObs Difference" value="NObs Difference" />
                <br />
                <el-checkbox label="Not Exactly Equal" value="Not Exactly Equal" />
            </el-checkbox-group>
        </el-form-item>
        <el-form-item>
            <el-divider content-position="center">Log Check Additional Patterns</el-divider>
        </el-form-item>
        <el-form-item label="Issue">
            <el-input-tag v-model="logIssuePatterns" placeholder="Please input a match pattern" />
        </el-form-item>
        <el-form-item label="White List">
            <el-input-tag v-model="logWhiteListPatterns" placeholder="Please input a match pattern" />
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