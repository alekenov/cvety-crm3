<template>
    <div class="panel__block panel__block_product-edit" style="display: block;">
        <div class="panel__top mb-sm">
            <h2 class="panel__title">
                <span
                    class="back-button"
                    title="Вернуться к редактированию букета"
                    @click="backHandler"
                ></span>
                Список торговых предложений
            </h2>
        </div>
        <div class="panel__content">
            <div class="panel__content-block">
                <div class="panel__row-wrap">
                    <div class="panel__row" v-for="offer in offers" :key="offer.id">
                        <div class="panel__row-info">
                            <div
                                class="panel__row-edit-title panel__row-editable"
                                title="Редактировать"
                                @click="editOffer(offer.id)"
                            >
                                {{offer.name}}, <span v-html="offer.priceFormatted"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="panel__actions">
            <div class="panel__actions-block">
                <a
                    href="javascript:void(0)"
                    class="text-capital"
                    @click="addOffer"
                >Создать</a>
            </div>
            <div class="panel__actions-block">
                <a
                    href="javascript:void(0)"
                    class="text-capital"
                    @click.prevent="backHandler"
                >Назад</a>
            </div>
        </div>
    </div>
</template>

<script>
    import {mapState, mapMutations} from 'vuex';

    export default {
        name : "ProductOfferList",
        computed: {
            ...mapState({
                offers : state => state.detail?.offers || [],
            }),
        },
        methods: {
            ...mapMutations([
                'setMode',
                'setOfferId',
            ]),
            addOffer() {
                this.setMode('offer-add');
            },
            addOfferNew() {
                this.setMode('offer-add-new');
            },
            editOffer(id) {
                this.setOfferId(id);
                this.setMode('offer-edit');
            },
            editOfferNew(id) {
                this.setOfferId(id);
                this.setMode('offer-edit-new');
            },
            backHandler() {
                this.setMode('edit');
            },
        }
    }
</script>