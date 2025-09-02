<template>
  <div class="panel__block" style="display: block;">

    <v-select-section
        v-if="isShowSections"
        v-model="sectionId"
        :sections="sections"
        :grouped="grouped"
        @select="hideSectionsPopup"
    />

    <div v-else>
      <div class="panel__top panel__top__red">
        <h2 class="panel__title">Редактирование товара</h2>
        <span
            :data-clipboard-text="detailUrl"
            data-success-text="Ссылка скопирована в буфер обмена"
            class="share js-clipboard icon-item copy-link"
        ><img src="/images/share.svg" width="20px"></span>
      </div>
      <div class="panel__content panel__content--padded-bottom">
        <div class="panel__content-block">

          <v-image
              v-model="images"
              :multiple="true"
          />

          <i-property
              v-for="prop in baseProperties"
              v-model="values[prop.id]"
              :structure="prop"
              :key="prop.id"
          />

          <v-input-section
              :section-id="sectionId"
              @change="showSectionsPopup"
          />

          <div class="panel-form-row">
            <v-input
                v-model="name"
                :placeholder="'Название *'"
                :class="{error: errors.name}"
                maxlength="50"
                @input="clearError('name')"
            />
          </div>

          <div
              v-if="isShowPrice"
              class="panel-form-row"
          >
            <v-input
                v-model="price"
                :type="'number'"
                :placeholder="'Стоимость товара, ₸ *'"
                :class="{error: errors.price}"
                @input="clearError('price')"
            />
          </div>

          <div class="panel-form-row" v-if="isShowPrice">
            <v-input
                v-model="percent"
                :type="'number'"
                :placeholder="'Процент скидки'"
            />
            Варианты (5,10,15,20 и тд до 90)
          </div>

          <div class="panel-form-row">
            <v-input
                v-model="quantity"
                :type="'number'"
                :placeholder="'Количество товара'"
            />
            Количество будет уменьшатся после оформления товара, когда товара станет 0, он не будет показываться на
            сайте.
            Если нужен постоянный товар поле не заполняйте
          </div>

          <i-property
              v-if="isVisible(minutesProperty)"
              v-model="values[minutesProperty.id]"
              :structure="minutesProperty"
          />
          <i-property
              v-for="prop in additionalProperties"
              v-show="!isShowProperty(prop)"
              v-model="values[prop.id]"
              :structure="prop"
              :key="prop.id"
          />



          <div class="panel-form-row">
            <v-checkbox
                v-model="isActive"
                placeholder="Активность"
            />
          </div>


          <div class="panel-form-row" v-if="isFloristCvetykz">
            <v-checkbox
                v-model="bigCard"
                placeholder="Большая карточка"
            />
          </div>


         <v-colors v-model="colorsVariant" v-if="isShowColors()"/>


          <i-property
              v-if="isVisible(consistProperty)"
              ref="consist"
              v-model="values[consistProperty.id]"
              :structure="consistProperty"
          />


          <v-accordeon
              v-if="featureProperties.length"
              :placeholder="'Характеристики'"
          >
            <div class="panel-form-group">
              <i-property
                  v-for="prop in featureProperties"
                  v-model="values[prop.id]"
                  :structure="prop"
                  :key="prop.id"
              />
            </div>
          </v-accordeon>

          <v-accordeon
              v-if="additionalProperties.length"
              :placeholder="'Дополнительная информация'"
          >
            <div class="panel-form-group">
              <div class="panel-form-row" style="display: none">
                <v-input
                    v-model="description"
                    :placeholder="'Описание'"
                />
              </div>

              <i-property
                  v-for="prop in additionalProperties"
                  v-show="isShowPropertyAdditional(prop)"
                  v-model="values[prop.id]"
                  :structure="prop"
                  :key="prop.id"
              />
            </div>
          </v-accordeon>

          <div class="panel-form-row" v-if="isCvetykz()">
            <v-checkbox
                v-model="isBouquetsGroup"
                placeholder="Групповой закуп"
            />
          </div>


          <div
              v-if="isBouquetsGroup && isCvetykz()"
              class="panel-form-row"
          >
            <v-input
                v-model="priceGroup"
                :type="'number'"
                :placeholder="'Стоимость товара по закупу, ₸ *'"
            />
          </div>
          <div
              v-if="isBouquetsGroup && isCvetykz()"
              class="panel-form-row"
          >
            <v-input
                v-model="countGroup"
                :type="'number'"
                :placeholder="'Кол-во товаров для закупки *'"
            />
          </div>


        </div>
      </div>

      <div class="panel__actions">
        <div class="panel__actions-block">
          <a href="#products-union" class="text-capital" @click.prevent="showUnion">Объединение товаров</a>
        </div>
        <div v-show="true" class="panel__actions-block">
          <a href="#offer-list" class="text-capital" @click.prevent="showOffersList">Торговые предложения</a>
        </div>
        <div class="panel__actions-block mb-lg">
          <a href="#remove" class="text-capital link_quaternary" @click.prevent="removeProduct">Удалить товар</a>
        </div>
      </div>
      <div class="panel__actions panel-sticky">
        <div class="panel__actions-block">
          <v-button class="btn_wide" @click="updateProduct">Сохранить</v-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import {mapActions, mapGetters, mapMutations, mapState} from 'vuex';

