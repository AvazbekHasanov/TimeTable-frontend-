<script>
import { defineComponent, inject } from 'vue';
import SideBar from "../components/SideBar.vue";
import TimeTableComponent from "../components/TimeTableComponent.vue";
import Loader from "../components/Loader.vue";
import Multiselect from 'vue-multiselect';
import {th} from "vuetify/locale";

export default defineComponent({
  components: {
    Loader,
    TimeTableComponent,
    SideBar,
    Multiselect
  },
  data() {
    return {
      isLoaded: false,
      courseList: [],
      selectedTeachers: [],
      baseUrl: null,
      teachers: [],
      filtersOptions: {
        selectedGroup: 0,
        selectedCourse: null
      },
    };
  },

  mounted() {
    this.baseUrl = inject("baseUrl");
    this.loadCourseList();

  },

  methods: {
    loadCourseList() {
      this.isLoaded = true;

      fetch(`${this.baseUrl}/add/teacher`)
        .then(res => res.json())
        .then(res => {
          this.courseList = res.result;
          this.isLoaded = false;
        })
        .catch(err => console.error('Error fetching teachers:', err));
    },
    assignTeacher(courseIndex) {
      const teacherId = this.selectedTeachers[courseIndex];
      if (!teacherId) return; // Check if teacher is selected before proceeding

      this.courseList[courseIndex].teacher_id = teacherId;

      // Update teacher dynamically
      const selectedTeacher = this.teachers.find(
        teacher => teacher.teacher_id === teacherId
      );
      fetch(`${this.baseUrl}/add-teacher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacher_id: selectedTeacher.teacher_id,
          science_group_id: this.courseList[courseIndex].id,
          course_lesson_type: this.courseList[courseIndex].course_lesson_type,
        }),
      })
        .then(res => res.json())
        .then(res => console.log('Response:', res))
        .catch(err => console.error('Error:', err));

      this.courseList[courseIndex].teacher_name = selectedTeacher ? selectedTeacher.name : null;
    },

    saveMultiTeachers(course) {
      console.log(course);
      this.isLoaded = true;
      fetch(`${this.baseUrl}/add/multiple-teachers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          science_group_id: course.id,
          teachers: !!course.selected_teachers && course.selected_teachers.length>0?
            course.selected_teachers.map(item => item.teacher_id) :[],
          course_lesson_type: course.course_lesson_type,
        }),
      })
        .then(res => res.json())
        .then(res => {
          console.log('Response:', res);
          this.loadCourseList();
        })
        .catch(err => console.error('Error saving multiple teachers:', err));
    },

    toggleEditTeacher(index) {
      console.log("this.courseList[index]", this.courseList[index])
      this.courseList[index]? this.courseList[index].teacher_name = null : true;
      fetch(`${this.baseUrl}/free/teacher/${this.courseList[index].id}?lesson_type=${this.courseList[index].course_lesson_type}`)
        .then(res => res.json()).then(res =>{
        console.log('Response:', res);
        this.teachers = res.freeTeachers
      })

      // fetch(`${this.baseUrl}/remove-teacher`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     id: this.courseList[index].id,
      //     course_lesson_type: this.courseList[index].course_lesson_type,
      //   }),
      // })
      //   .then(res => res.json())
      //   .then(res => {
      //
      //   })
      //   .catch(err => console.error('Error:', err));
    }
  }
});
</script>

