<script>
import Vue from 'vue';
import VueTelInput from '@/vue-tel-input.vue';

export default Vue.extend({
  name: 'ServeDev',
  components: {
    VueTelInput
  }
});
</script>

<template>
  <div id="app">
    <vue-tel-input>
    </vue-tel-input>
  </div>
</template>
