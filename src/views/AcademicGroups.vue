<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <SideBar></SideBar>

    <!-- Main Content -->
    <div class="courses-container">
      <div class="d-flex flex-row justify-lg-space-between align-items-center" style="align-items: center">
        <h1 class="header h-50">Fanlar</h1>
        <v-col cols="12" sm="4">
          <v-select
              v-model="filtersOptions.selectedGroup"
              :items="groups"
              item-value="id"
              item-title="name"
              label="Guruh bo'yicha filter"
              clearable
              @update:modelValue="getData({page: 1, itemsPerPage:itemsPerPage})"
          ></v-select>
        </v-col>
        <button class="add-btn h-50" @click="openModal">Formani to'ldirish</button>
      </div>
      <v-data-table-server
          v-model:items-per-page="itemsPerPage"
          :headers="headers"
          :items="courseList"
          :items-length="totalCount"
          :loading="loading"
          item-value="id"
          class="elevation-1"
          @update:options="getData"
      >
        <template v-slot:item.index="{ index }">
          {{ index + 1 }}
        </template>

        <template v-slot:item.weekdays="{ item }">
          <div v-if="item.weekdays">
            {{ item.weekdays }}
            <v-icon class="cursor-pointer" @click="addToSchedule(item)">mdi-plus-circle</v-icon>
          </div>
          <div v-else class="text-center">
            <v-icon class="cursor-pointer" @click="addToSchedule(item)">mdi-plus-circle</v-icon>
          </div>
        </template>

        <template v-slot:item.actions="{ item, index }">
          <v-btn icon @click="deleteGroup(item, index)">
            <v-icon color="red">mdi-delete</v-icon>
          </v-btn>
          <v-btn icon @click="editAcademicGroup(item, index)">
            <v-icon color="blue">mdi-pencil</v-icon>
          </v-btn>
        </template>
      </v-data-table-server>
    </div>

  </div>
  <!-- Modal for Adding Teacher -->
  <div v-if="showModal" class="modal-overlay">
    <div class="modal-content">
      <h3 class="modal-title">Yangi akademik guruh qo'shish</h3>
      <form @submit.prevent="addAcademicGroup">
        <div class="form-group">
          <label for="name">Guruh nomi:</label>
          <input type="text" id="name" v-model="newAcademicGroup.name" required>
        </div>
        <div class="form-group">
          <label for="course">O'tiladigan fan</label>
          <select id="course" v-model="newAcademicGroup.course_id" required
                  style="width: 100%;border: 1px solid;border-radius: 10px;padding: 10px;">
            <option v-for="course in courses" :key="course.id"
                    :value="course.id">{{course.course_name}}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="name">Guruhni tanlang</label>
          <Multiselect
            v-model="newAcademicGroup.groups"
            :options="groups"
            :multiple="true"
            :close-on-select="false"
            :clear-on-select="false"
            :preserve-search="true"
            placeholder="Guruhni tanlang"
            label="name"
            track-by="id"
            class="teacher-multiselect"
          />
        </div>
        <div class="form-actions">
          <button type="submit" class="save-btn" >Saqlash</button>
          <button type="button" class="cancel-btn" @click="showModal = false">Bekor qilish</button>
        </div>
      </form>
    </div>
  </div>

  <div v-if="isShowWeekdaysModal" class="modal-overlay">
    <div class="modal-content" style="width: 45vw !important;">
      <div class="subject-schedule">
        <h3 class="modal-title">{{ `${editedCourse.course_name} (${editedCourse.academic_group_name}) fanni dars jadvaliga qo'shish` }}</h3>

        <!-- Loop through each row to show weekday and type selection -->
        <div class="list-group">
          <div v-for="(schedule, index) in subjectSchedules" :key="index" class="schedule-row">
            <select v-model="schedule.day" class="select" >
              <option disabled value="">Hafta kuni</option>
              <option v-for="day in weekdays" :key="day.id" :value="day.id">{{ day.name }}</option>
            </select>
            <select v-model="schedule.type" class="select" >
              <option disabled value="">Dars turrini tanlang</option>
              <option value="LECTURE">Ma'ruza</option>
              <option value="PRACTICAL">Amaliyot</option>
            </select>
            <select v-model="schedule.slot_id" class="select">
              <option disabled value="">Para</option>
              <option v-for="slot in slots" :key="slot" :value="slot">{{ slot }}</option>
            </select>
            <select v-model="schedule.classroom" class="select">
              <option disabled value="">Xonani tanlang</option>
              <option v-for="classroom in classrooms" :key="classroom.name" :value="classroom.name">{{ classroom.name }}</option>
            </select>

            <button @click="removeRow(index)" class="remove-row-btn">×</button>

          </div>
          <button type="submit" class="save-btn" @click="addRow">Qator qo'shish</button>
        </div>


        <!-- Display result -->
        <div class="form-actions" style="margin-top: 4rem">
          <button type="submit" class="save-btn" @click="saveSchedule">Saqlash</button>
          <button type="button" class="cancel-btn" @click="closeScheduleModal">Bekor qilish</button>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