import VImage from "@/components/controlsv2/VImageNew";
import VInput from "@/components/controlsv2/VInput";
import IProperty from "@/components/iproperties/IProperty";
import VButton from "@/components/controls/VButton";
import ProductDetail from "@/models/ProductDetail";
import VCheckbox from "@/components/controls/VCheckbox";

import VSelectSection from "@/components/controlsv2/VSelectSection";
import VInputSection from "@/components/controlsv2/VInputSection";
import VAccordeon from "@/components/controlsv2/VAccordeon";
import VSelect from "@/components/controlsv2/VSelect.vue";
import VColors from "@/components/controlsv2/VColors.vue";


const ClipboardJS = window.ClipboardJS;


export default {
  name: "ProductEdit",
  inject: [
    'hidePanel',
  ],
  components: {
    VColors,
    VSelect,
    VCheckbox,
    VButton,
    VSelectSection,
    VInputSection,
    VAccordeon,
    VImage,
    VInput,
    IProperty,
  },
  data() {
    return {
      isSectionActive: false,
      errors: {
        price: false,
        name: false,
      },
      name: '',
      colorsVariant: [],
      isActive: true,
      images: [],
      description: '',
      price: '',
      sectionId: 0,
      percent: 0,
      quantity: '',
      values: {},
      isBouquetsGroup: false,
      priceGroup: 0,
      countGroup: 1,
      bigCard: false
    };
  },
  computed: {
    ...mapState([
      'detail',
      'sections',
      'grouped',
    ]),
    ...mapState({
      shopId: state => state.filter.shopId,
      detailUrl: state => state.detail.url,
      isFloristCvetykz: state => state.isFloristCvetykz
    }),
    ...mapGetters([
      'allProps',
    ]),
    section() {
      return this.sections.find((section) => section.id === this.sectionId);
    },
    properties() {
      return this.section?.properties || [];
    },
    isShowSections() {
      return !this.sectionId || this.isSectionActive;
    },
    baseProperties() {
      return this.properties.filter(prop => prop.block === 'base');
    },
    featureProperties() {
      return this.properties.filter(prop => prop.block === 'feature');
    },
    additionalProperties() {
      return this.properties.filter(prop => prop.block === 'additional');
    },
    consistProperty() {
      return this.properties.find(prop => prop.block === 'consist');
    },
    discountProperty() {
      return this.properties.find(prop => prop.block === 'discount');
    },
    minutesProperty() {
      return this.properties.find(prop => prop.block === 'minutes');
    },
    isShowPrice() {
      return !this.detail.isSku || this.detail.offers.length <= 1;
    }
  },
  methods: {
    copyTextNoInput() {
      const storage = document.createElement('textarea');
      storage.value = this.$refs.message.innerHTML;

      storage.select();
      storage.setSelectionRange(0, 99999);
      document.execCommand('copy');

    },
    showUnion() {
      this.setMode('union');
    },
    showOffersList() {
      this.setMode('offer-list');
    },
    showProductAdditionalEdit() {
      this.setMode('additional-edit');
    },
    ...mapMutations([
      'setMode',
    ]),
    ...mapActions([
      'editProduct',
      'remove',
    ]),
    validateConsist() {
      return !(this.$refs.consist !== undefined && this.$refs.consist.$children[0].validate() === false);
    },
    validate() {
      return this.validateConsist();
    },
    isVisible(prop) {
      return this.properties.findIndex(prop2 => prop?.id === prop2.id) > -1;
    },
    showSectionsPopup() {
      this.isSectionActive = true;
    },

    hideSectionsPopup() {
      this.isSectionActive = false;
    },
    isShowColors() {
      return this.sectionId === 10 && this.isCvetykz();
    },
    isShowPropertyAdditional(prop) {
      return !(this.sectionId === 10 && (prop.id === 5 || prop.id === 210));
    },
    isShowProperty(prop) {
      return prop.id !== 210;
    },
    prepareData() {
      let data = new FormData();

      data.append('id', this.detail.id);
      data.append('name', this.name);
      data.append('isActive', this.isActive ? 'Y' : 'N');
      data.append('bigCard', this.bigCard ? 'Y' : 'N');
      data.append('description', this.description);
      data.append('price', this.price);
      data.append('quantity', this.quantity);
      data.append('percent', this.percent);
      data.append('sectionId', this.sectionId);
      data.append('shopId', this.shopId);
      data.append('isBouquetsGroup', this.isBouquetsGroup ? 'Y' : 'N');
      data.append('priceGroup', this.priceGroup);
      data.append('countGroup', this.countGroup);


      for (let i = 0; i < this.images.length; i++) {
        const item = this.images[i];
        if (item.isDeleted && !item.isNew && item.id) {
          data.append('delImages[' + item.id + ']', item.id)
        } else if (item.isNew) {
          data.append('images[' + item.id + ']', item.file, item.file.name)
        }

        if (!item.isDeleted) {
          data.append('images_sort[' + i + ']', item.id)
        }
      }


      for (let i = 0; i < this.properties.length; i++) {
        const prop = this.properties[i];
        const value = this.values[prop.id];

        if (prop.isVideo) {
          if (value.isDeleted && !value.isNew && value.id) {
            data.append('prop[' + prop.id + ']', value.id);
          } else if (value.file && !value.isDeleted) {
            data.append('prop[' + prop.id + ']', value.file, value.file.name);
          }
        } else if (prop.isProductSearch) {
          for (let j = 0; j < value.length; j++) {
            let item = value[j];

            data.append('prop[' + prop.id + '][]', item.id);

          }
        } else if (prop.isFile || prop.isMultiple) {
          for (let j = 0; j < value.length; j++) {
            let item = value[j];

            let key = prop.isMultiple ? '[]' : '';

            if (prop.isFile) {
              if (item.isDeleted && !item.isNew && item.id) {
                data.append('prop[' + prop.id + ']' + key, item.id);
              } else if (item.file && !item.isDeleted) {
                data.append('prop[' + prop.id + ']' + key, item.file, item.file.name);
              }
            } else {
              data.append('prop[' + prop.id + '][]', item);
            }
          }
        } else if (prop.isConsist) {
          data.append('consist', JSON.stringify(value));
        } else {
          data.append('prop[' + prop.id + ']', value);
        }
      }
      if(this.colorsVariant)
      {
        data.append('colorsVariant',JSON.stringify(this.colorsVariant));
      }

      return data;
    },
    updateProduct() {
      const data = this.prepareData();

      if (!this.validate()) {
        return;
      }

      this.$showLoader();
      this.editProduct(data)
          .then(() => {
            this.$hideLoader();
            this.setFromStore();
            this.$success('Информация о товаре обновлена');
          })
          .catch((response) => {
            this.$hideLoader();
            this.$showErrors(response);
          });
    },
    removeProduct() {
      this.$showLoader();
      this.remove({id: this.detail.id})
          .then(() => {
            this.$hideLoader();
            this.hidePanel();
          })
          .catch((response) => {
            this.$hideLoader();
            this.$showErrors(response);
            this.setErrorsFromResponse(response);
          });
    },
    setFromStore() {
      const cloned = new ProductDetail(this.detail);


      this.name = cloned.name;
      this.isActive = cloned.isActive;
      this.images = cloned.images;
      this.description = cloned.description;
      this.price = cloned.price;
      this.percent = cloned.percent;
      this.quantity = cloned.quantity;
      this.sectionId = cloned.sectionId;
      this.values = cloned.properties;
      this.isBouquetsGroup = cloned.isBouquetsGroup;
      this.priceGroup = cloned.priceGroup;
      this.countGroup = cloned.countGroup;
      this.colorsVariant = cloned.colorsVariant;
      this.bigCard = cloned.bigCard;

    },
    setErrorsFromResponse(response) {
      response.errors.forEach(({code}) => {
        this.setError(code);
      });
    },
    setError(key) {
      this.$set(this.errors, key, true);
    },
    clearError(key) {
      this.$set(this.errors, key, false);
    },

    isCvetykz() {
      return this.shopId === 17008;
    },

  },
  mounted() {
    this.setFromStore();
    if (typeof ClipboardJS === 'function') {
      this.clipboard = new ClipboardJS('.js-clipboard');
      this.clipboard.on('success', (e) => {
        this.$success(e.trigger.dataset.successText);
        e.clearSelection();
      });
    }

  },
  beforeDestroy: function () {
    if (this.clipboard !== null)
      this.clipboard.destroy();
  },
  watch: {
    sectionId() {
      if (this.section.isAdditional) {
        this.showProductAdditionalEdit();
      }
    }
  },
}

</script>
<style>
.active.panel-categories-options-title {
  display: none;
}

.panel__top__red {
  display: flex;
  gap: 34px;
}

.share {
  cursor: pointer;
}

.share img {
  width: 24px;
  height: 31px;
}
</style>