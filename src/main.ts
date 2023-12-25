import { createApp } from "vue";
import "./styles.css";
import App from "./App.vue";
import router from "./router";
import "element-plus/theme-chalk/el-message-box.css"

const app = createApp(App);

app.use(router);

app.mount("#app");