import {defineComponent, inject} from 'vue';
import SideBar from "../components/SideBar.vue";
import Trash from "../public/icons/trash.vue";
import Multiselect from 'vue-multiselect';


export default defineComponent({
  components: {
    Trash,
    SideBar,
    Multiselect

  },
  data() {
    return {
      courseList: [],
      courses: [],
      selectedTeachers: [],
      showModal: false,
      groups: [],
      headers: [
        { title: "#", key: "index", sortable: false },
        { title: "Fan nomi", key: "course_name", sortable: false },
        { title: "Akademik guruh nomi", key: "academic_group_name", sortable: false },
        { title: "O'quvchi soni", key: "student_count", sortable: false },
        { title: "O'tiladigan kunlar", key: "weekdays", sortable: false },
        { title: "Amallar", key: "actions", sortable: false }
      ],
      filtersOptions: {
        selectedGroup: 0,
        selectedCourse: null
      },
      itemsPerPage: 10,
      totalCount: 0,
      loading: false,
      newAcademicGroup: {
        teacher_id: null,
        teacher_name: null,
        name: null,
        course_id: null,
        groups: [],
      },
      isShowWeekdaysModal: false,
      editedCourse: {
      },
      classrooms: [],
      weekdays: [
        { name: "Dushanba", id: 1 },
        { name: "Seshanba", id: 2 },
        { name: "Chorshanba", id: 3 },
        { name: "Payshanba", id: 4 },
        { name: "Juma", id: 5 },
        { name: "Shanba", id: 6 },
        { name: "Yakshanba", id: 7 }
      ],
      subjectSchedules: [{id:null, day: '', type: '' , slot_id: '', classroom: ''}],
      slots: [1, 2, 3, 4, 5, 6, 7, 8],
      baseUrl: null
    };
  },
  computed: {

  },
  mounted() {
    this.baseUrl = inject("baseUrl");
    this.getData({page: 1, itemsPerPage: this.itemsPerPage});
  },
  methods: {
    // Add a new row to the schedule
    addRow() {
      this.subjectSchedules.push({id: null, day: '', type: '', slot_id: '' , classroom: ''});
    },
    closeScheduleModal(){
      this.isShowWeekdaysModal = false;
    },
    removeRow(index) {
      if (this.subjectSchedules[index].id){
        fetch(`${this.baseUrl}/delete/curriculum`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({id: this.subjectSchedules[index].id})
        }).then(res => res.json()).then((res) => {
          this.subjectSchedules.splice(index, 1);
        })
      }else{
        this.subjectSchedules.splice(index, 1);
      }

    },
    getData({page, itemsPerPage}) {
      this.loading = true;
      this.itemsPerPage = itemsPerPage;
      fetch(`${this.baseUrl}/academic/groups?group=${this.filtersOptions.selectedGroup??0}&limit=${itemsPerPage}&page=${page-1}`, {}).then(res => res.json()).then(res => {
        this.courseList = res.result.data
        this.totalCount = res.result.total_count
        this.getGroups()
        this.loading = false;
      });
    },
   async addToSchedule(course) {
     await fetch(`${this.baseUrl}/academic/group/schedule?group_id=${course.id}`).then(res => res.json()).then(res => {
       if (res.result.length>0)  {
         this.subjectSchedules = res.result
       }else {
         this.subjectSchedules = []
       }
      })
     await fetch(`${this.baseUrl}/classroom/list/admin`, {}).then(res => res.json()).then(res => {
       this.classrooms =  res.classrooms
     })
      this.isShowWeekdaysModal = true;
      this.editedCourse = course;
    },
    addWeekdays(course) {
      this.isShowWeekdaysModal = false
    },
    addAcademicGroup() {
      fetch(`${this.baseUrl}/academic/group/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          course_id: this.newAcademicGroup.course_id,
          name: this.newAcademicGroup.name,
          groups: this.newAcademicGroup.groups,
          id: this.newAcademicGroup.id
        }),
      })
        .then((res) => res.json())
        .then((res) => {
          this.getData({page: 1, itemsPerPage: this.itemsPerPage});
          this.showModal = false
        })
        .catch((err) => console.error('Error:', err));
      },
    async getGroups() {
     await fetch(`${this.baseUrl}/required/data`).then(response => response.json()).then((data) => {
        this.courses = data.courses
        this.groups = data.groups
      })
    },
   async openModal(){
      this.newAcademicGroup.groups = this.groups.filter((el) =>
          this.newAcademicGroup.groups.includes(Number(el.id)))
      this.showModal = true;
    },
    toggleEditTeacher(index, status) {
      this.courseList[index].teacher_id = null;
      fetch(`${this.baseUrl}/remove-teacher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: this.courseList[index].id,
          course_lesson_type: this.courseList[index].course_lesson_type,
        })
      }).then(res => res.json()).then((res) => {
      })
        .catch((err) => console.error('Error:', err));
    },
    saveSchedule(){
      fetch(`${this.baseUrl}/schedule/add-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          days: this.subjectSchedules,
          id: this.editedCourse.id,
          course_id: this.editedCourse.course_id
        })
      }).then(res => res.json()).then((res) => {
        this.closeScheduleModal()
      })
    },
    editAcademicGroup(course ,  index){

      this.newAcademicGroup.course_id = course.course_id;
      this.newAcademicGroup.id = course.id;
      this.newAcademicGroup.name  = course.academic_group_name;
      this.newAcademicGroup.groups = course.groups;
      this.openModal();
    },
    deleteGroup(course, index){
      if (confirm("O'chirmoqchimisiz ?")) {
        fetch(`${this.baseUrl}/delete/item`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'group',
            id: course.id
          })
        }).then(response => response.json()).then((data) => {
          this.courseList.splice(index, 1);
        })

      }
    },

  },
  beforeUnmount() {

  },
});
</script>

<style scoped>
.v-data-table {
  max-height: 80vh; /* Set the desired height */
  overflow-y: auto; /* Enable vertical scrolling if the content exceeds the height */
}
.add-btn {
  margin-top: 0 !important;
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
  height: 95vh;
  overflow-y: scroll;
}

.header {
  font-size: 24px;
  font-weight: bold;
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


/* Darsni qaysi kun o'tislishi */
.schedule-row{
  display: flex;
  flex-direction: row;
  gap: 1rem;
}
.subject-schedule {
  font-family: Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.title {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.label {
  display: block;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

.input,
.select {
  width: 100%;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.checkbox-label {
  font-size: 14px;
}

.result {
  margin-top: 20px;
  background: #ffffff;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.result h2 {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: bold;
}

.result p {
  font-size: 14px;
  color: #555;
}
.list-group{
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>

