<script lang="ts" setup>
import { useDark, useToggle } from '@vueuse/core';
import { Sunny, Moon } from '@element-plus/icons-vue';
import { onMounted, Ref, ref } from 'vue';
import { isProdEnv } from '../api/utils/env';

const isDark = useDark();
const toggleDark = useToggle(isDark);
const backgroundColor = ref("");
const props = defineProps<{ user: string }>();
const isProd: Ref<boolean> = ref(false);

function headerBackgroundColor() {
    return isDark.value ? "rgb(24.4, 33.8, 43.5)" : "rgb(216.8, 235.6, 255)";
}

function headerContainerStyle() {
    return {
        height: "100%",
        color: "#409EFF",
        backgroundColor: headerBackgroundColor(),
    }
}

function LogoStyle() {
    return {
        marginLeft: "15px",
        fontSize: "20px",
        textAlign: "left",
        height: "100%",
        paddingTop: "15px",
        color: "#409EFF",
        backgroundColor: headerBackgroundColor(),
    }
}



onMounted(async () => {
    isProd.value = await isProdEnv();
});

</script>

<template>
    <el-container :style="headerContainerStyle()">
        <el-header>
            <el-container>
                <el-aside width="25%" :style="LogoStyle()">AkesoBio
                    - Möbius <span v-if="!isProd">(Testing)</span></el-aside>
                <el-main style="padding: 15px;">
                    <div>
                        <el-icon style="margin-right: 8px; margin-top: 1px">
                            <ElementPlus />
                        </el-icon>
                        <span>{{ props.user }}</span>
                        <el-switch inline-prompt :active-icon="Moon" :inactive-icon="Sunny" style="margin-left: 10px;"
                            v-model="isDark" @change="(value: string | number | boolean) => {
                                backgroundColor = value ? '' : 'white';
                                toggleDark(value as boolean);
                            }" />
                    </div>
                </el-main>
            </el-container>
        </el-header>
    </el-container>
</template>

<style scoped>
.el-header {
    text-align: right;
    padding: 0;
}
</style>