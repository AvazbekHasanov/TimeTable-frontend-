import { createApp } from 'vue'
import './style.css'
import DemoApp from './DemoApp.vue'
import router from './router'
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';


import Button from "primevue/button";
import MultiSelect from 'primevue/multiselect';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';


import { createI18n } from 'vue-i18n';


import en from './locales/en.json';
import uz from './locales/uz.json';
 const app = createApp(DemoApp)

app.component('Button', Button);
app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('MultiSelect', MultiSelect);

app.use(PrimeVue, {
  theme: {
    preset: Aura
  }
});
const i18n = createI18n({
  locale: 'uz', // default locale
  messages: {
    en,
    uz
  }
});
// http://localhost:3000"
// https://timetable-backend-a5bm.onrender.com
// https://timetable.prime-core.uz/
app.use(i18n).provide("baseUrl",  "https://timetable-backend-a5bm.onrender.com" ).use(router).mount('#app')
