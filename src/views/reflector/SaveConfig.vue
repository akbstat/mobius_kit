<script lang="ts" setup>
import { ref } from 'vue';

const name = ref("");
const saveAs = ref(false);
</script>

<template>
    <el-form label-width="auto">
        <el-form-item label="Name">
            <el-input v-model="name" clearable />
        </el-form-item>
        <el-form-item label="Save As">
            <el-switch v-model="saveAs" />
        </el-form-item>
    </el-form>
    <el-form-item>
        <el-button type="primary" plain>
            <el-icon>
                <Check />
            </el-icon>
        </el-button>
        <el-button type="danger" plain>
            <el-icon>
                <Close />
            </el-icon>
        </el-button>
    </el-form-item>
</template>