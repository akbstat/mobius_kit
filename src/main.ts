import { createApp } from "vue";
import "./styles.css";
import App from "./App.vue";
import router from "./router";
import "element-plus/theme-chalk/el-message-box.css";
import "element-plus/theme-chalk/el-notification.css";
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App);

app.use(router);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.mount("#app");
