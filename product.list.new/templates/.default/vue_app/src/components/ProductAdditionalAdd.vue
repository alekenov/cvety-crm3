<template>
    <div class="panel__block panel__block_product-new" style="display: block;">
        <div class="panel-form-step">
            <div class="panel__top">
                <h2 class="panel__title">Дополнительный товар</h2>
                <span class="panel__title-text">Клиенты будут видеть его как сопутствующий у основных товаров.</span>
            </div>
            <div class="panel__content">
                <v-single-image
                    v-model="fileItem"
                />

                <div class="panel-form-row">
                    <v-input
                        v-model="name"
                        placeholder="Название товара *"
                        maxlength="50"
                    />
                </div>

                <div class="panel-form-row">
                    <v-input
                        v-model="price"
                        type="number"
                        placeholder="Стоимость товара, ₸ *"
                    />
                </div>

                <div class="panel-form-row">
                    <v-input
                        v-model="discount"
                        type="number"
                        placeholder="Процент скидки"
                    />
                </div>

                <div class="panel-form-row">
                    <v-input
                        v-model="sort"
                        type="number"
                        placeholder="Очерёдность отображения у клиента"
                    />
                </div>

                <div class="panel__actions">
                    <div class="panel__actions-block">
                        <a
                            href="#add_additional"
                            class="btn btn_wide btn_secondary"
                            @click.prevent="save"
                        >Опубликовать</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import VSingleImage from "@/components/controlsv2/VSingleImage";
import VInput from "@/components/controlsv2/VInput";
import {mapActions, mapState} from "vuex";
export default {
    name : "ProductAdditionalAdd",
    inject: ['hidePanel'],
    components : {
        VInput,
        VSingleImage,
    },
    data() {
        return {
            fileItem : {},
            name     : '',
            price    : '',
            sort     : '',
            discount : '',
        };
    },
    computed: {
        ...mapState({
            shopId: state => state.filter.shopId,
        }),
        formData() {
            const fd = new FormData;

            fd.append('name', this.name);
            fd.append('price', this.price);
            fd.append('sort', this.sort);
            fd.append('discount', this.discount);
            fd.append('shopId', this.shopId);

            if (this.fileItem?.isNew && this.fileItem?.file) {
                fd.append('image', this.fileItem.file, this.fileItem.file.name);
            }

            return fd;
        },
    },
    methods: {
        ...mapActions([
            'addAdditional',
        ]),
        save() {
            this.$showLoader();
            this.addAdditional(this.formData)
                .then(() => {
                    this.$hideLoader();
                    this.hidePanel();
                    this.$success('Успешно добавлен дополнительный товар');
                })
                .catch((response) => {
                    this.$hideLoader();
                    this.$showErrors(response);
                });
        },
    },
}
</script>