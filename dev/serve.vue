<script>
import { defineComponent } from 'vue';
import VueTelInput from '@/vue-tel-input.vue';

export default defineComponent({
  name: 'ServeDev',
  components: {
    VueTelInput
  },
});
</script>

<template>
  <div id="app">
    <vue-tel-input ref="telnet">
    </vue-tel-input>
  </div>
</template>