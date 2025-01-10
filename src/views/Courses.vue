<template>
  <div style="display: flex; flex-direction:row;">
    <SideBar></SideBar>
    <div class="table-container">
      <h2 class="table-title">O'qituvchi ma'lumotlari</h2>
      <table class="custom-table">
        <thead>
        <tr>
          <th>#</th>
          <th>Fan nomi</th>
          <th>Credit</th>
          <th>Qo'shilgan sana</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(teacher, index) in courses" :key="teacher.id">
          <td>{{ index + 1 }}</td>
          <td>{{ teacher.course_name }}</td>
          <td>{{ teacher.credit }}</td>
          <td>{{ teacher.created_at }}</td>
        </tr>
        </tbody>
      </table>
      <button class="add-btn" @click="showModal = true">Formani to'ldirish</button>

      <!-- Modal for Adding Teacher -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-content">
          <h3 class="modal-title">Yangi fan qo'shish</h3>
          <form @submit.prevent="addTeacher">
            <div class="form-group">
              <label for="name">Kurs nomi:</label>
              <input type="text" id="name" v-model="newCourse.course_name" required />
            </div>
            <div class="form-group">
              <label for="degree">Credit</label>
              <input type="text" id="degree" v-model="newCourse.credit" required />
            </div>
            <div class="form-actions">
              <button type="submit" class="save-btn">Saqlash</button>
              <button type="button" class="cancel-btn" @click="showModal = false">Bekor qilish</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
import SideBar from "../components/SideBar.vue";
import {inject} from "vue";

export default {
  components: {SideBar},
  data() {
    return {
      showModal: false,
      courses: [
      ],
      newCourse: {
        course_name: "",
        credit: ''
      },
      baseUrl: null
    };
  },
  mounted() {
    this.baseUrl = inject("baseUrl");
    fetch(`${this.baseUrl}/course/list/admin`).then(response => response.json()).then((data) => {
      this.courses = data
    })
  },
  methods: {
    addTeacher() {
      fetch(`${this.baseUrl}/course/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          course_name: this.newCourse.course_name,
          credit: this.newCourse.credit,
        })
      }).then(response => response.json()).then((data) => {
        this.showModal = false;
        this.newCourse = { course_name: '',credit: ''};
        this.courses.push({ id: data.course.id,
          course_name: data.course.course_name,
          credit: data.course.credit,
          created_at: data.course.created_at});
      })
    },
    editTeacher(id) {
      alert(`Edit teacher with ID: ${id}`);
    },
    deleteTeacher(id) {
      if (confirm('Are you sure you want to delete this teacher?')) {
        this.teachers = this.teachers.filter((teacher) => teacher.id !== id);
      }
    },
  },
};
</script>

<style>
/* General styles */
.table-container {
  width: 100%;
  padding: 20px;
  height: 100vh;
  overflow-y: scroll;
  font-family: Arial, sans-serif;
}

.table-title {
  text-align: center;
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: bold;
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
}

.custom-table th,
.custom-table td {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: center;
}

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
