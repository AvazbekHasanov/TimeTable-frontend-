<template>
  <div style="display: flex; flex-direction:row;">
    <SideBar></SideBar>
    <div class="table-container">
      <h2 class="table-title">O'qituvchi ma'lumotlari</h2>
      <table class="custom-table">
        <thead>
        <tr>
          <th>#</th>
          <th>To'liq ism</th>
          <th>Daraja</th>
          <th>Qo'shilgan sana</th>
          <th>Amallar</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(teacher, index) in teachers" :key="teacher.id">
          <td>{{ index + 1 }}</td>
          <td>{{ teacher.teacher_name }}</td>
          <td>{{ teacher.degree }}</td>
          <td>{{ teacher.created_at }}</td>
          <td> <trash @click="deleteTeacher(teacher, index)"/> </td>
        </tr>
        </tbody>
      </table>
      <button class="add-btn" @click="showModal = true">Formani to'ldirish</button>

      <!-- Modal for Adding Teacher -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-content">
          <h3 class="modal-title">Yangi o'qituvchi qo'shish</h3>
          <form @submit.prevent="addTeacher">
            <div class="form-group">
              <label for="name">To'liq ism:</label>
              <input type="text" id="name" v-model="newTeacher.teacher_name" required />
            </div>
            <div class="form-group">
              <label for="degree">Daraja</label>
              <input type="text" id="degree" v-model="newTeacher.degree" required />
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
import Trash from "../public/icons/trash.vue";

export default {
  components: {Trash, SideBar},
  data() {
    return {
      showModal: false,
      teachers: [
      ],
      newTeacher: {
        teacher_name: "",
        degree: ''
      },
      baseUrl: null
    };
  },
  mounted() {
    this.baseUrl = inject("baseUrl");
    fetch(`${this.baseUrl}/teacher/list/admin`).then(response => response.json()).then((data) => {
      this.teachers = data
    })
  },
  methods: {
    addTeacher() {
      const newId = this.teachers.length + 1;
      fetch(`${this.baseUrl}/teacher/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          teacher_name: this.newTeacher.teacher_name,
          degree: this.newTeacher.degree,
        })
      }).then(response => response.json()).then((data) => {
        this.showModal = false;
        this.newTeacher = { teacher_name: '',degree: ''};
        this.teachers.push({ id: data.teacher.id,
          teacher_name: data.teacher.teacher_name,
          created_at: data.teacher.created_at,
          degree: data.teacher.degree});
      })
    },
    editTeacher(id) {
      alert(`Edit teacher with ID: ${id}`);
    },
    deleteTeacher(teacher, index) {
      if (confirm("Haqiqatdanham o'chirmoqchimisiz ?")) {
        fetch(`${this.baseUrl}/delete/item`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'teacher',
            id: teacher.id
          })
        }).then(response => response.json()).then((data) => {
          this.teachers.splice(index, 1);
        })

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
