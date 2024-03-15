<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { open } from '@tauri-apps/api/dialog';
import { storeToRefs } from 'pinia';
import { Item, ProjectKind, popContent, statusFilter, GroupKind } from "./project";
import { fetchSdtm, fetchAdam, fetchTfls, inferPathAdam, inferPathSdtm, inferPathTfls } from "../../api/inspector/project";
import { ElNotification } from "element-plus";
import { useInspector } from "../../store/inspector";
import InspectorItem from "../../components/InspectorItem.vue";
import { debounce } from "lodash";

const store = useInspector();

const configPageShow = ref(false);
const itemFilter = ref("");
const { config, root, projectKind, configFileList } = storeToRefs(store);
const project = ref<Item[]>([]);
const itemShow = ref<Item[]>([]);
const pathForInfer = ref("");
const tableLoading = ref(false);

const tagType = (value: string) => {
    switch (value) {
        case "Ready":
            return "success";
        case "Changed":
            return "warning";
        case "Unexpected":
            return "danger";
        case "Pass":
            return "success";
        case "NotMatch":
            return "danger";
        case "NotApplicable":
            return "info";
        case "NotStart":
            return "warning";
    }
    return "";
};

const extractFileName = (name: string): string => {
    let paths = name.split("\\");
    let names = paths[paths.length - 1].split(".");
    return names.slice(0, names.length - 1).join(".");
};

function devStatusFilterHandler(
    value: string,
    row: Item,
    // column: TableColumnCtx<Item>
) {
    return row.groups[0].status === value;
}

function qcStatusFilterHandler(
    value: string,
    row: Item,
    // column: TableColumnCtx<Item>
) {
    return row.groups[1].status === value;
}

async function selectDirectory() {
    const dir = (await open({
        directory: true,
    })) as string;
    if (dir.length > 0) {
        pathForInfer.value = dir;
    }
};


async function projectPath() {
    if (pathForInfer.value.length === 0) {
        return;
    }
    try {
        switch (projectKind.value) {
            case ProjectKind.SDTM:
                ({ config: configFileList.value, root: root.value } = JSON.parse(await inferPathSdtm(pathForInfer.value)));
                break;
            case ProjectKind.ADaM:
                ({ config: configFileList.value, root: root.value } = JSON.parse(await inferPathAdam(pathForInfer.value)));
                break;
            case ProjectKind.TFLs:
                ({ config: configFileList.value, root: root.value } = JSON.parse(await inferPathTfls(pathForInfer.value)));
                break;
        }
        pathForInfer.value = root.value;
        if (configFileList.value.length > 0) {
            config.value = configFileList.value[configFileList.value.length - 1];
        }
        // configPageShow.value = false;
        // configConfirmShow.value = true;
    } catch (error) {
        ElNotification({
            title: 'Error',
            message: 'Invalid file path',
            type: 'error',
        })
    }
}

async function submit() {
    let data;
    if (config.value === "") {
        ElNotification({
            title: 'Error',
            message: 'Invalid Configuration',
            type: 'error',
        })
        return
    }
    tableLoading.value = true;
    try {
        switch (projectKind.value) {
            case ProjectKind.SDTM:
                data = JSON.parse(await fetchSdtm(config.value, root.value));
                break;
            case ProjectKind.ADaM:
                data = JSON.parse(await fetchAdam(config.value, root.value));
                break;
            case ProjectKind.TFLs:
                data = JSON.parse(await fetchTfls(config.value, root.value));
                break;

        }
    } catch (error) {
        ElNotification({
            title: 'Error',
            message: 'Invalid file path',
            type: 'error',
        })
        tableLoading.value = false;
    }
    configPageShow.value = false;
    project.value = data.items;
    itemShow.value = project.value;
    tableLoading.value = false;
    itemFilter.value = "";
}

watch(pathForInfer, debounce(projectPath, 100));

watch(projectKind, debounce(async () => {
    await projectPath();
    submit()
}, 100))

