<script setup lang="ts">
import router from "../../router";
import { routes } from "../../router";

const routeDescription = [
  {
    name: "Divider", description: "A Tool for splitting large RTF files into seraval pieces",
  },
  {
    name: "Inspector", description: "A Tool for figure out the status of the project",
  },
  {
    name: "Scaffold", description: "A Tool for generating sas code template",
  },
  {
    name: "Void Probe", description: "Finding out page break in outputs",
  },
  {
    name: "Encoding", description: "Encoding check and convert",
  },
  {
    name: "Voyager", description: "Navigator for reading annotation information in aCRF",
  },
  {
    name: "Fusion", description: "Output combining platform",
  },
];

const routeMap = (() => {
  const routeMap = new Map<string, string>();
  routeDescription.forEach(r => {
    routeMap.set(r.name, r.description);
  });
  return routeMap;
})()


const routeInfo = (() => {
  const routeInfo: { name: string, path: string, descrption: string }[] = [];
  routes.forEach(r => {
    const name = r.name ? r.name.toString() : "";
    const path = r.path;
    const descrption = routeMap.get(name) ? routeMap.get(name) as string : "";
    if (path !== "/") routeInfo.push({ name, path, descrption })
  });
  if ((routeInfo.length & 1) === 1) {
    routeInfo.push({ name: "...", path: "/", descrption: "..." })
  }
  return routeInfo;
})();

</script>

<template>
  <el-container style="padding: 40px;">
    <el-scrollbar height="580px">
      <el-space wrap>
        <el-card class="module" v-for="info in routeInfo" @click="() => { router.push(info.path) }">
          <template #header>
            <span>{{ info.name }}</span>
          </template>
          <div>{{ info.descrption }}</div>
        </el-card>
      </el-space>
    </el-scrollbar>
  </el-container>
</template>

<style>
.el-card:hover {
  border-color: #3375b9;
}

.module {
  width: 460px;
  height: 240px;
  margin-bottom: 40px;
  margin-right: 20px;
}
</style>