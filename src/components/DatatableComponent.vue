<template>
  <v-container>
    <v-text-field v-model="search" label="Search" class="mb-3"></v-text-field>

    <v-data-table-server
        v-model:items-per-page="itemsPerPage"
        :headers="headers"
        :items="serverItems"
        :items-length="totalItems"
        :loading="loading"
        :search="search"
        item-value="_id"
        @update:options="loadItems"
    ></v-data-table-server>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    itemsPerPage: 10,
    headers: [
      { title: "Name", key: "name" },
      { title: "Trips", key: "trips" },
      { title: "Airline Name", key: "airline[0].name" },
      { title: "Airline Country", key: "airline[0].country" },
      { title: "Established", key: "airline[0].established" },
    ],
    search: '',
    serverItems: [],
    loading: false,
    totalItems: 0,
  }),
  methods: {
    loadItems({ page, itemsPerPage }) {
      this.loading = true;
      fetch(`https://api.instantwebtools.net/v1/passenger?page=${page-1}&size=${itemsPerPage}`)
          .then(res => res.json())
          .then(response => {
            console.log(response);
            this.serverItems = response.data; // Assign passenger list
            this.totalItems = response.totalPassengers-1; // Assign total count
            // response.totalPages
            this.loading = false;
          })
          .catch(error => {
            console.error("Error fetching data:", error);
            this.loading = false;
          });
    },
  },
}
</script>
