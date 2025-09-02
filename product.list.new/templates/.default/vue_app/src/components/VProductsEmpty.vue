<template>
    <div class="products-empty-page">
        <h1 class="title title--h1 products-empty-page__title">
            Создайте первые товары для начала работы
        </h1>
        <div class="products-empty-page__options">
            <div class="products-empty-page__option-item">
                <div class="product-add-control">
                    <div class="product-add-control__img">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none">
                            <g clip-path="url(#clip0)" fill="#8A49F3">
                                <path d="M23.51 22.492a.512.512 0 01.516-.468h1.136a.313.313 0 00.312-.339c-.401-4.575-4.058-8.232-8.634-8.634a.313.313 0 00-.339.313v1.135c0 .267-.201.5-.468.517a.5.5 0 01-.533-.5v-1.152a.313.313 0 00-.34-.313c-4.575.402-8.232 4.059-8.633 8.634a.313.313 0 00.312.34h1.135c.267 0 .5.2.517.467a.5.5 0 01-.5.534H6.84a.313.313 0 00-.312.339c.401 4.575 4.058 8.232 8.634 8.634a.314.314 0 00.339-.312V30.55c0-.267.201-.5.467-.516a.5.5 0 01.534.499v1.153c0 .183.157.328.34.312 4.575-.402 8.231-4.059 8.633-8.634a.313.313 0 00-.312-.34H24.01a.5.5 0 01-.5-.533zm-1.7-3.152a.501.501 0 01-.452.498c-.033.003.085.002-2.154.002-.267 0-.5-.2-.518-.466a.5.5 0 01.5-.535h.694a.092.092 0 00.065-.157l-.003-.002c-2.148-2.148-5.647-2.209-7.809-.075a5.503 5.503 0 00-.026 7.814 5.504 5.504 0 007.787 0 .5.5 0 11.708.707A6.465 6.465 0 0116 29.032a6.503 6.503 0 01-6.507-6.507c0-3.6 2.916-6.513 6.519-6.507 1.742.003 3.407.723 4.64 1.955a.092.092 0 00.157-.064v-.676c0-.267.201-.5.467-.516a.5.5 0 01.534.5v2.123zm-4.808 4.186a.5.5 0 01-.491-.599l.5-2.502a.5.5 0 11.982.196l-.306 1.53a.313.313 0 00.307.374h.697c.173 0 .313-.14.313-.313v-.671c0-.267.201-.5.467-.517a.5.5 0 01.534.5v2.986c0 .267-.201.5-.468.517a.5.5 0 01-.533-.5v-.688a.313.313 0 00-.313-.313H17zm-3.004-2.503h-.511a.498.498 0 00-.49.506.5.5 0 01-.519.495c-.283-.01-.49-.264-.481-.547a1.504 1.504 0 011.5-1.455h.501c1.426 0 2.046 1.809.923 2.706l-.927.742c-.23.184-.1.557.196.557h.792c.267 0 .5.201.517.467a.5.5 0 01-.5.534h-2.503a.5.5 0 01-.5-.5v-.501a.5.5 0 01.188-.391l2.112-1.69c.386-.31.184-.923-.298-.923z"/>
                                <path d="M29.015 2.002h-2.502v-.5a1.502 1.502 0 10-3.003 0v.5H8.493v-.5a1.502 1.502 0 10-3.003 0v.5H2.987A2.004 2.004 0 00.984 4.004v21.024c0 1.104.898 2.002 2.003 2.002H5.99a.5.5 0 100-1.001H2.987c-.552 0-1.002-.45-1.002-1.001V8.008h28.032v17.02c0 .552-.45 1-1.002 1h-3.003a.5.5 0 100 1.002h3.003a2.004 2.004 0 002.003-2.002V4.004a2.004 2.004 0 00-2.003-2.002zM7.492 4.004a.501.501 0 01-1.002 0V1.502a.501.501 0 011.002 0v2.502zm18.02 0a.501.501 0 01-1.002 0V1.502a.501.501 0 011.002 0v2.502z"/>
                            </g>
                            <defs>
                                <clipPath id="clip0">
                                    <path fill="#fff" d="M0 0h32v32H0z"/>
                                </clipPath>
                            </defs>
                        </svg>
                    </div>
                    <div class="product-add-control__title">
                        Постоянные товары
                    </div>
                    <div class="product-add-control__text">
                        всегда в вашем ассортименте.
                    </div>
                    <div class="product-add-control__btn hidden-s">
                        <button
                            class="btn btn_secondary product-add"
                            @click="addProduct"
                        >
                            <i class="icon">
                                <svg width="22" height="22" viewBox="0 0 22 22" fill-rule="evenodd" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 0H9.99998V9.99996H0V12H9.99998V22H12V12H22V9.99996H12V0Z"></path>
                                </svg>
                            </i>
                            <span class="text">постоянный товар</span>
                        </button>
                    </div>
                </div>
            </div>
            <div class="products-empty-page__option-item">
                <div class="product-add-control">
                    <div class="product-add-control__img">
                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="32" fill="none">
                            <path d="M23.89 9.617a.8.8 0 00-1.131-1.131l-1.198 1.197a12.757 12.757 0 00-7.751-3.258V4.8h1.6a.8.8 0 00.8-.8V.8a.8.8 0 00-.8-.8h-4.8a.8.8 0 00-.8.8V4a.8.8 0 00.8.8h1.6v1.625A12.75 12.75 0 004.632 9.53L3.587 8.486a.799.799 0 10-1.131 1.131l1.034 1.035a12.815 12.815 0 00-2.404 3.894C-2.185 22.886 3.997 32 13.01 32c7.058 0 12.8-5.742 12.8-12.8 0-3.2-1.18-6.129-3.128-8.375l1.208-1.208zM13.01 28a8.8 8.8 0 110-17.6 8.8 8.8 0 010 17.6z" fill="#8A49F3"/>
                            <path d="M13.81 17.817V13.6a.8.8 0 10-1.6 0v4.217a1.6 1.6 0 101.6 0z" fill="#8A49F3"/>
                        </svg>
                    </div>
                    <div class="product-add-control__title">
                        Готовые товары
                    </div>
                    <div class="product-add-control__text">
                        собраны и готовы к отправке, публикуются на сайте на 24 часа, далее автоматически удаляются.
                    </div>
                    <div class="product-add-control__btn hidden-s">
                        <button
                            class="btn btn_bordered--violet product-add"
                            @click="addSimple"
                        >
                            <i class="icon">
                                <svg width="22" height="22" viewBox="0 0 22 22" fill-rule="evenodd" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 0H9.99998V9.99996H0V12H9.99998V22H12V12H22V9.99996H12V0Z"></path>
                                </svg>
                            </i>
                            <span class="text">готовый товар</span>
                        </button>
                    </div>
                </div>
            </div>
            <div class="visible-s">
                <button
                    class="btn btn_secondary product-add-control__btn"
                    @click.prevent="showProductCategory"
                >добавить товар</button>
            </div>
            <div class="product-add-choose-category" :style="categoryStyle">
                <div class="product-add-choose-category__actions">
                    <button
                        class="btn-white product-add"
                        @click.prevent="addProduct"
                    >товар</button>
                    <button
                        class="btn-white product-add-ready"
                        @click.prevent="addSimple"
                    >Готовый товар</button>
                </div>
                <div class="product-add-choose-category__cancel">
                    <button
                        class="btn-white"
                        @click.prevent="hideProductCategory"
                    >отменить</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name : "VProductsEmpty",
    data() {
        return {
            isCategoryVisible: false,
        };
    },
    computed: {
        categoryStyle() {
            return {
                display: this.isCategoryVisible ? 'flex': 'none',
            };
        }
    },
    methods: {
        addProduct() {
            this.$emit('add-product');
            this.hideProductCategory();
        },
        addSimple() {
            this.$emit('add-simple');
            this.hideProductCategory();
        },
        showProductCategory() {
            this.isCategoryVisible = true;
        },
        hideProductCategory() {
            this.isCategoryVisible = false;
        },
    }
}
</script>
<style>
.product-add-choose-category{
  bottom: 62px!important;
  top: auto;
}
</style>