<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
// import Greet from "./components/Greet.vue";
import { RouterView } from 'vue-router';
import { currentUser } from "./api/mobiuskit/user";
import { onMounted, ref } from 'vue';
import { routes } from "./router";
import "element-plus/theme-chalk/el-message.css";
import { useDark, useToggle } from '@vueuse/core';
import { Sunny, Moon } from '@element-plus/icons-vue';
// import 'element-plus/packages/menu-item/src/menu-item.css';

const user = ref("")
const isDark = useDark();
const toggleDark = useToggle(isDark);
const backgroundColor = ref("");


onMounted(async () => { user.value = await currentUser(); isDark.value = true })
</script>

<template>
  <div :style="{ backgroundColor }">
    <el-container class="layout-container">
      <el-header style="text-align: right; padding: 0px 0px 0px 0px">
        <el-container style="height: 100%; color: #409EFF; background-color: #18222c;">
          <el-aside width="15%"
            style="font-size: 20px; text-align: center; height: 100%; padding-top: 15px; color: #409EFF; background-color: #18222c;">AkesoBio
            - Möbius</el-aside>
          <el-main style="padding: 15px;">
            <div class="toolbar">
              <el-icon style="margin-right: 8px; margin-top: 1px">
                <ElementPlus />
              </el-icon>
              <span>{{ user }}</span>
              <el-switch inline-prompt :active-icon="Moon" :inactive-icon="Sunny" style="margin-left: 10px;"
                v-model="isDark" @change="(value: string | number | boolean) => {
                  backgroundColor = value ? '' : 'white';
                  toggleDark(value as boolean);
                }" />
            </div>
          </el-main>
        </el-container>
      </el-header>
      <el-container>
        <el-aside width="15%" height="100%">
          <el-scrollbar>
            <el-menu router>
              <el-menu-item v-for="route in routes" :index="route.path"> {{ route.name }}</el-menu-item>
            </el-menu>
          </el-scrollbar>
        </el-aside>
        <el-main>
          <el-scrollbar style="margin: 0;">
            <RouterView />
          </el-scrollbar>
        </el-main>
      </el-container>
    </el-container>
  </div>

</template>

<style scoped>
.layout-container {
  height: 100vh;
}

.layout-container .el-header {
  position: relative;
  background-color: var(--el-color-primary-light-7);
  color: var(--el-text-color-primary);
}

.layout-container .el-aside {
  color: var(--el-text-color-primary);
  background: var(--el-color-primary-light-8);
}

.layout-container .el-menu {
  border-right: none;
}


.layout-container .el-main {
  padding: 0;
}

.layout-container .toolbar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 90%;
  right: 20px;
}
</style>
