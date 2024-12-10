<script lang="ts" setup>
import { ref } from 'vue';

const filename = ref("aCRF");
</script>

<template>
    <div>
        <el-text>
            <el-text type="primary">{{ filename }}</el-text> is generated.
        </el-text>
    </div>
    <div class="close">
        <el-button type="primary" plain>
            <el-icon>
                <Reading />
            </el-icon>
        </el-button>
        <el-button type="danger" plain>
            <el-icon>
                <Close />
            </el-icon>
        </el-button>
    </div>
</template>

<style scoped>
.close {
    margin-top: 30px
}
</style>