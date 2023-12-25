<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
// import Greet from "./components/Greet.vue";
import { RouterView } from 'vue-router';
</script>

<template>
  <el-container class="layout-container">
    <el-header style="text-align: right; font-size: 12px">
      <div class="toolbar">
        <span>User</span>
      </div>
    </el-header>
    <el-container>
      <el-aside width="15%" height="100%">
        <el-scrollbar>
          <el-menu router>
            <el-menu-item index="/">HomePage</el-menu-item>
            <el-menu-item index="/inspector">Inspector</el-menu-item>
            <el-menu-item index="/combiner">Combiner</el-menu-item>
            <el-menu-item index="/divider">Divider</el-menu-item>
          </el-menu>
        </el-scrollbar>
      </el-aside>
      <el-container style="height: 600px">
        <el-main>
          <el-scrollbar>
            <RouterView />
          </el-scrollbar>
        </el-main>
      </el-container>
    </el-container>
  </el-container>
</template>

<style scoped>
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
