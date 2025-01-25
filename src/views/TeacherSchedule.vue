<script>
import {defineComponent, inject} from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import SideBar from "../components/SideBar.vue";
import html2canvas from "html2canvas";
import {jsPDF} from "jspdf";

export default defineComponent({
  components: {
    SideBar,
    FullCalendar,
  },
  data() {
    return {
      teacherList: [],
      selectedTeacher: {
        teacher_id: null,
        teacher_name: null,
        id: null,
      },
      showCalendar: false,
      calendarOptions: {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        buttonText: {
          today: 'Bugun',
          month: 'oy',
          week: 'hafta',
          day: 'kun',
        },
        // titleFormat: {
        //   year: 'numeric',
        //   month: 'long',
        //   day: '2-digit',
        // },
        headerToolbar: {
          // left: 'prev,next today',
          left: 'today',
          center: 'title',
          right: 'timeGridWeek,timeGridDay downloadEXCEL, downloadPDF',
        },
        customButtons: {
          downloadEXCEL: {
            text: 'Yuklab olish(.xlsx)', // Text displayed on the button
            click: this.download
          },
          downloadPDF: {
            text: 'Yuklab olish(.pdf)', // Text displayed on the button
            click: this.downloadPDF
          }
        },
        initialView: 'timeGridWeek',
        locale: 'uz', // Set locale to default (English) or any other supported language
        weekdays: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'], // Custom weekdays in French (for example)
        months: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'], // Custom months in French
        // Optionally, you can also specify custom day names
        dayHeaderContent: this.customDayHeader,
        initialEvents: null,
        editable: true,
        selectable: false,
        selectMirror: true,
        dayMaxEvents: true,
        weekends: true,
        slotMinTime: "08:30:00", // First slot starts at 8:30
        slotMaxTime: "22:00:00", // Adjust end time for your slots
        slotDuration: "01:35:00", // Duration for each slot
        slotLabelContent: (args) => this.getSlotLabel(args.date),
        slotLabelFormat: {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false, // Set to true for 12-hour format with AM/PM
        },
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
    this.getTeacherList()
  },
  methods: {
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
        { start: "08:30", end: "09:50", slot: 1 },
        { start: "10:05", end: "11:25", slot: 2 },
        { start: "11:40", end: "13:00", slot: 3 },
        { start: "13:30", end: "14:50", slot: 4 },
        { start: "15:05", end: "16:25", slot: 5 },
        { start: "16:40", end: "18:00", slot: 6 },
        { start: "18:15", end: "19:35", slot: 7 },
        { start: "19:50", end: "21:10", slot: 8 },
      ];

      // Find the matching slot
      const foundSlot = slotTimes.find((slot) => {
        const slotStart = slot.start;
        const slotEnd = slot.end;
        console.log("timeString", timeString, "slotStart",slotStart, "timeString", timeString)
        return timeString >= slotStart && timeString <= slotEnd;
      });

      // Return slot label (if found) or an empty string
      const sl = foundSlot ? `${foundSlot.slot}-para` : null;
      console.log("Slot label:", sl, foundSlot, date);
      return sl??date;
    },
    async getTeacherList(){
      await fetch(`${this.baseUrl}/teacher/list`).then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      }).then((data) => {
        this.teacherList = data;
        this.selectedTeacher.id = data[0].id
        this.selectedTeacher.teacher_id = data[0].teacher_id;
        this.selectedTeacher.teacher_name = data[0].teacher_name
        this.getTimeTableData(this.selectedTeacher.teacher_id);
      })
    },
    teacherSelected(){
      const selectedTeacher = this.teacherList.find(teacher => teacher.teacher_id === this.selectedTeacher.teacher_id );
      this.selectedTeacher.id = selectedTeacher.id
      this.selectedTeacher.teacher_name = selectedTeacher.teacher_name;
      this.getTimeTableData(this.selectedTeacher.teacher_id);
    },
    getTimeTableData(){
      this.showCalendar = false;
      fetch(`${this.baseUrl}/student/timetable?teacher_id=${this.selectedTeacher.teacher_id}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((result) => {
          // Map the API response to match the FullCalendar event format
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
          console.log('Updated initialEvents:', events);
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

      const { clientX, clientY } = clickInfo.jsEvent; // Get the click position
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
          return { left: '0px', top: '0px' };
        }

        // Get modal dimensions (use numeric values, not strings)
        const popupWidth = modal.offsetWidth;
        const popupHeight = modal.offsetHeight;

        // Calculate position for the modal
        let left = clientX;
        let top = clientY + offsetY; // Position below the mouse cursor

        // Boundary checks for horizontal (left and right)
        if (left + popupWidth > window.innerWidth) {
          left = window.innerWidth - popupWidth - 10; // Add a 10px buffer from the right edge
        }
        if (left < 0) {
          left = 0; // Align to the left edge
        }

        // Boundary checks for vertical (top and bottom)
        if (top + popupHeight > window.innerHeight) {
          top = clientY - popupHeight - offsetY; // Position above the mouse cursor if there's no space below
        }

        if (top < 0) {
          top = 0; // Align to the top edge if the popup goes off the screen
        }

        // Set the modal position
        this.modalPosition = { left: `${left}px`, top: `${top}px` };
      });
    },




    handleEvents(events) {
      // Keep track of all events in the current view
      this.currentEvents = events;
    },
    switchLocale(locale) {
      this.$i18n.locale = locale;
    },
    download(){
      window.open(`${this.baseUrl}/download-schedule?teacher_id=${this.selectedTeacher.teacher_id}`, '_blank');
    },
    async downloadPDF() {
      await this.$nextTick(); // Ensure the DOM is updated

      const section = document.querySelector('.fc-view-harness-active');
      const todayElements = document.querySelectorAll('.fc-day-today');

      todayElements.forEach(element => {
        element.style.backgroundColor = 'transparent'; // Set background color to transparent
      });

      if (!section) {
        console.error('Section is not found or not rendered.');
        return;
      }

      // Use a higher scale for better quality
      const scale = 2; // Adjust this value for higher quality (e.g., 2, 3)
      const canvas = await html2canvas(section, {
        scale: scale,
        useCORS: true, // Ensure cross-origin images are included
      });

      // Convert canvas to image
      const imgData = canvas.toDataURL('image/png', 1.0); // Full quality

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
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, imgHeight, undefined, 'FAST');

      // Save the PDF
      pdf.save('section-landscape.pdf');
      todayElements.forEach(element => {
        element.style.backgroundColor = ''; // Remove inline style, revert to CSS-defined value
      });
    }

  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleOutsideClick);
  },
});
</script>

<template>
  <div class="demo-app">

    <SideBar></SideBar>

    <!-- Main Calendar -->
    <div class="demo-app-main">
      <div class="dropdown-container-top">
        <div class="dropdown-container">
          <label for="teacher-select" class="dropdown-label"> O'qituvchi dars jadvali </label>
          <select
            id="teacher-select"
            v-model="selectedTeacher.teacher_id"
            @change="teacherSelected"
            class="dropdown-select"
          >
            <option disabled value="">O'qituvchini tanlangr</option>
            <option v-for="teacher in teacherList" :key="teacher.teacher_id" :value="teacher.teacher_id">
              {{ teacher.teacher_name }}
            </option>
          </select>
        </div>
      </div>
      <FullCalendar
        v-if="showCalendar"
        class="demo-app-calendar"
        :options="calendarOptions"
        :dayHeaderContent="customDayHeader"
      >
        <template v-slot:eventContent="arg">
          <b>{{ arg.timeText }}</b>
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
.euenJR {
  padding: 0.75rem 1.25rem;
  font-size: 0.875rem;
  line-height: 1.5;
  display: inline-flex;
  cursor: pointer;
  max-width: 100%;
  width: 150px;
  height: 60px;
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

.demo-app-sidebar {
  width: 300px;
  line-height: 1.5;
  background: #eaf9ff;
  border-right: 1px solid #d3e2e8;
}

.demo-app-sidebar-section {
  padding: 2em;
}

.demo-app-main {
  flex-grow: 1;
  padding: 3em;
  overflow-y: scroll;
  width: 100%;
}

.fc { /* the calendar root */
  max-width: 1100px;
  margin: 0 auto;
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

.dropdown-container-top{
  display: flex;
  flex-direction: row;
  gap: 10px;
  justify-content: center;
}

.dropdown-container {
  width: 300px;
  margin: 20px 20px;
  font-family: Arial, sans-serif;
}

/* Label styling */
.dropdown-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

/* Select styling */
.dropdown-select {
  width: 100%;
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
