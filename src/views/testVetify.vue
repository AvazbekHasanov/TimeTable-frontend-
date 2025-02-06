<template>
<datatable-component></datatable-component>
</template>
<script>
import DatatableComponent from "../components/DatatableComponent.vue";

export default {
  components: {DatatableComponent},
  data () {
    return {
      search: '',
      items: [
        {
          name: 'Nebula GTX 3080',
          image: '1.png',
          price: 699.99,
          rating: 5,
          stock: true,
        },
        {
          name: 'Galaxy RTX 3080',
          image: '2.png',
          price: 799.99,
          rating: 4,
          stock: false,
        },
        {
          name: 'Orion RX 6800 XT',
          image: '3.png',
          price: 649.99,
          rating: 3,
          stock: true,
        },
        {
          name: 'Vortex RTX 3090',
          image: '4.png',
          price: 1499.99,
          rating: 4,
          stock: true,
        },
        {
          name: 'Cosmos GTX 1660 Super',
          image: '5.png',
          price: 299.99,
          rating: 4,
          stock: false,
        },
      ],
    }
  },
}
</script>
