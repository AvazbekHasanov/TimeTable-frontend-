<script>
import {defineComponent, inject} from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import SideBar from "../components/SideBar.vue";
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import {getScrollbarWidths} from "@fullcalendar/core/internal";


export default defineComponent({
  components: {
    SideBar,
    FullCalendar,
  },
  data() {
    return {
      showCalendar: false,
      groupList: [],
      group: 1,
      calendarOptions: {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        buttonText: {
          today: 'Bugun',
          month: 'oy',
          week: 'hafta',
          day: 'kun',
          download: "Yuklab olish"
        },
        // titleFormat: {
        //   year: 'numeric',
        //   month: 'long',
        //   day: '2-digit2-digit',
        // },
        headerToolbar: {
          // left: 'prev,next today',
          left: 'today',
          center: 'title',
          right: 'timeGridWeek,timeGridDay download',
        },
        customButtons: {
          download: {
            text: 'Yuklab olish', // Text displayed on the button
            // click: this.downloadPDF
            click: this.download
          }
        },
        initialView: 'timeGridWeek',
        locale: 'uz', // Set locale to default (English) or any other supported language
        weekdays: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'], // Custom weekdays in French (for example)
        months: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'], // Custom months in French
        // Optionally, you can also specify custom day names
        dayHeaderContent: this.customDayHeader,
        initialEvents: null,
        editable: false,
        selectable: false,
        selectMirror: true,
        dayMaxEvents: true,
        weekends: true,
        slotMinTime: "08:30:00",
        slotMaxTime: "22:00:00",
        slotDuration: "01:35:00",
        slotLabelContent: (args) => this.getSlotLabel(args.date),
        eventTimeFormat: {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false, // Set to false for 24-hour format
        },
        allDaySlot: false, // Remove "All-Day" section if unnecessary
        expandRows: true, // Stretch rows to fit the calendar height
        select: this.handleDateSelect,
        eventClick: this.handleEventClick,
        eventsSet: this.handleEvents,
        datesSet: this.handleDateRangeChange,
        hiddenDays: [0],
      },
      currentEvents: [],
      eventDetails: null,
      showDetails: false,
      modalPosition: {
        left: "0px",
        top: "0px",
      },
      baseUrl: null
    };
  },

  mounted() {
    this.baseUrl = inject("baseUrl");
    this.getGroups()
  },
  methods: {
    getGroups() {
      fetch(`${this.baseUrl}/group/list`).then(res => res.json()).then((res) => {
        this.groupList = res.groups;
        this.group = this.groupList[0].id;
        this.getTimeTableData();
      })
    },
    async downloadPDF() {
      await this.$nextTick(); // Ensure the DOM is updated

      const section = document.querySelector('.fc-view-harness-active');
      const todayElements = document.querySelectorAll('.fc-day-today');

      todayElements.forEach(element => {
        element.style.backgroundColor = 'transparent'; // Set background color to transparent
      });
      console.log("section section", section)
      if (!section) {
        console.error('Section is not found or not rendered.');
        return;
      }

      // Generate canvas from the section
      const canvas = await html2canvas(section);

      // Convert canvas to image
      const imgData = canvas.toDataURL('image/png');

      // Create a new PDF document with landscape orientation
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      // Adjust image dimensions for landscape orientation
      const pageWidth = 297; // A4 width in mm for landscape
      const pageHeight = 210; // A4 height in mm for landscape
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      // Ensure the image fits within the page
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, imgHeight);

      // Save the PDF
      pdf.save('section-landscape.pdf');
    },


    getSlotLabel(date) {
      // Ensure the input is a valid Date object
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        console.error("Invalid date input:", date);
        return "";
      }

      // Extract time in HH:mm format (local time)
      const timeString = `${date.getHours().toString().padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

      // Check if the time falls within lunch break (13:00 - 13:30)
      if (timeString >= "13:00" && timeString < "13:30") {
        return "";
      }

      // Custom slot mappings
      const slotTimes = [
        {start: "08:30", end: "09:50", slot: 1},
        {start: "10:05", end: "11:25", slot: 2},
        {start: "11:40", end: "13:00", slot: 3},
        {start: "13:30", end: "14:50", slot: 4},
        {start: "15:05", end: "16:25", slot: 5},
        {start: "16:40", end: "18:00", slot: 6},
        {start: "18:15", end: "19:35", slot: 7},
        {start: "19:50", end: "21:10", slot: 8},
      ];

      // Find the matching slot
      const foundSlot = slotTimes.find((slot) => {
        const slotStart = slot.start;
        const slotEnd = slot.end;
        console.log("timeString", timeString, "slotStart", slotStart, "timeString", timeString)
        return timeString >= slotStart && timeString <= slotEnd;
      });

      // Return slot label (if found) or an empty string
      const sl = foundSlot ? `${foundSlot.slot}-para` : null;
      console.log("Slot label:", sl, foundSlot, date);
      return sl ?? date;
    },

    groupSelected(){
      this.getTimeTableData()
    },
    getTimeTableData() {
      this.showCalendar = false;
      let url = this.group? `${this.baseUrl}/student/timetable?group_id=${this.group}`:`${this.baseUrl}/student/timetable`
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((result) => {
          const events = result.result.map((event) => ({
            id: event.id,
            title: event.title,
            course_name: event.course_name,
            start: event.start,
            end: event.end,
            location: event.location,
            teacher: event.teacher,
            course_lesson_type: event.course_lesson_type,
          }));

          // Update calendar options with the new events
          this.calendarOptions.initialEvents = events;
          this.showCalendar = true;
        })
        .catch((error) => console.error('Error fetching timetable:', error));

      document.addEventListener('click', this.handleOutsideClick);
    },

    customDayHeader(args) {
      const dayIndex = args.date.getDay() - 1; // Get the day index (0 to 6)

      // Use the i18n instance to get the localized day name
      const dayNames = [
        this.$t('days.monday'),
        this.$t('days.tuesday'),
        this.$t('days.wednesday'),
        this.$t('days.thursday'),
        this.$t('days.friday'),
        this.$t('days.saturday'),
        this.$t('days.sunday')
      ];

      return dayNames[dayIndex]; // Map day index to localized weekday name
    },
    handleWeekendsToggle() {
      this.calendarOptions.weekends = !this.calendarOptions.weekends;
    },
    handleDateRangeChange(dateRange) {
      console.log("Date range changed!");
      console.log("Start date:", dateRange.start.toISOString()); // Start date of the view
      console.log("End date:", dateRange.end.toISOString());     // End date of the view
      console.log("Current view type:", dateRange.view.type);
    },
    handleDateSelect(selectInfo) {
      console.log("Selected date:", selectInfo);
      return
      const title = prompt('Please enter a title for your event');
      const calendarApi = selectInfo.view.calendar;

      calendarApi.unselect(); // Clear date selection

      if (title) {
        calendarApi.addEvent({
          id: createEventId(),
          title,
          start: selectInfo.startStr,
          end: selectInfo.endStr,
          allDay: selectInfo.allDay,
        });
      }
    },

    handleOutsideClick(event) {
      // Get all elements with the specified class names
      const eventDetails = document.querySelectorAll('.event-details');
      const eventHarness = document.querySelectorAll('.fc-timegrid-event-harness');
      const eventFcMain = document.querySelectorAll('.fc-event-main');

      // Check if the click is outside any of the elements
      const isOutsideEventDetails = !Array.from(eventDetails).some(el => el.contains(event.target));
      const isOutsideEventHarness = !Array.from(eventHarness).some(el => el.contains(event.target));
      const isOutsideEventFcMain = !Array.from(eventFcMain).some(el => el.contains(event.target));

      if (isOutsideEventDetails && isOutsideEventHarness && isOutsideEventFcMain) {
        this.showDetails = false
      }
    },


    handleEventClick(clickInfo) {
      if (this.showDetails && this.eventDetails.id === clickInfo.event.id) {
        this.showDetails = false;
        return;
      }
      this.showDetails = true;

      const {clientX, clientY} = clickInfo.jsEvent; // Get the click position
      const windowCenterY = window.innerHeight / 2; // Calculate the vertical center of the viewport
      console.log("clickInfo.event", clickInfo.event);

      // Display event details in the popup
      this.eventDetails = {
        title: clickInfo.event.title,
        id: clickInfo.event.id,
        course_name: clickInfo.event.extendedProps.course_name,
        start: clickInfo.event.start ? clickInfo.event.start.toLocaleString() : 'N/A',
        end: clickInfo.event.end ? clickInfo.event.end.toLocaleString() : 'N/A',
        location: clickInfo.event.extendedProps.location || 'N/A',
        teacher: clickInfo.event.extendedProps.teacher || 'Unknown',
        course_lesson_type: clickInfo.event.extendedProps.course_lesson_type,
      };

      const popupHeight = 150; // Estimated height of the popup (adjust as needed)
      const offsetY = 10; // Small offset to prevent overlap with the element

      // Wait for the modal to be rendered and calculate its position
      this.$nextTick(() => {
        const modal = this.$refs.eventDetailsModal;

        if (!modal) {
          console.error('Modal element not found');
          return {left: '0px', top: '0px'};
        }

        // Get modal dimensions (use numeric values, not strings)
        const popupWidth = modal.offsetWidth;
        const popupHeight = modal.offsetHeight;

        // Calculate position for the modal
        let left = clientX;
        let top = clientY + offsetY; // Position below the mouse cursor

        if (left + popupWidth > window.innerWidth) {
          left = window.innerWidth - popupWidth - 10; // Add a 10px buffer from the right edge
        }
        if (left < 0) {
          left = 0; // Align to the left edge
        }

        if (top + popupHeight > window.innerHeight) {
          top = clientY - popupHeight - offsetY; // Position above the mouse cursor if there's no space below
        }

        if (top < 0) {
          top = 0; // Align to the top edge if the popup goes off the screen
        }

        // Set the modal position
        this.modalPosition = {left: `${left}px`, top: `${top}px`};
      });
    },


    handleEvents(events) {
      // Keep track of all events in the current view
      this.currentEvents = events;
    },
    switchLocale(locale) {
      this.$i18n.locale = locale;
    },
    download() {
      window.open(`${this.baseUrl}/download-schedule?student_id=${this.group}`, '_blank');
    }
  },
  beforeUnmount() {
    // Clean up the event listener on component unmount
    document.removeEventListener('click', this.handleOutsideClick);
  },
});
</script>

<template>
  <div class="demo-app">
    <!-- Sidebar -->
    <!--    <div class="sidebar">-->
    <!--      <div class="sidebar-section">-->
    <!--        <h2 class="sidebar-header">Menyular</h2>-->
    <!--        <ul class="sidebar-menu">-->
    <!--          <li><router-link to="/" class="menu-link">TimeTable</router-link></li>-->
    <!--          <li><router-link to="/add-teacher" class="menu-link">Darsga o'qituvchi biriktirish</router-link></li>-->
    <!--        </ul>-->
    <!--      </div>-->
    <!--    </div>-->

    <SideBar></SideBar>

    <!-- Main Calendar -->
    <div class="demo-app-main" ref="pdfSection"
         id="pdf-section" >
      <div style="width: 100%; display: flex; justify-content: center;">
        <select
          id="teacher-select"
          v-model="group"
          @change="groupSelected"
          class="dropdown-select"
        >
          <option disabled value="">Guruhni tanlang</option>
          <option v-for="teacher in groupList" :key="teacher.id" :value="teacher.id">
            {{ teacher.name }}
          </option>
        </select>
      </div>

      <FullCalendar
        v-if="showCalendar"
        class="demo-app-calendar"
        :options="calendarOptions"
        :dayHeaderContent="customDayHeader"
      >
        <template v-slot:eventContent="arg">
          <b>{{ arg.event.extendedProps.teacher }}</b>
          <br>
          <br>
          <i>{{ arg.event.title }}</i>
        </template>
      </FullCalendar>
    </div>

    <!-- Event Details Popup -->
    <div
      v-if="showDetails"
      class="event-details"
      ref="eventDetailsModal"
      :style="{ position: 'absolute', left: modalPosition.left, top: modalPosition.top }"
      style="background: rgb(245, 245, 245); border: 1px solid rgb(221, 221, 221);  box-shadow: rgba(0, 0, 0, 0.3) 5px 5px 8px; max-height: 100vh; overflow: auto; "
    >
      <div style="min-width: 100%; max-width: 100%;">
        <div
          style="flex: 0 0 auto; background-color: rgb(255, 255, 255); border-bottom: 1px solid rgb(128, 128, 128); padding: 10px; margin: 0px 0px 15px; position: relative; display: flex; flex-direction: row; align-items: center;">
          <img src="https://iut.edupage.org/global/pics/ui/subject_32.svg"
               style="border: none; vertical-align: middle; height: 32px;"><span
          style="margin-left: 15px; font-size: 16px; font-weight: bold; display: inline-block;">Lesson</span></div>
        <div style="padding: 0px 10px 10px;">
          <div>
            <div style="height: 15px; flex: 0 0 auto;"></div>
            <div style="font-size: 16px; margin-bottom: 5px;">Course name: {{ eventDetails.course_name }}</div>
            <div style="font-size: 16px; margin-bottom: 5px;">Start: {{ eventDetails.start }}</div>
            <div style="font-size: 16px; margin-bottom: 5px;">End: {{ eventDetails.end }}</div>
            <div style="font-size: 16px; margin-bottom: 5px;">Classroom number: {{ eventDetails.location }}</div>
            <div style="font-size: 16px; margin-bottom: 5px;">Teacher: {{ eventDetails.teacher }}</div>
            <div style="font-size: 16px; margin-bottom: 5px;">Lesson type: {{ eventDetails.course_lesson_type }}</div>
          </div>
        </div>
      </div>


    </div>


  </div>

</template>


<style lang='css' scoped>


h2 {
  margin: 0;
  font-size: 16px;
}

ul {
  margin: 0;
  padding: 0 0 0 1.5em;
}

li {
  margin: 1.5em 0;
  padding: 0;
}

b { /* used for event dates/times */
  margin-right: 3px;
}

.demo-app {
  display: flex;
  height: 100vh;
  font-size: 14px;
  overflow-y: hidden;
}


.demo-app-main {
  flex-grow: 1;
  padding: 3em;
  overflow-y: scroll;
  width: 100%;
}


.event-details {
  z-index: 1000;
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 300px;
}


.event-details button {
  margin-top: 10px;
}

body {
  position: relative;
}
/* Select styling */
.dropdown-select {
  place-items: center;
  width: 50%;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #fff;
  color: #333;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  outline: none;
  appearance: none; /* Hides the default arrow in some browsers */
  cursor: pointer;
}

/* Add custom arrow */
.dropdown-select::-ms-expand {
  display: none;
}

.dropdown-select::after {
  content: '';
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #333;
}

/* Hover and focus styles */
.dropdown-select:hover {
  border-color: #888;
}

.dropdown-select:focus {
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}

/* Disabled option styling */
.dropdown-select option:disabled {
  color: #aaa;
}

</style>
