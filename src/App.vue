<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
// import Greet from "./components/Greet.vue";
import { RouterView } from 'vue-router';
import { currentUser } from "./api/mobiuskit/user";
import { onMounted, ref } from 'vue';

const user = ref("")

onMounted(async () => { user.value = await currentUser(); })
</script>

<template>
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
          </div>
        </el-main>
      </el-container>
    </el-header>
    <el-container>
      <el-aside width="15%" height="100%">
        <el-scrollbar>
          <el-menu router>
            <el-menu-item index="/">Home</el-menu-item>
            <el-menu-item index="/project">Inspector</el-menu-item>
            <!-- <el-menu-item index="/combiner">Combiner</el-menu-item> -->
            <el-menu-item index="/divider">Divider</el-menu-item>
            <el-menu-item index="/scaffold">Scaffold</el-menu-item>
            <el-menu-item index="/void-probe">Void Probe</el-menu-item>
          </el-menu>
        </el-scrollbar>
      </el-aside>
      <el-main>
        <el-scrollbar>
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

.layout-container .toolbar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  right: 20px;
}
</style>
