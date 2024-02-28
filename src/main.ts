import { createApp } from "vue";
import "./styles.css";
import App from "./App.vue";
import router from "./router";
import "element-plus/theme-chalk/el-message-box.css";
import "element-plus/theme-chalk/el-notification.css";
import 'element-plus/theme-chalk/dark/css-vars.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { createPinia } from "pinia";

const app = createApp(App);
const store = createPinia();

app.use(router);
app.use(store);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.mount("#app");
