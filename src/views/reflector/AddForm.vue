<script lang="ts" setup>
import { Ref, ref } from 'vue';

const name = ref("");
const page: Ref<number> = ref(0);
</script>

<template>
    <el-form label-width="auto">
        <el-form-item label="Form Name">
            <el-input v-model="name" clearable />
        </el-form-item>
        <el-form-item label="Page">
            <el-input-number v-model="page" />
        </el-form-item>
        <el-form-item>
            <div class="buttom-area">
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
            </div>
        </el-form-item>
    </el-form>
</template>

<style scoped>
.buttom-area {
    margin-top: 15px;
}
</style>