<template>
    <div class="panel__block" style="display: block;">

        <v-select-section
            v-if="isShowSections"
            v-model="sectionId"
            :sections="sections"
            :grouped="grouped"
            @select="onSelectSection"
        />

        <div v-else>
            <div class="panel__top">
                <h2 class="panel__title">Новый товар</h2>
            </div>
            <div class="panel__content" v-if="isShowSecondPage">
                <div class="panel__content-block">
                    <div class="page-list-container">
                        <div class="page-list-item" v-for="item in compositionProp.listValues" :key="item.id" @click="onSelectComposition(item)">
                            <span class="page-list-item__text">{{item.name}}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="panel__content panel__content--padded-bottom" v-else>
                <div class="panel__content-block">

                    <v-image
                        v-model="images"
                        :multiple="true"
                    />

                    <i-property
                        v-for="prop in baseProperties"
                        v-show="isShowProperty(prop)"
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

                    <div class="panel-form-row">
                        <v-input
                            v-model="price"
                            :type="'number'"
                            :placeholder="'Стоимость товара, ₸ *'"
                            :class="{error: errors.price}"
                            @input="clearError('price')"
                        />
                    </div>
                  <div class="panel-form-row">
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
                    Количество будет уменьшатся после оформления товара, когда товара станет 0, он не будет показываться на сайте.
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
                      :ref="prop.code"
                      :key="prop.id"
                  />

                    <v-accordeon
                        v-if="featureProperties.length"
                        :placeholder="'Характеристики'"
                    >
                        <div class="panel-form-group">
                            <i-property
                                v-for="prop in featureProperties"
                                v-show="isShowProperty(prop)"
                                v-model="values[prop.id]"
                                :structure="prop"
                                :key="prop.id"
                            />
                        </div>
                    </v-accordeon>


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
                        v-if="additionalProperties.length"
                        :placeholder="'Дополнительная информация'"
                    >
                        <div class="panel-form-group">
                            <div class="panel-form-row" style="display:none;">
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
                </div>
            </div>

            <div
                v-if="!isShowSecondPage"
                class="panel__actions panel-sticky"
            >
                <div class="panel__actions-block">
                    <v-button class="btn_wide" @click="addProduct">Опубликовать</v-button>
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
import PropertyValues from "@/models/PropertyValues";
import VSelectSection from "@/components/controlsv2/VSelectSection";
import VInputSection from "@/components/controlsv2/VInputSection";
import VAccordeon from "@/components/controlsv2/VAccordeon";
import VColors from "@/components/controlsv2/VColors.vue";
import VCheckbox from "@/components/controls/VCheckbox.vue";

