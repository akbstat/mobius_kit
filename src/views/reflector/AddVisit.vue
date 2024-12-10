<script lang="ts" setup>
import { ref } from 'vue';

const newItemName = ref("");
</script>

<template>
    <el-form label-width="auto">
        <el-form-item label="Visit Name">
            <el-input v-model="newItemName" clearable />
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