<script>
import {defineComponent} from 'vue';
import SideBar from "../components/SideBar.vue";


export default defineComponent({
  components: {
    SideBar

  },
  data() {
    return {
      courseList: [],
      selectedTeachers: [],
    };
  },

  mounted() {
    fetch('http://localhost:3000/api/add/teacher', {}).then(res => res.json()).then(res => {
      console.log(res)
      this.courseList = res.result
    });
  },
  methods: {
    co() {
      return co
    },
    assignTeacher(courseIndex) {
      const teacherId = this.selectedTeachers[courseIndex];
      this.courseList[courseIndex].teacher_id = teacherId;

      // Optional: Update teacher name dynamically
      const selectedTeacher = this.courseList[courseIndex].teachers.find(
        (teacher) => teacher.teacher_id === teacherId
      );
      fetch('http://localhost:3000/add-teacher', {
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
        .then((res) => res.json())
        .then((res) => console.log('Response:', res))
        .catch((err) => console.error('Error:', err));
      this.courseList[courseIndex].teacher_name = selectedTeacher ? selectedTeacher.name : null;
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

<template>
  <div class="app-layout">
    <!-- Sidebar -->

<SideBar></SideBar>
    <!-- Main Content -->
    <div class="courses-container">
      <h1 class="header">Fanlar</h1>
      <div class="course-card" v-for="(course, index) in courseList" :key="course.id">
        <h2 class="course-title">{{ course.name }}</h2>
        <p class="course-detail"><strong>Fan nomi:</strong> {{ course.course_name }}</p>

        <div class="primary-teacher">
          <p><strong>Fan o'qituvchisi:</strong></p>


          <div v-if="!course.teacher_id">
            <select v-model="selectedTeachers[index]" @change="assignTeacher(index)" class="teacher-select">
              <option disabled value="">Select a teacher</option>
              <option v-for="teacher in course.teachers" :key="teacher.teacher_id" :value="teacher.teacher_id">
                {{ teacher.name }}
              </option>
            </select>
          </div>
          <div class="teacher-view-mode" v-else>
            <p class="teacher-name">{{ course.teacher_name }}</p>
            <button @click="toggleEditTeacher(index, true)" class="sc-3035d33f-0 euenJR">O'qituvchini almashtirish</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>

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
.sidebar {
  width: 137px;
  background: linear-gradient(135deg, #4a90e2, #005792);
  color: white;
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  overflow-y: auto; /* Enables vertical scrolling */
  height: 100vh; /* Ensures it takes the full viewport height */
  font-family: Arial, Helvetica Neue, Helvetica, sans-serif
}

.sidebar {
  width: 15%;
  background: linear-gradient(135deg, #4a90e2, #005792);
  color: white;
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  overflow-y: auto; /* Enables vertical scrolling */
  height: 100vh; /* Ensures it takes the full viewport height */
}

/* Sidebar Content */
.sidebar-section {
  margin-bottom: 20px;
}

.sidebar-header {
  font-size: 20px;
  margin-bottom: 15px;
  color: #fff;
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-link {
  display: block;
  padding: 10px 15px;
  color: white;
  text-decoration: none;
  font-size: 16px;
  border-radius: 5px;
  transition: background 0.3s ease, color 0.3s ease;
}

.menu-link:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #eaf9ff;
}

/* Adjust Main Content */
.courses-container {
  width: calc(85% - 2rem);
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

.teacher-select {
  padding: 10px 15px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background: #f9f9f9;
  width: 100%;
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

.btn {
  padding: 6px 12px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn.edit {
  background-color: #4caf50;
  color: white;
}

/* Responsiveness */
@media (max-width: 768px) {
  .app-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    padding: 15px;
    text-align: center;
  }

  .courses-container {
    padding: 15px;
  }
}
</style>

