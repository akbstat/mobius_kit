<script lang="ts" setup>
import { EpPropMergeType } from 'element-plus/es/utils/vue/props/types.mjs';
import { debounce } from 'lodash';
import { watch, ref, Ref, computed, onMounted } from 'vue';
import { TreeNode, listFiles, ConvertEncodingToUTF8BOM } from '../../api/codeflow/codeflow';
import { open } from '@tauri-apps/api/dialog';
import { ElNotification, ElTree } from 'element-plus';
import { useCodeFlow } from "../../store/codeflow";
import { storeToRefs } from 'pinia';

const { directory } = storeToRefs(useCodeFlow());
const fileTree: Ref<TreeNode[]> = ref([]);
const unexpectedCounter = computed(() => {
    if (fileTree.value.length === 0) {
        return 0;
    }
    return unexpectedCount(fileTree.value[0]);
});
const displayMessage = computed(() => {
    if (unexpectedCounter.value === 0) {
        return "All files are encoded in UTF-8 with BOM";
    }
    return `Unexpected files count: ${unexpectedCounter.value}`;
});
const displayMessaageType = computed(() => {
    if (unexpectedCounter.value === 0) {
        return "primary";
    }
    return `danger`;
})
const unexpectedFileTree = computed(() => {
    let trees = [];
    if (fileTree.value.length > 0) {
        let root = buildUnexpectedFileTree(fileTree.value[0]);
        if (root.children.length > 0) {
            trees.push(root);
        }
    }
    return trees;
});
const displayFileTree = computed(() => {
    if (displayMode.value === 0) {
        return unexpectedFileTree.value;
    }
    return fileTree.value;
});
const treeRef = ref<InstanceType<typeof ElTree>>();
const loading = ref(false);
const displayMode = ref(0);
const displayOption = [
    {
        value: 0,
        label: "Unexpected",
    },
    {
        value: 1,
        label: "All",
    }
];

const defaultProps = {
    children: 'children',
    label: 'label',
    isFile: false,
}

function fileTag(node: TreeNode): EpPropMergeType<StringConstructor, "" | "success" | "warning" | "info" | "danger", unknown> | undefined {
    switch (node.encoding) {
        case "UTF8BOM":
            return "";
        case "UTF8":
            return "warning";
        default:
            return "danger";
    }
}

function fileNameFontColor(node: TreeNode): { color?: string } {
    if (node.is_file && node.encoding !== "UTF8BOM") {
        return { color: "#F56C6C" };
    }
    return {};
}

function clearAllChecked() {
    treeRef.value!.setCheckedKeys([], false);
}

function encodingTagDisplay(node: TreeNode) {
    switch (node.encoding) {
        case "UTF8BOM":
            return "UTF-8 with BOM";
        case "UTF8":
            return "UTF-8";
        default:
            return "Other";
    }
}


function buildUnexpectedFileTree(root: TreeNode): TreeNode {
    if (root.is_file) {
        return root;
    }
    const unexpectedRoot: TreeNode = {
        label: root.label,
        path: root.path,
        is_file: root.is_file,
        encoding: root.encoding,
        children: [],
    };
    for (let child of root.children) {
        const unexpectedChild = buildUnexpectedFileTree(child);
        if (unexpectedChild.is_file) {
            if (unexpectedChild.encoding != "UTF8BOM") {
                unexpectedRoot.children.push(unexpectedChild);
            }
        } else {
            if (unexpectedChild.children.length > 0) {
                unexpectedRoot.children.push(unexpectedChild);
            }
        }
    }
    return unexpectedRoot
}

function unexpectedCount(root: TreeNode): number {
    if (root.is_file && root.encoding != "UTF8BOM") {
        return 1;
    }
    let count = 0;
    for (let child of root.children) {
        const childCount = unexpectedCount(child);
        count += childCount;
    }
    return count;
}

async function selectDirectory() {
    const dir = (await open({
        directory: true,
    })) as string;
    if (dir.length > 0) {
        directory.value = dir
    }
}

async function getFileTree() {
    loading.value = true;
    if (directory.value.length > 0) {
        try {
            fileTree.value = await listFiles(directory.value);
        } catch (error) {
            ElNotification({
                title: 'Error',
                message: `${error}`,
                type: 'error',
            })
        }
    }
    loading.value = false;
}

async function submit() {
    let fileList: TreeNode[] = treeRef.value!.getCheckedNodes(false, false).filter(e => {
        let node = e as TreeNode;
        return (node.is_file && node.encoding !== "UTF8BOM");
    }) as TreeNode[];
    try {
        await ConvertEncodingToUTF8BOM(fileList);
    } catch (error) {
        ElNotification({
            title: 'Error',
            message: `${error}`,
            type: 'error',
        })
    }
    await getFileTree();
}

onMounted(() => {
    if (directory.value.length > 0) {
        getFileTree();
    }
});

watch(directory, debounce(async () => {
    await getFileTree()
}, 100));

</script>

<template>
    <el-container style="padding:10px 15px 10px ">
        <el-button @click="selectDirectory" type="primary" style="width: 100px;" plain>Select</el-button>
        <el-input v-model="directory" style="padding:0px 10px 0px;" placeholder="Please input or select one directory"
            clearable />
        <el-select v-model="displayMode" placeholder="Select" style="width: 200px">
            <el-option v-for="item in displayOption" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
    </el-container>

    <el-container style="margin:0px 15px 0px ">
    </el-container>
    <el-scrollbar height="555px" style="margin: 0px 15px 0px 15px; background-color: #202121;" v-loading="loading">
        <el-tree ref="treeRef" show-checkbox style="width: 95%; margin: 15px" :data="displayFileTree"
            :props="defaultProps" node-key="path" default-expand-all>
            <template #default="{ node, data }">
                <span :style="fileNameFontColor(data)">{{ node.label }}</span>
                <span style="margin-left: auto; margin-right: 0;" v-if="data.is_file">
                    <el-tag :type="fileTag(data)" style="width: 150px;">
                        {{ encodingTagDisplay(data) }}
                    </el-tag>
                </span>
            </template>
        </el-tree>
    </el-scrollbar>
    <el-container style="margin:10px 15px 0px ">
        <el-text class="mx-1" :type="displayMessaageType">{{ displayMessage }}</el-text>
        <div style="margin-left: auto;margin-right: 0;">
            <el-button @click="submit" type="primary" style="width: 200px; " plain>Convert to UTF-8 with BOM</el-button>
            <el-button @click="clearAllChecked" type="info" style="width: 100px;" plain>Clear</el-button>
        </div>
    </el-container>
</template>
