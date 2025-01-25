<template>
    <v-dialog
      v-model="dialog"
      max-width="320"
      persistent
    >
      <v-list
        class="py-2"
        color="primary"
        elevation="12"
        rounded="lg"
      >
        <v-list-item
          prepend-icon="mdi-refresh"
          title="Info loaded..."
        >
          <template v-slot:prepend>
            <div class="pe-4">
              <v-icon color="primary" size="x-large">mdi-refresh</v-icon>
            </div>
          </template>

          <template v-slot:append>
            <v-progress-circular
              color="primary"
              :indeterminate="true"
              size="16"
              width="2"
            ></v-progress-circular>
          </template>
        </v-list-item>
      </v-list>
    </v-dialog>
</template>

<script>
export default {
  props: {
    isLoaded: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      dialog: true
    }
  },
  mounted() {
    console.log('Component mounted.', this.isLoaded)
  },

  watch: {
    dialog (val) {
      if (!val) return

      setTimeout(() => (this.dialog = false), 4000)
    },
  },
}
</script>
