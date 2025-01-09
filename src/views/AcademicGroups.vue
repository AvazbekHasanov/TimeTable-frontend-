<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <SideBar></SideBar>

    <!-- Main Content -->
    <div class="courses-container">
      <h1 class="header">Fanlar</h1>
      <table class="courses-table">
        <thead>
        <tr>
          <th>#</th>
          <th>Fan nomi</th>
          <th>Akademik guruh nomi</th>
          <th>O'quvchi soni</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(course, index) in courseList" :key="course.id">
          <td>{{ index + 1 }}</td>
          <td>{{ course.course_name }}</td>
          <td>
            <div v-if="!course.teacher_id">
              <select v-model="selectedTeachers[index]" @change="assignTeacher(index)" class="teacher-select">
                <option disabled value="">Select a teacher</option>
                <option v-for="teacher in course.teachers" :key="teacher.teacher_id" :value="teacher.teacher_id">
                  {{ teacher.name }}
                </option>
              </select>
            </div>
            <div v-else>
              <p class="teacher-name">{{ course.teacher_name }}</p>
            </div>
          </td>
          <td>
            <div>
              <button v-if="course.teacher_id" @click="toggleEditTeacher(index, true)" class="action-button">O'qituvchini almashtirish</button>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
      <button class="add-btn" @click="openModal">Formani to'ldirish</button>
    </div>

  </div>
  <!-- Modal for Adding Teacher -->
  <div v-if="showModal" class="modal-overlay">
    <div class="modal-content">
      <h3 class="modal-title">Yangi akademik guruh qo'shish</h3>
      <form @submit.prevent="addAcademicGroup">
        <div class="form-group">
          <label for="course">O'tiladigan fan</label>
          <select id="course" v-model="newAcademicGroup.course_id" required style="width: 100%">
            <option v-for="course in courses" :key="course.id" :value="course.id">{{course.course_name}}</option>
          </select>
        </div>
        <div class="form-group">
          <label for="name">Guruh nomi:</label>
          <input type="text" id="name" v-model="newAcademicGroup.name" required />
        </div>
        <div class="form-actions">
          <button type="submit" class="save-btn">Saqlash</button>
          <button type="button" class="cancel-btn" @click="showModal = false">Bekor qilish</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import {defineComponent} from 'vue';
import SideBar from "../components/SideBar.vue";
import courses from "./Courses.vue";


export default defineComponent({
  components: {
    SideBar

  },
  data() {
    return {
      courseList: [],
      courses: [],
      selectedTeachers: [],
      showModal: false,
      newAcademicGroup: {
        teacher_id: null,
        teacher_name: null,
        name: null,
        course_id: null,
      }
    };
  },

  mounted() {
    fetch('http://localhost:3000/academic/groups', {}).then(res => res.json()).then(res => {
      this.courses = res.result
    });
  },
  methods: {
    addAcademicGroup(courseIndex) {

      console.log(this.newAcademicGroup);
      fetch('http://localhost:3000/academic/group/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          course_id: this.newAcademicGroup.course_id,
          name: this.newAcademicGroup.name
        }),
      })
        .then((res) => res.json())
        .then((res) => {
          console.log('Response:', res)
        })
        .catch((err) => console.error('Error:', err));
      },
    openModal(){
      this.showModal = true;
      fetch('http://localhost:3000/course/list/admin').then(response => response.json()).then((data) => {
        this.courses = data
      })
    },
    toggleEditTeacher(index, status) {
      this.courseList[index].teacher_id = null;
      fetch('http://localhost:3000/remove-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: this.courseList[index].id,
          course_lesson_type: this.courseList[index].course_lesson_type,
        })
      }).then(res => res.json()).then((res) => {
        console.log('Response:', res)
      })
        .catch((err) => console.error('Error:', err));
    },

  },
  beforeUnmount() {

  },
});
</script>

<style scoped>

.add-btn {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.add-btn:hover {
  background-color: #0056b3;
}

.app-layout{
  display: flex;
  flex-direction: row;
  gap: 1rem;
}
.courses-container {
  padding: 20px;
  width: 100%;
}

.header {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.courses-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.courses-table th, .courses-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.courses-table th {
  background-color: #f4f4f4;
  font-weight: bold;
}

.teacher-select {
  width: 100%;
  padding: 5px;
  font-size: 14px;
}

.action-button {
  background-color: #007bff;
  color: white;
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.action-button:hover {
  background-color: #0056b3;
}

.teacher-name {
  font-weight: bold;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  width: 400px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.modal-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
  text-align: center;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
}

.save-btn {
  padding: 8px 15px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.save-btn:hover {
  background-color: #45a049;
}

.cancel-btn {
  padding: 8px 15px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.cancel-btn:hover {
  background-color: #e53935;
}
</style>

