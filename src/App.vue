<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
// import Greet from "./components/Greet.vue";
import { RouterView } from 'vue-router';
import { currentUser } from "./api/mobiuskit/user";
import { computed, onMounted, ref } from 'vue';
import { routes } from "./router";
import "element-plus/theme-chalk/el-message.css";
import { useDark } from '@vueuse/core';
import ProjectContext from './components/ProjectContext.vue';
// import 'element-plus/packages/menu-item/src/menu-item.css';

const user = ref("")
const isDark = useDark();
const backgroundColor = computed(() => {
  return isDark.value ? '' : 'white';
});

onMounted(async () => { user.value = await currentUser(); isDark.value = true })
</script>

<template>
  <el-container :style="{ backgroundColor }" class="layout-container">
    <el-header style="padding: 0; height: 85px;">
      <el-container>
        <el-header style="padding: 0; ">
          <AppHeader :user="user" />
        </el-header>
        <el-main>
          <ProjectContext v-if="user.length > 0" :user="user" />
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
</style>
