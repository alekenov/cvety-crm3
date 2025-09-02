<template>
  <div
      class="panel-form-row"
      :data-id="structure.id"
      :data-name="structure.name"
      :data-code="structure.code"
  >
    <component v-if="componentName === 'v-product-search'"
               :is="componentName"
               :multiple="structure.isMultiple"
               :options="structure.listValues"
               :placeholder="propertyName"
               :value="value"
               :selectedProducts="value"
               :type="structure.type"
               @input="onInput"
               @change="onInput"
               @select="onInput"
    />
    <component v-else
               :is="componentName"
               :multiple="structure.isMultiple"
               :options="structure.listValues"
               :placeholder="propertyName"
               :value="value"
               :type="structure.type"
               @input="onInput"
               @change="onInput"
               @select="onInput"
    />

  </div>
</template>

<script>
import IDate from "components/iproperties/IDate";
import IFile from "components/iproperties/IFile";
import IInput from "components/iproperties/IInput";
import IList from "components/iproperties/IList";
import IText from "components/iproperties/IText";
import VVideo from "components/controlsv2/VVideo";
import VProductionMinutes from "components/controlsv2/VProductionMinutes";
import VSelectColor from "components/controlsv2/VSelectColor";
import VConsist from "components/controlsv2/VConsist";
import VProductSearch from "@/components/controls/VProductSearch";

export default {
  name: "IProperty",
  components: {
    IDate,
    IFile,
    IInput,
    IList,
    IText,
    VConsist,
    VVideo,
    VProductionMinutes,
    VSelectColor,
    VProductSearch
  },
  props: {
    structure: {
      type: Object,
      default: () => {
      },
    },
    value: {
      type: [
        Array,
        String,
        Object,
        Number,
        Boolean,
      ],
    },
  },
  model: {
    event: 'input',
    prop: 'value',
  },
  computed: {
    componentName() {
      const componentsMap = {
        input: 'i-input',
        list: 'i-list',
        date: 'i-date',
        file: 'i-file',
        text: 'i-text',
        video: 'v-video',
        consist: 'v-consist',
        productionMinutes: 'v-production-minutes',
        color: 'v-select-color',
        productSearch: 'v-product-search'
      };

      let component;
      if (this.structure.isString || this.structure.isNumber) {
        component = 'input';
      } else if (this.structure.isProductSearch) {
        component = 'productSearch';
      } else if (this.structure.isList) {
        component = 'list';
      } else if (this.structure.isDate) {
        component = 'date';
      } else if (this.structure.isFile) {
        component = 'file';
      } else if (this.structure.isText) {
        component = 'text';
      } else if (this.structure.isConsist) {
        component = 'consist';
      } else if (this.structure.isVideo) {
        component = 'video';
      } else if (this.structure.isProductionMinutes) {
        component = 'productionMinutes';
      } else if (this.structure.isColor) {
        component = 'color';
      }


      return componentsMap[component];
    },
    propertyName() {
      let name = this.structure.name;

      if (this.structure?.isRequired) {
        name += ' *';
      }

      return name;
    },
  },
  methods: {
    onInput(value) {
      this.$emit('input', value);
    },
  },
};
</script>