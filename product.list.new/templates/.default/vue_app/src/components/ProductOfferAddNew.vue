<template>
    <div class="panel__block" style="display: block;">
        <div>
            <div class="panel__top mb-sm">
                <h2 class="panel__title">
                    <span
                        class="back-button"
                        title="Вернуться к списку торговых предложений"
                        @click="backHandler"
                    ></span>
                    Добавление предложения
                </h2>
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

                    <div class="panel-form-row">
                        <v-input
                            v-model="name"
                            placeholder="Название *"
                            :class="{error: errors.name}"
                            @input="clearError('name')"
                        />
                    </div>

                    <div class="panel-form-row">
                        <v-input
                            v-model="price"
                            type="number"
                            placeholder="Стоимость товара, ₸ *"
                            :class="{error: errors.price}"
                            @input="clearError('price')"
                        />
                    </div>

                    <i-property
                        v-if="isVisible(consistProperty)"
                        ref="consist"
                        v-model="values[consistProperty.id]"
                        :structure="consistProperty"
                    />

                    <v-accordeon
                        v-if="featureProperties.length"
                        placeholder="Характеристики"
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
                        placeholder="Дополнительная информация"
                    >
                        <div class="panel-form-group">
                            <i-property
                                v-for="prop in additionalProperties"
                                v-model="values[prop.id]"
                                :structure="prop"
                                :key="prop.id"
                            />
                        </div>
                    </v-accordeon>

                </div>
            </div>

            <div class="panel__actions panel-sticky">
                <div class="panel__actions-block mb-lg">
                    <v-button class="btn_wide" @click="addOffer">Опубликовать</v-button>
                </div>

                <div class="panel__actions-block">
                    <a
                        href="javascript:void(0)"
                        class="text-capital"
                        @click="backHandler"
                    >Назад</a>
                </div>
            </div>

        </div>
    </div>
</template>

<script>
import VImage from "@/components/controlsv2/VImage";
import VInput from "@/components/controlsv2/VInput";
import IProperty from "@/components/iproperties/IProperty";
import VButton from "@/components/controls/VButton";
import VAccordeon from "@/components/controlsv2/VAccordeon";
import OffersPropertyValues from "@/models/OffersPropertyValues";
import {mapActions, mapGetters, mapMutations, mapState} from "vuex";

export default {
    name : "ProductOfferAddNew",
    components: {
        VImage,
        VInput,
        IProperty,
        VButton,
        VAccordeon,
    },
    data() {
        return {
            name: '',
            price: '',
            images: [],
            values: {},
            errors: {
                price : false,
                name  : false,
            },
        };
    },
    computed: {
        ...mapGetters([
            'allOffersProps',
        ]),
        ...mapState([
            'sections',
        ]),
        ...mapState({
            productId: state => state.detail.id,
            sectionId: state => state.detail.sectionId,
        }),
        section() {
            return this.sections.find((section) => section.id === this.sectionId);
        },
        properties() {
            return this.section?.offersProperties || [];
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
    },
    methods: {
        ...mapMutations([
            'setMode'
        ]),
        ...mapActions({
            addOfferAction : 'addOfferNew',
        }),
        backHandler : function () {
            this.setMode('offer-list');
        },
        showDetail() {
            this.setMode('offer-edit');
        },
        isVisible(prop) {
            return this.properties.findIndex(prop2 => prop?.id === prop2.id) > -1;
        },
        fillValues() {
            this.values = new OffersPropertyValues();
        },
        prepareData() {
            const data = new FormData();

            data.append('productId', this.productId);
            data.append('name', this.name);
            data.append('price', this.price);
            data.append('consist', JSON.stringify(this.consist));

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

            return data;
        },
        validateConsist() {
            return !(this.$refs.consist !== undefined && this.$refs.consist.$children[0].validate() === false);
        },
        validate() {
            return this.validateConsist();
        },
        addOffer() {
            const data = this.prepareData();

            if (!this.validate()) {
                return;
            }

            this.$showLoader();
            this.addOfferAction(data)
                .then(() => {
                    this.$hideLoader();
                    this.showDetail();
                    this.$success('Добавлено новое предложение');
                })
                .catch((response) => {
                    this.$hideLoader();
                    this.$showErrors(response);
                    this.setErrorsFromResponse(response);
                });
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