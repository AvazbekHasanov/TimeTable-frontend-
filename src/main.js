import { createApp } from 'vue'
import './style.css'
import DemoApp from './DemoApp.vue'
import router from './router'

import { createI18n } from 'vue-i18n';


import en from './locales/en.json';
import uz from './locales/uz.json';


const i18n = createI18n({
  locale: 'uz', // default locale
  messages: {
    en,
    uz
  }
});
// http://localhost:3000"
// https://timetable-backend-a5bm.onrender.com
createApp(DemoApp).use(i18n).provide("baseUrl",  "http://localhost:3000" ).use(router).mount('#app')
