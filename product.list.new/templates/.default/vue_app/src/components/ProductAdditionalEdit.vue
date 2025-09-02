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
                    <div class="panel__actions-block mb-lg">
                        <a
                            href="#remove"
                            class="text-capital link_quaternary"
                            @click.prevent="remove"
                        >Удалить товар</a>
                    </div>

                    <div class="panel__actions-block">
                        <a
                            href="#edit_additional"
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
import {mapActions, mapGetters, mapState} from "vuex";
import FileItem from "@/models/FileItem";

export default {
    name     : "ProductAdditionalEdit",
    inject   : ['hidePanel'],
    components: {
        VSingleImage,
        VInput,
    },
    data() {
        return {
            id       : '',
            price    : '',
            discount : '',
            name     : '',
            sort     : '',
            fileItem : {},
        };
    },
    computed : {
        ...mapState([
            'detail',
            'sections',
            'grouped',
        ]),
        ...mapGetters([
            'allProps',
        ]),
        ...mapState({
            shopId: state => state.filter.shopId,
        }),
        section() {
            return this.sections.find((section) => section.id === this.sectionId);
        },
        properties() {
            return this.section?.properties || [];
        },
        sectionId() {
            return this.detail.sectionId;
        },
        additionalProperty() {
            return this.properties.find(prop => prop.code === 'ADDITIONAL_SORT');
        },
        discountProperty() {
            return this.properties.find(prop => prop.code === 'DISCOUNT');
        },
        formData() {
            const fd = new FormData;

            fd.append('id', this.id);
            fd.append('name', this.name);
            fd.append('price', this.price);
            fd.append('sort', this.sort);
            fd.append('discount', this.discount);
            fd.append('shopId', this.shopId);

            if (this.fileItem?.isNew && this.fileItem?.file) {
                fd.append('image', this.fileItem.file, this.fileItem.file.name);
            }
            if (this.fileItem?.isDeleted && this.fileItem?.id) {
                fd.append('image', this.fileItem.id);
            }

            return fd;
        }
    },
    methods: {
        ...mapActions([
            'editAdditional',
        ]),
        ...mapActions({
            removeAction: 'remove',
        }),
        save() {
            this.$showLoader();
            this.editAdditional(this.formData)
                .then(() => {
                    this.$hideLoader();
                    this.hidePanel();
                    this.$success('Успешно обновлён дополнительный товар');
                })
                .catch((response) => {
                    this.$hideLoader();
                    this.$showErrors(response);
                });
        },
        remove() {
            this.$showLoader();
            this.removeAction({id: this.id})
                .then(() => {
                    this.$hideLoader();
                    this.hidePanel();
                    this.$success('Успешно удален товар');
                })
                .catch((response) => {
                    this.$hideLoader();
                    this.$showErrors(response);
                });
        },
        setFromStore() {
            this.id    = this.detail.id;
            this.price = this.detail.price;
            this.name  = this.detail.name
            if (this.additionalProperty?.id) {
                this.sort = this.detail?.properties[this.additionalProperty?.id];
            }
            if (this.discountProperty?.id) {
                this.discount = this.detail?.properties[this.discountProperty?.id];
            }
            this.fileItem = new FileItem(this.detail.images[0]);
        },
    },
    mounted() {
        this.setFromStore();
    }
}
</script>