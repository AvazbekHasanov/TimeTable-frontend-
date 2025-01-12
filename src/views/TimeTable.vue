<script>
import {defineComponent, inject} from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import SideBar from "../components/SideBar.vue";

export default defineComponent({
  components: {
    SideBar,
    FullCalendar,
  },
  data() {
    return {
      showCalendar: false,
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
        //   day: '2-digit',
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
        editable: true,
        selectable: false,
        selectMirror: true,
        dayMaxEvents: true,
        weekends: true,
        slotMinTime: '09:00:00', // Start time at 9:00 AM
        slotMaxTime: '18:00:00', // End time at 6:00 PM
        slotDuration: '00:30:00', // Each slot is 30 minutes
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
    this.getTimeTableData();
  },
  methods: {
    getTimeTableData(){
      this.showCalendar = false;
      fetch(`${this.baseUrl}/student/timetable`)
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
      window.open(`${this.baseUrl}/download-schedule`, '_blank');
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
    <div class="demo-app-main">
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

</style>
