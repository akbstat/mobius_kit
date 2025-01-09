<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { ElMessage } from "element-plus";
import { debounce } from "lodash";
import { listTemplate, Version, readTemplate, saveTemplate } from "../../api/scaffold/template";
import { VersionSelected, TemplateSelected, mapKind } from "./template";


const allowOverlapDialogShow = ref(false);
const versions = ref<Version[]>([]);
const displayVersions = computed(() => {
    return versions.value.filter(version => version.role === role.value);
});
const versionSelected = ref<VersionSelected>({ dev: "", qc: "" });
const template = ref<TemplateSelected>({ dev: "", qc: "" });
const role = ref("dev");
const savePrivateTemplateDialogDisplay = ref(false);
const newTemplateVersionName = ref("");
const props = defineProps<{ kind: string }>();
const kind = mapKind(props.kind);
const emit = defineEmits<{
    (e: string, template: TemplateSelected): void
}>();

function versionOptionValue(version: Version): string {
    return `${version.name}${version.offical ? " - offical" : ""}`;
}

async function saveNewPrivateTemplate() {
    if (newTemplateVersionName.value.trim().length === 0) {
        ElMessage.error(`Version name cannot be empty`);
        return;
    }
    for (const version of versions.value.filter(v => v.role === role.value && !v.offical)) {
        if (version.name.trim() === newTemplateVersionName.value.trim() && !allowOverlapDialogShow.value) {
            allowOverlapDialogShow.value = true;
            return;
        }
    }
    const roleDisplay = role.value === "dev" ? "Production" : "Validation";
    try {
        await saveTemplate(
            { name: newTemplateVersionName.value, role: role.value, offical: false },
            kind,
            role.value === "dev" ? template.value.dev : template.value.qc
        )
    } catch (error) {
        ElMessage.error(`${error}`);
        return;
    }
    ElMessage.success(`${roleDisplay} version ${newTemplateVersionName.value}(Private) save succesfully`);
    versions.value = await listTemplate(kind);

    // update selected version to version which is new save
    if (role.value === "dev") {
        versionSelected.value.dev = newTemplateVersionName.value;
    } else {
        versionSelected.value.qc = newTemplateVersionName.value;
    }

    await templateVersionChange();
    savePrivateTemplateDialogDisplay.value = false;
    allowOverlapDialogShow.value = false;
}

function savePrivateTemplateShow() {
    savePrivateTemplateDialogDisplay.value = true;
}

function updateTemplate() {
    ElMessage.success("Template update successfully");
    emit("template-change", template.value);
}

async function templateVersionChange() {
    // restore version option
    let { dev, qc } = versionSelected.value;
    const devIsOffical = dev.endsWith(" - offical");
    const qcIsOffical = qc.endsWith(" - offical");
    dev = devIsOffical ? dev.split(" - ")[0] : dev;
    qc = qcIsOffical ? qc.split(" - ")[0] : qc;

    const devVersion = versions.value.filter(v => { return v.name === dev && v.role === "dev" && v.offical === devIsOffical })[0];
    const qcVersion = versions.value.filter(v => { return v.name === qc && v.role === "qc" && v.offical === qcIsOffical })[0];
    template.value = {
        dev: await readTemplate(devVersion, kind),
        qc: await readTemplate(qcVersion, kind),
    }
}

onMounted(async () => {
    versions.value = await listTemplate(kind);
    let offcialDevVersions = versions.value.filter(v => v.role === "dev" && v.offical);
    let offcialQcVersions = versions.value.filter(v => v.role === "qc" && v.offical);

    versionSelected.value.dev = versionOptionValue(offcialDevVersions[offcialDevVersions.length - 1]);
    versionSelected.value.qc = versionOptionValue(offcialQcVersions[offcialDevVersions.length - 1]);
    await templateVersionChange();
});

watch(versionSelected, debounce(async () => {
    await templateVersionChange()
}, 100))

</script>

<template>
    <el-container>
        <el-header style="padding: 0;">
            <el-radio-group v-model="role">
                <el-radio-button label="dev">Production</el-radio-button>
                <el-radio-button label="qc">Validation</el-radio-button>
            </el-radio-group>
            <div style="float: right; padding-top: 5px;">
                <el-select class="version-select" v-model="versionSelected[role as keyof VersionSelected]"
                    placeholder="Select" size="default" @change="templateVersionChange">
                    <el-option v-for="version in displayVersions" :value="versionOptionValue(version)">
                        <span style="float: left">{{ versionOptionValue(version) }}</span>
                    </el-option>
                </el-select>
                <el-button class="update-button" type="primary" plain @click="updateTemplate">Update</el-button>
                <el-button class="save-as-button" @click="savePrivateTemplateShow">Save As</el-button>
            </div>
        </el-header>
        <el-main style="padding: 0;">
            <el-input v-model="template[role as keyof TemplateSelected]" :autosize="{ minRows: 24, maxRows: 24 }"
                type="textarea" />
        </el-main>
    </el-container>

    <el-dialog draggable v-model="savePrivateTemplateDialogDisplay" title="Save New Private Template">
        <el-input clearable v-model="newTemplateVersionName" placeholder="Please enter a version name" />
        <div style="margin-top: 20px;">
            <el-button type="primary" plain style="margin-right: 10px" @click="saveNewPrivateTemplate">Save</el-button>
            <el-button style="margin-left: 0"
                @click="() => { savePrivateTemplateDialogDisplay = false }">Cancel</el-button>
        </div>
    </el-dialog>

    <el-dialog v-model="allowOverlapDialogShow" draggable title="Version Overlap Alert">
        <span style="font-size: medium;">
            Warning, private version <span style="color: #f78989;">{{ newTemplateVersionName }}</span> already exists,
            do you
            want
            to override it?
        </span>
        <div style="margin-top: 25px;">
            <el-button @click="saveNewPrivateTemplate" type="primary" plain>Override</el-button>
            <el-button plain>Cancel</el-button>
        </div>

    </el-dialog>

</template>

<style scoped>
.version-select {
    width: 200px;
    margin-right: 10px;
}

.update-button {
    margin-left: 0px;
}

.save-as-button {
    margin-left: 10px;
}
</style>