<template>
  <Loader v-if="isLoaded" />
  <div class="app-layout">
    <SideBar />
    <div class="courses-container">
      <div class="d-flex flex-row justify-lg-space-between align-items-center" style="align-items: center">
        <h1 class="header h-50">Fanlar</h1>
        <v-col cols="12" sm="4">
          <v-select
              v-model="filtersOptions.selectedGroup"
              :items="groups"
              item-value="id"
              item-title="name"
              label="Fan bo'yicha filter"
              clearable
              @update:modelValue="getData({page: 1, itemsPerPage:itemsPerPage})"
          ></v-select>
        </v-col>
      </div>

      <div class="course-card" v-for="(course, index) in courseList" :key="course.id">
        <h2 class="course-title">{{ course.name }}</h2>
        <p class="course-detail"><strong>Fan nomi:</strong> {{ course.course_name }}</p>

        <div class="primary-teacher" v-if="course.course_lesson_type">
          <p><strong>Fan o'qituvchisi:</strong></p>

          <div v-if="!course.teacher_name" style="display: flex; flex-direction: row; gap: 20px; align-items: center;">
            <Multiselect
              @focus="toggleEditTeacher(index)"
              v-model="course.selected_teachers"
              :options="teachers"
              :multiple="true"
              :close-on-select="false"
              :clear-on-select="false"
              :preserve-search="true"
              placeholder="O'qituvchi tanlash"
              label="teacher_name"
              track-by="teacher_id"
              class="teacher-multiselect"
            />
            <button @click="saveMultiTeachers(course)" class="save-teachers-btn">Saqlash</button>
          </div>

          <div class="teacher-view-mode" v-else>
            <p class="teacher-name">{{ course.teacher_name }}</p>
            <button @click="toggleEditTeacher(index)" class="edit-teacher-btn">O'qituvchini almashtirish</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>


              <style scoped>

              .teacher-multiselect {
                width: 100%;
                max-width: 40vw;
              }

              .save-teachers-btn, .edit-teacher-btn {
                background-color: #4CAF50;
                color: white;
                padding: 8px 16px;
                border: none;
                cursor: pointer;
              }

              .save-teachers-btn:hover, .edit-teacher-btn:hover {
                background-color: #45a049;
              }


              .app-layout{
                display: flex;
                flex-direction: row;
                gap: 1rem;
                overflow-y: hidden;
              }

              .euenJR {
                padding: 0.75rem 1.25rem;
                font-size: 0.875rem;
                line-height: 1.5;
                display: inline-flex;
                cursor: pointer;
                max-width: 100%;
                align-items: center;
                justify-content: center;
                user-select: none;
                border: 2px solid rgb(138, 0, 25);
                font-weight: 600;
                text-align: center;
                text-transform: uppercase;
                border-radius: 0px;
                transition: color 150ms ease-in-out, background-color 150ms ease-in-out, border-color 150ms ease-in-out, box-shadow 150ms ease-in-out;
                background-color: rgb(255, 255, 255);
                color: rgb(138, 0, 25);
              }
              .euenJR:hover {
                background-color: rgb(138, 0, 25);
                border-color: rgb(138, 0, 25);
                color: rgb(255, 255, 255);
              }

              /* Adjust Main Content */
              .courses-container {
                width: 100%;
                margin-right: 1rem;
                overflow-y: scroll;
                height: 100vh;
              }

              .header {
                text-align: center;
                font-size: 28px;
                margin-bottom: 20px;
                color: #333;
              }

              /* Course Card */
              .course-card {
                border: 1px solid #e0e0e0;
                border-radius: 10px;
                margin-bottom: 20px;
                padding: 20px;
                background: #fff;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                transition: transform 0.2s ease, box-shadow 0.2s ease;
              }

              .course-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
              }

              .course-title {
                font-size: 22px;
                color: #4a90e2;
                margin-bottom: 10px;
              }

              .course-detail {
                margin-bottom: 10px;
                font-size: 16px;
                color: #555;
              }

              /* Primary Teacher Section */
              .primary-teacher {
                margin-top: 15px;
              }


              .teacher-name {
                font-size: 16px;
                color: #007BFF;
                font-weight: bold;
              }

              .teacher-view-mode {
                display: flex;
                justify-content: space-between;
                align-items: center;
              }

              .teacher-name {
                font-size: 16px;
                color: #444;
                font-weight: 500;
              }

              /* Responsiveness */
              @media (max-width: 768px) {
                .app-layout {
                  flex-direction: column;
                }

                .courses-container {
                  padding: 15px;
                }
              }
              </style>

