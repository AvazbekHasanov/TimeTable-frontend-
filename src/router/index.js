import { createWebHistory, createRouter } from "vue-router";
import TimeTable from "../views/TimeTable.vue";
import AddTeacher from "../views/AddTeacher.vue";
import TeacherSchedule from "../views/TeacherSchedule.vue";
const routes = [
  {
    path: "/",
    name: "TimeTable",
    component: TimeTable,
  },
  {
    path: "/add-teacher",
    name: "AddTeacher",
    component: AddTeacher,
  },
  {
    path: "/teacher-schedule",
    name: "TeacherSchedule",
    component: TeacherSchedule,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
