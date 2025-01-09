import { createWebHistory, createRouter } from "vue-router";
import TimeTable from "../views/TimeTable.vue";
import AddTeacher from "../views/AddTeacher.vue";
import TeacherSchedule from "../views/TeacherSchedule.vue";
import Teachers from "../views/Teachers.vue";
import Courses from "../views/Courses.vue";
import AcademicGroups from "../views/AcademicGroups.vue";
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
  {
    path: "/teachers",
    name: "Teachers",
    component: Teachers,
  },
  {
    path: "/courses",
    name: "Courses",
    component: Courses,
  },
  {
    path: "/academic_group",
    name: "AcademicGroup",
    component: AcademicGroups,
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