export default {
    name       : "ProductAdd",
    inject     : ['hidePanel'],
    components : {
      VCheckbox,
      VColors,
        VAccordeon,
        VInputSection,
        VSelectSection,
        VButton,
        VImage,
        VInput,
        IProperty,
    },
    data() {
        return {
            isSectionActive : false,
            errors          : {
                price : false,
                name  : false,
            },
            name            : '',
            images          : [],
            description     : '',
            price           : '',
            quantity        : '',
            percent         : 0,
            sectionId       : 0,
            values          : {},
            colorsVariant : [],
            bigCard: false
        };
    },
    computed: {
        ...mapGetters([
            'allProps',
        ]),
        ...mapState([
            'sections',
            'grouped',
        ]),
        ...mapState({
            shopId: state => state.filter.shopId,
          isFloristCvetykz : state => state.isFloristCvetykz
        }),
        section() {
            return this.sections.find((section) => section.id === this.sectionId);
        },
        properties() {
            return this.section?.properties || [];
        },
        isShowSecondPage() {
            return false;
            //this.sectionId === 10 && this.values[210] && this.values[210].length === 0 && this.compositionProp?.listValues?.length > 0;
        },
        compositionProp() {
            return this.allProps.find(prop => prop.id === 210);
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
        compositionProperty() {
          return this.properties.find(prop => prop.block === 'composition');
        },
    },
    methods: {
        ...mapActions({
            addProductAction: 'addProduct',
        }),
        ...mapMutations([
            'setMode',
            'setHasProducts',
        ]),
        isShowProperty(prop) {
          return prop.id !== 210;
        },
        isShowPropertyAdditional(prop) {
          return  !(this.sectionId === 10 && (prop.id === 5 || prop.id === 210));
        },
        isShowColors() {
          return this.sectionId === 10 && this.shopId === 17008;
        },

        isVisible(prop) {
            return this.properties.findIndex(prop2 => prop?.id === prop2.id) > -1;
        },
        fillValues() {
            this.values = new PropertyValues();
        },
        onSelectComposition(option) {
            this.values[210] = [option.id];
        },
        prepareData() {
            let data = new FormData();

            data.append('name', this.name);
            data.append('description', this.description);
            data.append('price', this.price);
            data.append('quantity', this.quantity);
            data.append('percent', this.percent);
            data.append('sectionId', this.sectionId);
            data.append('shopId', this.shopId);
            data.append('bigCard', this.bigCard ? 'Y' : 'N');

            for (let i = 0; i < this.images.length; i++) {
                const item = this.images[i];
                if (!item.isDeleted && item.file) {
                    data.append('images[' + item.id + ']', item.file, item.file.name);
                }
            }

            for (let i = 0; i < this.properties.length; i++) {
                const prop = this.properties[i];
                const value = this.values[prop.id];

                if (prop.isVideo) {
                    if (value.file && !value.isDeleted) {
                        data.append('prop[' + prop.id + ']', value.file, value.file.name);
                    }
                }
                else if(prop.isProductSearch) {
                  for (let j = 0; j < value.length; j++) {
                    let item = value[j];

                    data.append('prop[' + prop.id + '][]', item.id);

                  }
                }
                else if (prop.isFile || prop.isMultiple) {
                    for (let j = 0; j < value.length; j++) {
                        let item = value[j];

                        let key = prop.isMultiple ? '[]' : '';

                        if (prop.isFile) {
                            if (item.file && !item.isDeleted) {
                                data.append('prop[' + prop.id + ']' + key, item.file, item.file.name);
                            }
                        }
                        else {
                            data.append('prop[' + prop.id + '][]', item);
                        }
                    }
                }
                else if (prop.isConsist) {
                    data.append('consist', JSON.stringify(value));
                }
                else {
                    data.append('prop[' + prop.id + ']', value);
                }
            }

          if(this.colorsVariant)
          {
            data.append('colorsVariant',JSON.stringify(this.colorsVariant));
          }


          return data;
        },
        validateConsist() {
          return !(this.$refs.consist !== undefined && this.$refs.consist.$children[0].validate() === false);
        },
        validate() {
            return this.validateConsist();
        },
        addProduct() {
            const data = this.prepareData();

            if (!this.validate()) {
                return;
            }

            this.$showLoader();
            this.addProductAction(data)
                .then(() => {
                    this.$hideLoader();
                    this.hidePanel();
                    this.$success('Добавлен новый товар');
                    this.setHasProducts();
                })
                .catch((response) => {
                    this.$hideLoader();
                    this.$showErrors(response);
                    this.setErrorsFromResponse(response);
                });
        },
        showSectionsPopup() {
            this.isSectionActive = true;
        },
        hideSectionsPopup() {
            this.isSectionActive = false;
        },
        onSelectSection(sectionId) {
            this.hideSectionsPopup();

            const section = this.sections.find(sect => sect.id === sectionId);
            if (section.isAdditional) {
                this.setMode('additional-add');
            }
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
    },
    mounted() {
        this.fillValues();
    }
}
</script>

<style>
.page-list-container {

}
.page-list-item {
    padding: 15px 5px;
    cursor: pointer;
    position: relative;
}
.page-list-item:hover {
    background-color: #f3f3f3;
}
.page-list-item:after {
    content: ' ';
    display: block;
    position: absolute;
    width: 15px;
    height: 15px;
    border-top: 1px solid;
    border-right: 1px solid;
    top: 20px;
    right: 10px;
    transform: rotate(45deg);
}
.page-list-item__text {
    font-weight: bold;
}
</style>