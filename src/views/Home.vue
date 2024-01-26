<script setup lang="ts">
import router from "../router";

function gotoDivider() {
  router.push("/divider");
}

function gotoInspector() {
  router.push("/project");
}

function gotoScaffold() {
  router.push("/scaffold");
}

</script>

<template>
  <el-container style="padding: 40px;">
    <el-row style="width: 100%">
      <el-col :span="11">
        <el-card style="height: 240px;" @click="gotoDivider">
          <template #header>
            <span>Divider</span>
          </template>
          <div>A Tool for splitting large RTF files into seraval pieces</div>
        </el-card>
      </el-col>
      <el-col :span="1">
      </el-col>
      <el-col :span="11">
        <el-card style="height: 240px;" @click="gotoInspector">
          <template #header>
            <span>Inspector</span>
          </template>
          <div>A Tool for figure out the status of the project</div>
        </el-card>
      </el-col>
    </el-row>
  </el-container>

  <el-container style="padding: 40px;">
    <el-row style="width: 100%">
      <el-col :span="11">
        <el-card style="height: 240px;" @click="gotoScaffold">
          <template #header>
            <span>Scaffold</span>
          </template>
          <div>A Tool for generating sas code template</div>
        </el-card>
      </el-col>
      <el-col :span="1">
      </el-col>
      <el-col :span="11">
        <el-card style="height: 240px;">
          <template #header>
            <span>...</span>
          </template>
          <div>...</div>
        </el-card>
      </el-col>
    </el-row>
  </el-container>
</template>

<style>
.el-card:hover {
  border-color: #3375b9;
}
</style>