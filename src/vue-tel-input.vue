<template>
  <div class="vue-tel-input"
       :class="{ disabled: disabled }">
       
    <div class="dropdown"
         @click="toggleDropdown"
         v-click-outside-input="clickedOutside"
         :class="{open: open}"
         @keydown="keyboardNav"
         tabindex="0"
         @keydown.esc="reset">
      <span class="selection">
        <!-- <div class="iti-flag" :class="activeCountry.iso2.toLowerCase()"></div> -->
        (+{{activeCountry.dialCode}})
        <span class="dropdown-arrow">
          {{ open ? '▲' : '▼' }}
        </span>
      </span>
      <ul :class="open ? 'myopen' : 'myclose'" ref="tellist">
        <li class="dropdown-item"
            v-for="(pb, index) in sortedCountries"
            :key="pb.iso2 + (pb.preferred ? '-preferred' : '')"
            @click="choose(pb)"
            :class="getItemClass(index, pb.iso2)"
            @mousemove="selectedIndex = index">
          <div class="iti-flag"
               :class="pb.iso2.toLowerCase()"></div>
          <strong>{{ pb.name }} </strong>
          <span>+{{ pb.dialCode }}</span>
        </li>
      </ul>
    </div>
    <!-- :formatter="format" -->
     <input ref="input"
       v-model="phone"
       type="tel"
       :placeholder="placeholder"
       :state="state"
       :disabled="disabled"
       @blur="onBlur"
       @input="onInput"
       onkeypress="return /\d/.test(String.fromCharCode(event.keyCode || event.which))"
       @change="isNumber(phone) ? '' : phone = ''"
       :maxLength="maxlength"
       :required="required"
       />
  </div>
</template>

<style src="./assets/sprite.css"></style>
<style scoped>
:local {
  --border-radius: 2px;
}

li.last-preferred {
  border-bottom: 1px solid #cacaca;
}
.iti-flag {
  margin-right: 5px;
  margin-left: 5px;
}
.dropdown-item .iti-flag {
  display: inline-block;
  margin-right: 5px;
}
.selection {
  font-size: 0.8em;
  display: flex;
  align-items: center;
}
.vue-tel-input {
  border-radius: 3px;
  display: flex;
  border: 1px solid #bbb;
  text-align: left;
}
.vue-tel-input:focus-within {
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075),
    0 0 8px rgba(102, 175, 233, 0.6);
  border-color: #66afe9;
}
input {
  border: none;
  border-radius: 0 var(--border-radius) var(--border-radius) 0;
  width: 100%;
  outline: none;
  padding-left: 7px;
}
ul {
  padding: 0;
  margin: 0;
  text-align: left;
  list-style: none;
  max-height: 200px;
  overflow-y: scroll;
  position: absolute;
  top: 33px;
  left: -1px;
  background-color: #fff;
  border: 1px solid #ccc;
  width: 390px;
  z-index: 55;
}
.dropdown {
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  position: relative;
  padding: 7px;
  cursor: pointer;
}
.dropdown.open {
  background-color: #f3f3f3;
}
.dropdown:hover {
  background-color: #f3f3f3;
}
.dropdown-arrow {
  transform: scaleY(0.5);
  display: inline-block;
  color: #666;
}
.dropdown-item {
  cursor: pointer;
  padding: 4px 15px;
}
.dropdown-item.highlighted {
  background-color: #f3f3f3;
}
.dropdown-menu.show {
  max-height: 300px;
  overflow: scroll;
}
.vue-tel-input.disabled .selection,
.vue-tel-input.disabled .dropdown,
.vue-tel-input.disabled input {
  cursor: no-drop;
}
.myclose {
  display: none !important;
}
.myopen {
  display: block !important;
}
</style>

<script>
// formatNational, formatIncompletePhoneNumber
import { AsYouType, isValidNumber } from 'libphonenumber-js';
import allCountries, { findCountryFromISO } from './assets/all-countries';
import getCountry from './assets/default-country';

