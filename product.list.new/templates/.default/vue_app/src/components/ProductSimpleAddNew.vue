<template>
    <div class="panel__block" style="display: block;">
        <div class="panel__top">
            <h2 class="panel__title">Добавление товара</h2>
        </div>

        <div class="panel__content">
            <div class="panel__content-block">
                <v-image
                    v-model="images"
                    :multiple="true"
                    :capture="'camera'"
                />

                <div class="panel-form-row">
                    <v-input
                        v-model="name"
                        placeholder="Название"
                    />
                </div>

                <div
                    class="panel-form-row"
                    v-if="isAdmin"
                >
                    <v-select
                        v-model="userId"
                        :searchable="true"
                        :multiple="false"
                        :type="'old'"
                        :options="partners"
                        :placeholder="'Партнер'"
                    />
                </div>

                <div
                    class="panel-form-row"
                    v-if="canSelectCity"
                >
                    <v-select
                        v-model="cityId"
                        :searchable="true"
                        :multiple="false"
                        :type="'old'"
                        :options="cities"
                        :placeholder="'Город'"
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
                    <v-select
                        v-model="names"
                        :multiple="true"
                        :searchable="true"
                        :options="flowers"
                        :close-on-select="false"
                        placeholder="Цветы букета"
                    />
                </div>

                <div class="panel-form-row">
                    <v-select
                        v-model="occasion"
                        :multiple="true"
                        :searchable="true"
                        :options="occasions"
                        :close-on-select="false"
                        placeholder="Повод"
                    />
                </div>

            </div>

            <div class="panel__actions">
                <div class="panel__actions-block">
                    <a
                        href="#add_simple"
                        class="btn btn_wide btn_secondary"
                        @click.prevent="save"
                    >Сохранить</a>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {mapState, mapActions, mapMutations, mapGetters} from 'vuex';
    import VImage from "@/components/controlsv2/VImage";
    import VSelect from "@/components/controlsv2/VSelect";
    import VInput from "@/components/controlsv2/VInput";

    export default {
        name       : "ProductSimpleAddNew",
        inject     : ['hidePanel'],
        components : {
            VInput,
            VSelect,
            VImage
        },
        data() {
            return {
                images   : [],
                name     : '',
                names    : [],
                occasion : [],
                userId   : 0,
                cityId   : 0,
                price    : '',
            };
        },
        computed   : {
            ...mapState([
                'partners',
                'cities',
                'shopFrontUrl',
                'occasions',
                'isAdmin',
            ]),
            canSelectCity() {
                return this.cities.length > 1;
            },
            isEmptyCities() {
                return this.cities.length === 0;
            },
            ...mapGetters([
                'allProps'
            ]),
            flowers() {
                return this.allProps.find(prop => prop.code === 'CONSIST')?.listValues;
            },
        },
        methods    : {
            ...mapActions([
                'addSimple'
            ]),
            ...mapMutations([
                'setHasProducts',
            ]),
            save() {
                if (!this.isEmptyCities && !this.cityId) {
                    this.$error('Укажите город');
                    return;
                }

                let data = new FormData();

                data.append('userId', this.userId);
                data.append('cityId', this.cityId);
                data.append('price', this.price);
                data.append('name', this.name);
                data.append('names', JSON.stringify(this.names));
                data.append('occasion', JSON.stringify(this.occasion));

                if (this.isAdmin) {
                    data.append('userId', this.userId);
                }

                for (let i = 0; i < this.images.length; i++) {
                    const item = this.images[i];

                    if (item.isDeleted === false) {
                        data.append('images[' + i + ']', item.file, item.file.name);
                    }
                }

                this.$showLoader();
                this.addSimple(data)
                    .then(() => {
                        this.$hideLoader();
                        this.hidePanel();
                        this.$success("Успешно добавлен готовый товар");
                        this.setHasProducts();
                    })
                    .catch((response) => {
                        this.$hideLoader();
                        this.$showErrors(response);
                    });
            }
        },
        created() {
            if (!this.isEmptyCities && !this.canSelectCity) {
                this.cityId = this.cities[0]?.id;
            }
        }
    }
</script>