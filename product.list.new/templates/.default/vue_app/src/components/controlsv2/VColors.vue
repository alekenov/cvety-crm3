<template>
  <div>
    <div class="panel__subtitle">Варианты цвета букета</div>
    <div class="color-container" id="colorContainer">

      <div v-for="color in colors" class="color-block" @click="selectColor(color.id)">
        <span :style="{'background-color': color.hex}" :class="{'color-circle' : true, 'active' : isSelect(color.id)}"></span>
        <span class="color-text">{{ color.name }}</span>
      </div>
    </div>
  </div>
</template>

<script>

import {mapGetters} from 'vuex';
import {getSectionName} from "@/services/Utils";

export default {
  name: "VColors",

  props: {
    value         : {
      type: [
        Array,
        String,
        Object,
        Number,
        Boolean,
      ],
      default: () => [],
    },
  },
  model: {
    event: 'input',
    prop: 'value',
  },

  data() {
    return {
      colors: [
        { "id": "powder", "name": "пудровый", "hex": "#F2D1D1" },
        { "id": "white", "name": "белый", "hex": "#FFFFFF" },
        { "id": "orange", "name": "оранжевый", "hex": "#FFA500" },
        { "id": "violet", "name": "фиолетовый", "hex": "#8A2BE2" },
        { "id": "magenta", "name": "малиновый", "hex": "#FF007F" },
        { "id": "lightpink", "name": "нежно розовый", "hex": "#FFB6C1" },
        { "id": "gray", "name": "серый", "hex": "#808080" },
        { "id": "green", "name": "зеленый", "hex": "#008000" },
        { "id": "ombre", "name": "омбрэ", "hex": "#F0E68C" },
        { "id": "yellow", "name": "желтый", "hex": "#FFFF00" },
        { "id": "lemon", "name": "лимонный", "hex": "#FFF700" },
        { "id": "cream", "name": "кремовый", "hex": "#FFF5E1" }
      ]
    };
  },
  computed: {
  },
  methods : {
    isSelect(id) {
      let is =  this.value.filter((color) => color.id === id);

      return is.length > 0;
    },

    selectColor(id) {

      let value = JSON.parse(JSON.stringify(this.value));

      let is =  value.filter((color) => color.id === id);

      if(is.length > 0)
      {
        value =  value.filter((color) => color.id !== id);
      }
      else
      {
        value.push({
          id: id
        });
      }
      this.value = value;

      this.$emit('input', this.value);
    },

  }

}
</script>
<style>
.color-container {
  justify-content: left;
  align-items: center;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin-bottom: 16px;
}

.color-circle {
  width: 40px;
  height: 40px;
  border-radius: 9999px;
  border: 1px solid #adb4be;
  transition: all;
  display: block;
  margin: 0 auto;
  opacity: 0.5;
}

.color-block {
  cursor: pointer;
  text-align: center;
}
.color-circle.active {
  border: 2px solid #174991;
  opacity: 1;
}
</style>