export default {
  props: {
    value: {
      type: String,
    },
    maxlength: {
      type: Number,
      default: 15
    },
    placeholder: {
      type: String,
      default: 'Enter a phone number',
    },
    disabledFetchingCountry: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    preferredCountries: {
      type: Array,
      default: () => ([]),
    },
    invalidMsg: {
      default: "",
      type: String,
    },
    required: {
      type: Boolean,
      default: false,
    },
    defaultCountry: {
      // Default country code, ie: 'AU'
      // Will override the current country of user
      type: String,
      default: '',
    },
    defaultCountryDialCode: {
      // Default country code, ie: '91'
      // Will override the current country of user
      type: String,
      default: '',
    },
  },
  mounted() {
    this.initializeCountry();
  },
  created() {
    if (this.value) {
      this.phone = this.value
    }
  },
  data() {
    return {
      phone: '',
      allCountries,
      activeCountry: { iso2: '' },
      open: false,
      selectedIndex: null,
      typeToFindInput: '',
      typeToFindTimer: null,
    };
  },
  computed: {
    mode() {
      if (!this.phone) {
        return '';
      }
      if (this.phone[0] === '+') {
        return 'code';
      }
      if (this.phone[0] === '0') {
        return 'prefix';
      }
      return 'normal';
    },
    sortedCountries() {
      // Sort the list countries: from preferred countries to all countries
      const preferredCountries = this.preferredCountries
        .map(country => this.findCountry(country))
        .filter(Boolean)
        .map(country => ({ ...country, preferred: true }));

      return [...preferredCountries, ...allCountries];
    },
    formattedResult() {
      // Calculate phone number based on mode
      if (!this.mode || !this.allCountries) {
        return '';
      }
      let phone = this.phone;
      if (this.mode === 'code') {
        // If user manually type the country code
        const formatter = new AsYouType();// eslint-disable-line
        formatter.input(this.phone);

        // Find inputted country in the countries list
        this.activeCountry = this.findCountry(formatter.country) || this.activeCountry;
        // const formatter2 = new AsYouType('US');// eslint-disable-line
        // formatter2.input(this.phone);
        // console.log(formatIncompletePhoneNumber(this.phone))
      } else if (this.mode === 'prefix') {
        // Remove the first '0' if this is a '0' prefix number
        // Ex: 0432421999
        phone = this.phone.slice(1);
      }

      return phone;
      // return formatNumber(phone, this.activeCountry && this.activeCountry.iso2, 'International');
    },
    state() {
      return isValidNumber(this.formattedResult, this.activeCountry && this.activeCountry.iso2);
    },
    response() {
      // If it is a valid number, returns the formatted value
      // Otherwise returns what it is
      const number = this.state ? this.formattedResult : this.phone;
      return {
        number,
        isValid: this.state,
        country: this.activeCountry,
      };
    }
  },
  watch: {
    state(value) {
      if (value && this.mode !== 'prefix') {
        // If mode is 'prefix', keep the number as user typed,
        // Otherwise format it
        this.phone = this.formattedResult;
      }
    },
    value() {
      this.phone = this.value;
    },
  },
  methods: {
    isNumber(num) {
      return /^\d*$/.test(num)
    },
    findCountryFromISOCode(code) {
      return findCountryFromISO(code);
    },
    initializeCountry() {
      /**
       * 1. Use default country if passed from parent
       */
      if (this.defaultCountry) {
        const defaultCountry = this.findCountry(this.defaultCountry);
        if (defaultCountry) {
          this.activeCountry = defaultCountry;
          return;
        }
      } else {
        if(this.defaultCountryDialCode) {
          const defaultCountryDialCode = this.findCountryFromISO(this.defaultCountryDialCode);
          if (defaultCountryDialCode) {
            this.activeCountry = defaultCountryDialCode;
            return;
          }
          this.disabledFetchingCountry = true
        }
      }

      /**
       * 2. Use the first country from preferred list (if available) or all countries list
       */
      this.activeCountry = this.findCountry(this.preferredCountries[0]) || allCountries[0];
      this.choose(this.activeCountry)
      /**
       * 3. Check if fetching country based on user's IP is allowed, set it as the default country
       */
      if (!this.disabledFetchingCountry) {
        getCountry().then((res) => {
          this.activeCountry = this.findCountry(res) || this.activeCountry;
          this.choose(this.activeCountry)
        });
      }
    },
    findCountry(iso = '') {
      return allCountries.find(country => country.iso2 === iso.toUpperCase());
    },
    getItemClass(index, iso2) {
      const highlighted = this.selectedIndex === index;
      const lastPreferred = index === this.preferredCountries.length - 1;
      const preferred = !!~this.preferredCountries.map(c => c.toUpperCase()).indexOf(iso2);
      return {
        highlighted,
        'last-preferred': lastPreferred,
        preferred,
      };
    },
    choose(country) {
      this.activeCountry = country;
      this.$emit('onInput', this.response);
    },
    onInput() {
      this.$refs.input.setCustomValidity(this.response.isValid ? '' : this.invalidMsg);
      // Emit input event in case v-model is used in the parent
      this.$emit('input', this.response.number);
      // Emit the response, includes phone, validity and country
      this.$emit('onInput', this.response);
    },
    onBlur() {
      this.$emit('onBlur');
    },
    toggleDropdown() {
      if (this.disabled) {
        return;
      }
      this.open = !this.open;
    },
    clickedOutside() {
      this.open = false;
    },
    keyboardNav(e) {
      if (e.keyCode === 40) {
        // down arrow
        this.open = true;
        if (this.selectedIndex === null) {
          this.selectedIndex = 0;
        } else {
          this.selectedIndex = Math.min(this.sortedCountries.length - 1, this.selectedIndex + 1);
        }
        let selEle = this.$refs.tellist.children[this.selectedIndex];
        if (selEle.offsetTop + selEle.clientHeight > this.$refs.tellist.scrollTop + this.$refs.tellist.clientHeight)
          this.$refs.tellist.scrollTop = selEle.offsetTop - this.$refs.tellist.clientHeight + selEle.clientHeight;
      } else if (e.keyCode === 38) {
        // up arrow
        this.open = true;
        if (this.selectedIndex === null) {
          this.selectedIndex = this.sortedCountries.length - 1;
        } else {
          this.selectedIndex = Math.max(0, this.selectedIndex - 1);
        }
        let selEle = this.$refs.tellist.children[this.selectedIndex];
        if (selEle.offsetTop < this.$refs.tellist.scrollTop)
          this.$refs.tellist.scrollTop = selEle.offsetTop;
      } else if (e.keyCode === 13) {
        // enter key
        if (this.selectedIndex !== null) {
          this.choose(this.sortedCountries[this.selectedIndex]);
        }
        this.open = !this.open;
      } else {
        // typing a country's name
        this.typeToFindInput += e.key;
        clearTimeout(this.typeToFindTimer);
        this.typeToFindTimer = setTimeout(() => {
          this.typeToFindInput = '';
        }, 700);
        // don't include preferred countries so we jump to the right place in the alphabet
        let typedCountryI = this.sortedCountries.slice(this.preferredCountries.length).findIndex(c => c.name.toLowerCase().startsWith(this.typeToFindInput));
        if (~typedCountryI) {
          this.selectedIndex = this.preferredCountries.length + typedCountryI;
          let selEle = this.$refs.tellist.children[this.selectedIndex];
          if (selEle.offsetTop < this.$refs.tellist.scrollTop || selEle.offsetTop + selEle.clientHeight > this.$refs.tellist.scrollTop + this.$refs.tellist.clientHeight) {
            this.$refs.tellist.scrollTop = selEle.offsetTop - this.$refs.tellist.clientHeight / 2;
          }
        }
      }
    },
    reset() {
      this.selectedIndex = this.sortedCountries.map(c => c.iso2).indexOf(this.activeCountry.iso2);
      this.open = false;
    },
  },
  directives: {
    // click-outside-input from BosNaufal: https://github.com/BosNaufal/vue-click-outside-input
    'click-outside-input': {
      bind: function (el, binding, vNode) {
        // Provided expression must evaluate to a function.
        if (typeof binding.value !== 'function') {
          var compName = vNode.context.name;
          var warn = '[Vue-click-outside-input:] provided expression ' + binding.expression + ' is not a function, but has to be';
          if (compName) {
            warn += 'Found in component ' + compName;
          }
          // console.warn(warn);
        }
        // Define Handler and cache it on the element
        var bubble = binding.modifiers.bubble;
        var handler = function (e) {
          if (bubble || (!e.target.classList.contains('close-btn') && (!el.contains(e.target) && el !== e.target))) {
            binding.value(e)
          }
        };
        el.__vueClickOutside__ = handler;
        // add Event Listeners
        document.addEventListener('click', handler)
      },
      unbind: function (el, binding) {
        // Remove Event Listeners
        document.removeEventListener('click', el.__vueClickOutside__);
        el.__vueClickOutside__ = null
      }
    }
  },
};
</script>
