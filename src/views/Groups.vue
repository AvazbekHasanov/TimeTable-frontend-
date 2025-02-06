<template>
  <div style="display: flex; flex-direction:row;">
    <SideBar></SideBar>
    <Loader v-if="loading" />
    <div class="table-container">
      <h2 class="table-title">Guruhlar ro'yxati</h2>
      <v-data-table-server
        :items-per-page="itemsPerPage"
        :headers="headers"
        :items="groups"
        :items-length="totalCount"
        :loading="loading"
        item-value="id"
        @update:options="getGroups"
      >
        <template v-slot:item.index="{ index }">
          {{ index + 1 }}
        </template>
        <template v-slot:item.name="{ item }">
          {{ item.name }}
        </template>
        <template v-slot:item.courses="{ item }">
          <span v-html="item.courses"></span>
        </template>

        <template v-slot:item.action="{ item }" >
         <div style="display: flex; flex-direction: row; gap: 1rem">
           <v-btn @click="editGroup(item)"> <v-icon :class="`mdi mdi-pencil`"></v-icon> Edit </v-btn>
           <v-btn @click="deleteGroup(item)"> <v-icon :class="`mdi mdi-delete`"></v-icon> Delete </v-btn>
         </div>
        </template>
      </v-data-table-server>
      <button class="add-btn" @click="showModal = true">Formani to'ldirish</button>

      <!-- Modal for Adding Teacher -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-content">
          <h3 class="modal-title">Yangi fan qo'shish</h3>
          <form @submit.prevent="addTeacher">
            <div class="form-group">
              <label for="name">Guruh nomi:</label>
              <input type="text" id="name" v-model="groupData.name" required />
            </div>
            <div class="form-group">
              <label for="degree">O'quvchilar soni</label>
              <input type="number" id="degree" v-model="groupData.student_count" required />
            </div>
            <div class="form-actions">
              <button type="submit" class="save-btn" @click="saveGroup">Saqlash</button>
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
import Loader from "../components/Loader.vue";
export default {
  components: {Loader, Trash, SideBar},
  data() {
    return {
      groups: [],
      page: 1,
      baseUrl: null,
      showModal: false,
      groupData: {
        id: null,
        student_count: 0,
        name: null
      },
      itemsPerPage: 4,
      totalCount: 0,
      headers: [
        { title: '#', align: 'start', key: 'index',  sortable: false },
        { title: 'Nomi', align: 'start', key: 'name', sortable: false },
        { title: 'Talabalr soni', align: 'start', key: 'student_count', sortable: false },
        { title: "O'tiladigan fanlar", align: 'start', key: 'courses', sortable: false,
          cellClass: "max-width-200", width: '250px'},
        { title: 'Amallar', align: 'start', key: 'action', sortable: false },
      ],
      loading: false,
    };
  },
  mounted() {
    this.baseUrl = inject("baseUrl");
    this.getGroups({page: 1,itemsPerPage: this.itemsPerPage });

  },
  computed: {

  },
  methods: {
     getGroups({page, itemsPerPage}) {
       this.itemsPerPage = itemsPerPage;
      this.loading = true;
       fetch(`${this.baseUrl}/groups?limit=${itemsPerPage}&page=${page-1}`).then(response => response.json()).then((data) => {
         this.totalCount = data.data.totalCount;
        this.groups = data.data.groups;
        this.loading = false;
      })
    },
    addTeacher() {

      fetch(`${this.baseUrl}/add/group`, {
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
    editGroup(item) {
      this.groupData.id = item.id;
      this.groupData.name = item.name;
      this.groupData.student_count = item.student_count;
      this.showModal = true;
    },
   async saveGroup(){
      try {
        this.loading = true;
        fetch(`${this.baseUrl}/add/group`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({...this.groupData})
        }).then(response => response.json()).then( async (data) => {
          this.showModal = false;
          this.groupData = {}
          this.getGroups({page: 1,itemsPerPage: this.itemsPerPage });
        })
      }catch(error){
        console.log(error);
      }

    },
    deleteGroup(item) {
      try {
        fetch(`${this.baseUrl}/delete/group/${item.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: item.id
          })
        }).then(response => response.json()).then( async (data) => {
          console.log("data", data)
          this.getGroups({page: 1,itemsPerPage: this.itemsPerPage });
        })
      }catch (e) {
        console.log(e)
      }

    },
  },
};
</script>

<style>
.v-data-table__th {
  background-color: #ffffff !important; /* White background for the header */
  color: #000000 !important; /* Black text for the header */
}
.v-data-table-header {
  display: table-header-group !important;
  visibility: visible !important;
  color: #000 !important; /* Ensure the text color is visible */
}
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
