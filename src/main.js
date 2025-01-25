import { createApp } from 'vue'
import './style.css'
import DemoApp from './DemoApp.vue'
import router from './router'


// Vuetify
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi'; // Optional: For Material Design Icons

const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi',
    icons: {
      defaults: 'fa',
      aliases,
      sets: { fa, mdi }
    },
    aliases,
    sets: {
      mdi,
    },
  },
});




import { createI18n } from 'vue-i18n';


import en from './locales/en.json';
import uz from './locales/uz.json';
import {fa} from "vuetify/locale";
 const app = createApp(DemoApp)

app.use(vuetify);

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
