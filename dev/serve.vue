<script>
import Vue from 'vue';
import VueTelInput from '@/vue-tel-input.vue';

export default Vue.extend({
  name: 'ServeDev',
  components: {
    VueTelInput
  },
  mounted() {
    // console.log(this.$refs.telnet.findCountryFromISOCode('91'), 'this.$refs.telnet')
  }
});
</script>

<template>
  <div id="app">
    <vue-tel-input ref="telnet">
    </vue-tel-input>
  </div>
</template>
