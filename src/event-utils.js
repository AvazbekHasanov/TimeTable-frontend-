let eventGuid = 0;

// Function to create a unique event ID
export function createEventId() {
  return String(eventGuid++);
}

// Fetch data from the API and update INITIAL_EVENTS
const requestOptions = {
  method: "GET",
  redirect: "follow",
};

export let INITIAL_EVENTS = []; // Start with an empty array

// Fetch data from the API
fetch("http://localhost:3000/student/timetable", requestOptions)
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json(); // Parse response as JSON
  })
  .then((result) => {
    console.log(result);
    // Map the API response to match the format of INITIAL_EVENTS
    INITIAL_EVENTS = result.result.map((event) => ({
      id: createEventId(), // Generate unique event ID
      title: event.title, // Use the `title` field from the response
      course_name: event.course_name, // Use `course_name`
      start: event.start, // Use the `start` time from the response
      end: event.end, // Use the `end` time from the response
      location: event.location, // Use `location`
      teacher: event.teacher, // Use `teacher`
      course_lesson_type: event.course_lesson_type, // Additional info if needed
    }));

    console.log("Updated INITIAL_EVENTS:", INITIAL_EVENTS);
  })
  .catch((error) => console.error("Error fetching timetable:", error));
