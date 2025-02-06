<script setup>
import { ref } from 'vue';
const props = defineProps({
  header: String,
  data: Array,
});

const days = ref([
    { id: 1, name: 'Dushanba' },
    { id: 2, name: 'Seshanba' },
    { id: 3, name: 'Chorshanba' },
    { id: 4, name: 'Payshanba' },
    { id: 5, name: 'Juma' },
    { id: 6, name: 'Shanba' }
  ]);
const timetable = ref([
  { time: '1-para',
    1: {
      "id": "8",
      "week_of_day": 2,
      "start": "2025-01-14T18:15:00",
      "end": "2025-01-14T19:35:00",
      "course_name": "Zamonaviy xalqaro mojarolar",
      "title": "B 512 - Zamonaviy xalqaro mojarolar",
      "location": "B 512",
      "course_lesson_type": "Amaliy",
      "teacher": "Sharapov Anri Abdullayevich"
    }, 2: '', 3: '', 4: '', 5: '', 6: '' },
  { time: '2-para', 1: '', 2: '', 3: '', 4: '', 5: '', 6: '' },
  { time: '3-para', 1: '', 2: '', 3: '', 4: '', 5: '', 6: '' },
  { time: '4-para', 1: '', 2: '', 3: '', 4: '', 5: '', 6: '' },
]);

</script>

<template>
  <div class="timetable-time-table-container">
    <div class="timetable-container-header">
      <h3 class="timetable-container-header-text">{{ props.header }}</h3>
      <table class="timetable-data-table">
        <thead class="timetable-table-header">
        <tr class="timetable-header-row">
          <th class="timetable-header-cell"></th>
          <th class="timetable-header-cell" v-for="day in days">{{day.name}}</th>
        </tr>
        </thead>
        <tbody class="timetable-table-body">
        <tr class="timetable-body-row" v-for="(item, index) in timetable" :key="index">
          <td class="timetable-body-cell" data-label="TYP">
            <h3 class="slot-text">{{item.time}}</h3>
          </td>
          <td class=" week_of_day timetable-body-cell " data-label="monday">
            <div class="schedule-card" :class="{'has-content': !!item['1'].id }">
              <div v-if="!!item['1'].id">
                <p class="schedule-card-time">
                  <span> {{item["1"].start? item["1"].start.split('T')[1]: ''}}-</span>
                  <span>{{item["1"].start? item["1"].end.split('T')[1]: ''}} </span>
                  <br>
                  <span> {{item["1"].title}} </span>
                </p>
              </div>

            </div>
          </td>
          <td class="timetable-body-cell week_of_day" data-label="tuesday">
            <div class="schedule-card" :class="{'has-content': !!item['2'].id }">

            </div>
          </td>
          <td class="timetable-body-cell week_of_day" data-label="wednesday">
            <div class="schedule-card" :class="{'has-content': !!item['3'].id }">

            </div>
          </td>
          <td class="timetable-body-cell week_of_day" data-label="thursday">
            <div class="schedule-card" :class="{'has-content': !!item['4'].id }">

            </div>
          </td>
          <td class="timetable-body-cell week_of_day" data-label="friday">
            <div class="schedule-card" :class="{'has-content': !!item['5'].id }">

            </div>
          </td>
          <td class="timetable-body-cell week_of_day" data-label="saturday">
            <div class="schedule-card" :class="{'has-content': !!item['6'].id }">

            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.timetable-time-table-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.timetable-container-header {
  width: 90%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.timetable-container-header-text {
  width: 100%;
  text-align: center;
}

.timetable-data-table {
  width: 100%;
  border-collapse: collapse;
  font-family: Arial, sans-serif;
  text-align: left;
}

.timetable-table-header .timetable-header-row .timetable-header-cell {
  border: 1px solid #ddd;
  background-color: #f2f2f2;
  padding: 8px;
  font-size: 14px;
}

.timetable-table-body .timetable-body-row .timetable-body-cell {
  border: 1px solid #ddd;
  padding: 8px;
  font-size: 14px;
}
/*.week_of_day{
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
}*/
.slot-text{
  text-wrap: nowrap;
}

/*schedule-card*/

.schedule-card{
  box-sizing: border-box;
  overflow: hidden;
  width: 10.417vw;
  min-width: 200px;
  min-height: 68px;
  height: 9vh;
  border-radius: 3px;
  cursor: pointer;
}

.has-content{
  background: rgb(255, 192, 128);
  box-shadow: rgba(0, 0, 0, 0.25) 0px 0.5px 1px 0.5px;
}

.schedule-card-time{
  font-weight: bold;
}

@media screen and (max-width: 768px) {
  .timetable-data-table,
  .timetable-table-header,
  .timetable-table-body,
  .timetable-header-row,
  .timetable-header-cell,
  .timetable-body-row,
  .timetable-body-cell {
    display: block;
  }

  .timetable-table-header .timetable-header-row {
    display: none;
  }

  .timetable-body-row {
    margin-bottom: 10px;
    border: 1px solid #ddd;
    padding: 8px;
  }

  .timetable-body-cell {
    display: flex;
    justify-content: space-between;
    padding: 8px;
  }

  .timetable-body-cell:before {
    content: attr(data-label);
    font-weight: bold;
    flex-basis: 50%;
    text-align: left;
  }

}
</style>