watch(itemFilter, debounce(() => {
    if (itemFilter.value.length === 0) {
        itemShow.value = project.value;
        return;
    }
    itemShow.value = project.value.filter(item => {
        return item.name.toUpperCase().includes(itemFilter.value.toUpperCase());
    });
}, 100))

onMounted(() => {
    pathForInfer.value = root.value;
    if (config.value.length > 0 && root.value.length > 0) {
        submit();
    }
});

</script>

<template>
    <el-container style="padding:5px">
        <div style="width: 91.5%;">
            <el-radio-group v-model="projectKind">
                <el-radio-button :label="ProjectKind.SDTM" />
                <el-radio-button :label="ProjectKind.ADaM" />
                <el-radio-button :label="ProjectKind.TFLs" />
            </el-radio-group>
        </div>
        <div>
            <el-button type="primary" @click="() => { submit() }" style="width: 40px;" plain>
                <el-icon>
                    <Refresh />
                </el-icon>
            </el-button>
            <el-button type="primary" style="width: 40px;" @click="() => configPageShow = true" plain>
                <el-icon>
                    <Tools />
                </el-icon>
            </el-button>
        </div>
    </el-container>
    <el-container style="padding:5px">
        <el-table v-loading="tableLoading" height="600" :data="itemShow">
            <el-table-column type="expand">
                <template #default="scope">
                    <InspectorItem :item="scope.row"></InspectorItem>
                </template>
            </el-table-column>
            <el-table-column label="Item" prop="name">
                <template #header>
                    <el-input v-model="itemFilter" style="width: 50%;" placeholder="Search Item" clearable />
                </template>
            </el-table-column>
            <el-table-column label="Production" width="355px" :filters="statusFilter(GroupKind.Production)"
                :filter-method="devStatusFilterHandler">
                <template #default="scope">
                    <el-popover trigger="hover" :content="popContent(scope.row.groups[0].status)" placement="top-start"
                        :width="300">
                        <template #reference>
                            <el-tag :type="tagType(scope.row.groups[0].status)" :style="{ width: 100 + 'px' }">{{
                scope.row.groups[0].status
            }}</el-tag>
                        </template>
                    </el-popover>
                </template>
            </el-table-column>
            <el-table-column label="Validation" :filters="statusFilter(GroupKind.Validation)"
                :filter-method="qcStatusFilterHandler">
                <template #default="scope">
                    <el-popover trigger="hover" :content="popContent(scope.row.groups[1].status)" placement="top-start"
                        :width="300">
                        <template #reference>
                            <el-tag :type="tagType(scope.row.groups[1].status)" :style="{ width: 100 + 'px' }">{{
                scope.row.groups[1].status
            }}</el-tag>
                        </template>
                    </el-popover>
                </template>
            </el-table-column>
            <el-table-column width="70px">
                <template #header>

                </template>
            </el-table-column>
        </el-table>
    </el-container>
    <el-drawer title="Configuration" size="600px" v-model="configPageShow">
        <el-form label-position="left" label-width="90px">
            <el-form-item label="Project Type">
                <el-radio-group v-model="projectKind">
                    <el-radio-button :label="projectKind" />
                </el-radio-group>
            </el-form-item>
            <el-form-item label="Directory">
                <el-col :span="3">
                    <el-button type="primary" @click="selectDirectory" plain>Select</el-button>
                </el-col>
                <el-col :span="1"></el-col>
                <el-col :span="19">
                    <el-input v-model="pathForInfer" clearable></el-input>
                </el-col>
            </el-form-item>
            <el-form-item label="Configuration">
                <el-select v-model="config" :style="{ width: '96%' }" default-first-option>
                    <el-option v-for=" config  in  configFileList " :key="config" :label="extractFileName(config)"
                        :value="config" />
                </el-select>
            </el-form-item>
        </el-form>
        <div style="margin-top: 40px;">
            <el-button type="primary" @click="submit" plain>Confirm</el-button>
            <el-button @click="() => configPageShow = false" plain>Cancel</el-button>
        </div>
    </el-drawer>

</template>

<style>
.el-dialog.el-button {
    width: 70px
}
</style>