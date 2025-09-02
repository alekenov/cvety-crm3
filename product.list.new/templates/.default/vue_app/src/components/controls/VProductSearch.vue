<template>
  <div class="input-label-transform__input-container select-wrapper">
    <multiselect
        v-model="selectedProducts"
        label="name"
        track-by="name"
        placeholder=" "
        open-direction="bottom"
        :options="products"
        :multiple="multiple"
        :searchable="true"
        :loading="isLoading"
        :internal-search="false"
        :clear-on-select="false"
        :close-on-select="!multiple"
        :options-limit="300"
        :max-height="600"
        :show-no-results="false"
        :hide-selected="true"
        :select-label="''"
        :selected-label="''"
        :deselect-label="''"
        @search-change="asyncSearchProduct"
        @open="isOpened = true"
        @close="isOpened = false"
        class="multiselect__multiple-container"
    >
      <template slot="noOptions">
        Список товаров пуст.
      </template>
      <template slot="singleLabel" slot-scope="props">
        <div class="single-container">
          {{props.option.name}}
        </div>
      </template>
      <template slot="option" slot-scope="{option}">
        <div
            class="single-container"
            :data-id="option.id"
            :data-price="option.price"
        >
                    <span
                        class="option-item__image"
                        :style="getStyle(option)"
                    ></span>
          <span class="option-item__name">{{option.name}}</span>
          <span v-html="option.priceFormatted" v-if="false"></span>
        </div>
      </template>
    </multiselect>

    <label :class="labelClassWrapper">{{placeholder}}</label>
  </div>
</template>

<script>
const BX = window.BX;
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.min.css';

export default {
  name       : "VProductSearch",
  components : {
    Multiselect,
  },
  props      : {
    value : {
      type    : [Number, Array],
      default : () => [],
    },
    placeholder: {
      type: String,
      default: '',
    },
    multiple: {
      type: Boolean,
      default: true,
    },
    productId: {
      type: Number,
      default: 0,
    },
    blockId: {
      default: '2',
    },
    selectedProducts : {
      type    : [Number, Array],
      default : () => [],
    },
  },
  model      : {
    prop  : 'value',
    event : 'select'
  },
  data() {
    return {
      isLoading        : false,
      isOpened         : false,
      products         : [],
     // selectedProducts : [],
      xhr              : null,
      timer            : null,
    };
  },
  computed   : {
    hasValue() {
      return Array.isArray(this.value) ? this.value.length : this.value;
    },
    getProducts() {
      return this.multiple
          ? this.selectedProducts
          : this.selectedProducts;
    },
    labelClassWrapper() {
      return {
        'input-label-transform__label'          : true,
        'vue-multiselect'                       : true,
        'input-label-transform__label--focused' : this.hasValue || this.isOpened,
      };
    },
  },
  methods    : {
    getStyle(option) {
      return {
        backgroundImage: "url('" + option.image + "')",
      };
    },
    asyncSearchProduct(phrase) {
      clearTimeout(this.timer);
      this.timer = null;

      if (!phrase || phrase.length <= 2) {
        return;
      }

      this.isLoading = true;

      if (this.xhr) {
        this.xhr.abort();
        this.xhr = null;
      }

      this.timer = setTimeout(() => {
        this.xhr = BX.ajax({
          url       : '/bitrix/services/main/ajax.php?mode=class&c=crm:union.product.list&action=searchProductsForUnion',
          method    : 'post',
          data      : {
            params  : {
              phrase    : phrase
            },
            sessid  : BX.bitrix_sessid(),
            SITE_ID : 's1',
          },
          dataType  : 'json',
          onsuccess : (res) => {
            if (!res) {
              return;
            }
            this.products = res.data.items;
            this.xhr = null;
            this.isLoading = false;
          }
        });
      }, 200);
    },
    customLabel({name}) {
      return `${name}`;
    },
    onOpen() {
      this.isOpened = true;
    },
    onClose() {
      this.isOpened = false;
    },
  },
  watch      : {
    selectedProducts : function () {
      this.$emit('select', this.getProducts,this.blockId);
    },
    multiple() {
      if (this.multiple) {
        if(this.selectedProducts.length <= 0) {
          this.selectedProducts = [];
        }
      }
      else {
        this.selectedProducts = 0;
      }
    }
  },
  created() {
    if (this.multiple) {
      if(this.selectedProducts.length <= 0) {
        this.selectedProducts = [];
      }
    }
    else {
      if(this.selectedProducts <= 0) {
        this.selectedProducts = 0;
      }
    }
  }
};
</script>