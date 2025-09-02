<template>
    <div class="panel__block panel__block_product-edit" style="display: block;">
        <div class="panel__top mb-sm">
            <h2 class="panel__title">
                <span
                    class="back-button"
                    title="Вернуться к списку торговых предложений"
                    @click="backHandler"
                ></span>
                {{offer.name}}
            </h2>
        </div>

        <div class="panel__content">
            <div class="panel__content-block">
                <v-image
                    v-model="morePhoto"
                    :multiple="true"
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
                    <v-select
                        v-model="typeBouquet"
                        :options="typeBouquets"
                        :placeholder="'Тип букета'"
                    />
                </div>

                <div class="panel-form-row">
                    <v-select
                        v-model="quantityFlower"
                        :options="quantityFlowers"
                        :placeholder="'Цветков'"
                    />
                </div>

                <v-consist
                    v-model="consist"
                    :options="flowers"
                />

            </div>
        </div>

        <div class="panel__actions">
            <div class="panel__actions-block">
                <a
                    href="javascript:void(0)"
                    class="text-capital link_quaternary"
                    @click.prevent="removeOffer"
                    v-if="isCanDelete"
                >Удалить предложение</a>
            </div>
            <div class="panel__actions-block mb-lg">
                <a
                    href="javascript:void(0)"
                    class="btn btn_wide btn_secondary"
                    @click="editOffer"
                >Сохранить</a>
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
</template>

<script>
    import {mapState, mapMutations, mapActions, mapGetters} from 'vuex';

    import OfferItem from "@/models/OfferItem";
    import VInput from "@/components/controlsv2/VInput";
    import VSelect from "@/components/controlsv2/VSelect";
    import VConsist from "@/components/controlsv2/VConsist";
    import VImage from "@/components/controlsv2/VImage";

    export default {
        name : "ProductOfferEdit",
        inject: [
            'hidePanel',
        ],
        components : {
            VImage,
            VConsist,
            VSelect,
            VInput,
        },
        data() {
            return {
                name           : '',
                price          : '',
                typeBouquet    : '',
                morePhoto      : [],
                quantityFlower : '',
                consist        : [],
                errors         : {
                    name  : false,
                    price : false,
                },
            }
        },
        computed: {
            ...mapState({
                productId : state => state.detail.id,
                offerId : state => state.offerId,
                offers  : state => state.detail.offers,
            }),
            ...mapState([
                'typeBouquets',
                'quantityFlowers',
            ]),
            ...mapGetters([
                'flowers',
            ]),
            offer() {
                return this.offers.find(({id}) => id === this.offerId);
            },
            isCanDelete() {
                return this.offers.length > 1;
            }
        },
        methods: {
            ...mapMutations([
                'setMode',
            ]),
            ...mapActions({
                removeOfferAction : 'removeOffer',
                editOfferAction   : 'editOffer',
            }),
            backHandler() {
                this.setMode('offer-list');
            },
            removeOffer() {
                this.$showLoader();
                this.removeOfferAction({id: this.offerId})
                    .then(() => {
                        this.$hideLoader();
                        this.$success('Предложение удалено');
                    })
                    .catch((response) => {
                        this.$hideLoader();
                        this.$showErrors(response);
                    });
            },
            editOffer() {
                let data = new FormData();

                data.append('id', this.offerId);
                data.append('productId', this.productId);
                data.append('name', this.name);
                data.append('price', this.price);
                data.append('typeBouquet', this.typeBouquet);
                data.append('quantityFlower', this.quantityFlower);
                data.append('consist', JSON.stringify(this.consist));

                for (let i = 0; i < this.morePhoto.length; i++) {
                    const item = this.morePhoto[i];

                    if (!item.isDeleted && item.isNew && item.file) {
                        data.append('image[' + i + ']', item.file, item.file.name);
                    }
                }

                const delImages = this.morePhoto.filter((item) => item.isDeleted && item.id > 0).map(item => item.id);
                data.append('delImages', JSON.stringify(delImages));

                this.$showLoader();
                this.editOfferAction(data)
                    .then(() => {
                        this.$hideLoader();
                        this.setFromStore();
                        this.$success('Информация о предложении обновлена');
                    })
                    .catch((response) => {
                        this.$hideLoader();
                        this.$showErrors(response);
                        this.setErrorsFromResponse(response);
                    });
            },
            setFromStore() {
                const cloned = OfferItem.createFrom(this.offer);

                this.name           = cloned.name;
                this.price          = cloned.price;
                this.typeBouquet    = cloned.typeBouquet;
                this.morePhoto      = cloned.morePhoto;
                this.quantityFlower = cloned.quantityFlowers;
                this.consist        = cloned.consist;
            },
            setErrorsFromResponse(response) {
                response.errors.forEach(({customData}) => {
                    this.setError(customData);
                });
            },
            setError(key) {
                this.$set(this.errors, key, true);
            },
            clearError(key) {
                this.$set(this.errors, key, false);
            },
        },
        created() {
            this.setFromStore();
        }
    }
</script>