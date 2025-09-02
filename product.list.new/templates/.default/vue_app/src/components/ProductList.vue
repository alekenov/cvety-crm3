<template>
    <div class="page__content">
        <div v-if="hasProducts" class="page__top">
            <h1 class="page__title">Товары</h1>
            <div class="page__top-actions">
                <div class="visible-m">
                    <button class="btn btn_secondary order-create" @click="showAddSidebar">
                        <i class="icon">
                            <svg width="22" height="22" viewBox="0 0 22 22" fill-rule="evenodd" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M12 0H9.99998V9.99996H0V12H9.99998V22H12V12H22V9.99996H12V0Z"></path>
                            </svg>
                        </i>
                        <span class="text">Добавить товар</span>
                    </button>
                    <button v-if="isMobileDevice" class="btn btn_secondary order-create" @click="showAddSimpleSidebar">
                        <i class="icon">
                            <svg width="22" height="22" viewBox="0 0 22 22" fill-rule="evenodd" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M12 0H9.99998V9.99996H0V12H9.99998V22H12V12H22V9.99996H12V0Z"></path>
                            </svg>
                        </i>
                        <span class="text">Готовый товар</span>
                    </button>
                </div>
                <div class="hidden-m">
                    <button class="btn btn_thin btn_transparent order-create" @click="showAddSidebar">
                        <i class="icon">
                            <svg width="29" height="29" viewBox="0 0 29 29" fill-rule="evenodd" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M16 0H13V13H0V16H13V29H16V16H29V13H16V0Z"></path>
                            </svg>
                        </i>
                    </button>
                </div>
            </div>
        </div>

        <v-top-panel
            v-if="hasProducts"
            :is-admin="isAdmin"
            :shops="shops"
            :sections="grouped"
            :filter="filter"
            @set-filter="onSetFilter"
        />

        <div style="padding: 10px 0" v-if="shopFrontUrl && hasProducts">
            <a :href="shopFrontUrl" target="_blank">Готовые букеты</a>
        </div>

        <div v-if="hasProducts && !isEmpty" class="grid product__grid">
            <div
                class="grid__col grid__col_25"
                v-for="product in products"
                :key="product.id"
            >
                <div
                    class="product product-edit"
                    :class="{'product--faded' : !(product.inStock && product.isActive)}"
                    @click="getDetail(product.id)"
                >
                    <div class="product__img">
                        <img :src="product.imageResized">
                    </div>
                    <div class="product__info">
                        <div class="product__title">{{product.name}}</div>
                        <div class="product__cost" v-html="product.priceFormatted"></div>
                    </div>
                </div>
              <div class="crm__shop-item-row" v-if="isShowBlocks()">
                <button class="btn-fiolet" :class="{'activeBtn' : product.top}"  @click="topProduct(product.id,product.top)"><span v-if="product.top">Убрать из топа</span><span v-else>Отправить в ТОП</span></button>
                <button class="btn-fiolet" :class="{'activeBtn' : product.freeDelivery}" @click="freeDeilvery(product.id,product.freeDelivery)">Бесплатная доставка</button>
              </div>


                <div class="product__switch">
                    <v-switch
                        title="В наличии"
                        :checked="product.inStock && product.isActive"
                        @change="onChangeSwitch({checked: $event, productId: product.id})"
                    />
                </div>
            </div>
        </div>

        <pagination
            v-if="!isMobile"
            :page-nav="pageNav"
            @change="changePage"
        />

        <v-products-empty
            v-if="!hasProducts"
            @add-product="showAddSidebar"
            @add-simple="showAddSimpleSidebar"
        />

        <product-side-panel
            ref="sidePanel"
        />

    </div>
</template>

<script>
    import ProductSidePanel from "components/ProductSidePanel";
    import Pagination from "components/Pagination";
    import {mapState, mapMutations, mapActions} from 'vuex';
    import VSwitch from "components/controls/VSwitch";
    import VTopPanel from "@/components/VTopPanel";
    import VProductsEmpty from "@/components/VProductsEmpty";

    export default {
        name : "ProductList",
        components : {
            VProductsEmpty,
            VTopPanel,
            VSwitch,
            ProductSidePanel,
            Pagination,
        },
        data() {
            return {
                isMobileDevice: false,
            };
        },
        computed: {
            ...mapState([
                'pageNav',
                'products',
                'shopFrontUrl',
                'isAdmin',
                'shops',
                'grouped',
                'filter',
                'isMobile',
                'hasProducts',
                'shopId'
            ]),
            isEmpty() {
                return this.products.length === 0;
            }
        },
        methods: {
            ...mapActions({
                loadDetailAction         : 'loadDetail',
                loadProductsAction       : 'loadProducts',
                activateAction           : 'activate',
                deactivateAction         : 'deactivate',
                setInStockAction         : 'setInStock',
                unsetInStockAction       : 'unsetInStock',
                setFilterAction          : 'setFilter',
                addToFavoriteAction      : 'addToFavorite',
                removeFromFavoriteAction : 'removeFromFavorite',
                setFreeDeliveryAction    : 'changeFreeDelivery',
                topProductAction         : 'changeTopProduct',
            }),
            ...mapMutations([
                'setOffset',
                'setActive',
                'setInStock',
                'setIsMobile',
                'setFreeDelivery',
                'setTopProduct'
            ]),
            favoriteIconClassWrapper(product) {
                return {
                    'product__favorite': true,
                    'active': product.isFavorite,
                };
            },
            onFavoriteIconClick({id, isFavorite}) {
                this.$showLoader();

                const promiseResult = isFavorite
                    ? this.removeFromFavoriteAction(id)
                    : this.addToFavoriteAction(id);

                promiseResult.then(() => {
                    this.$hideLoader();
                    const message = isFavorite
                        ? 'Товар удалён из избранного'
                        : 'Товар добавлен в избранное';

                    this.$success(message);
                }).catch((response) => {
                    this.$hideLoader();
                    this.$showErrors(response);
                });
            },
            onSetFilter(filter) {
                this.$showLoader();
                this.setFilterAction(filter)
                    .catch(this.$showErrors.bind(this))
                    .finally(() => {
                        this.$hideLoader();
                    })
            },
            onChangeSwitch({checked, productId}) {
                this.setInStock({checked, productId});
                if (checked) {
                    this.setInStockAction({productId})
                        .then(() => {
                            this.setActive({checked: checked, productId});
                        })
                        .catch((response) => {
                            this.$showErrors(response);
                            this.setInStock({checked: !checked, productId});
                        });
                }
                else {
                    this.unsetInStockAction({productId})
                        .catch((response) => {
                            this.$showErrors(response);
                            this.setInStock({checked: !checked, productId});
                        });
                }
            },
            showAddSidebar() {
                this.$refs.sidePanel.showAddPanel();
            },
            showAddSimpleSidebar() {
                if (this.isMobileDevice) {
                    this.$refs.sidePanel.showAddSimplePanel();
                }
                else {
                    alert('Добавлять готовые товары можно только с мобильных устройств');
                }
            },
            getDetail(id) {
                this.$showLoader();
                this.loadDetailAction(id)
                    .then(() => {
                        this.$refs.sidePanel.showDetailPanel();
                    })
                    .catch(response => {
                        this.$showErrors(response);
                    })
                    .finally(() => {
                        this.$hideLoader();
                    });
            },
            loadProducts() {
                this.$showLoader();

                const mergeStrategy = this.isMobile ? 'add' : 'set';

                this.loadProductsAction({mergeStrategy})
                    .catch((response) => {
                        this.$showErrors(response);
                    })
                    .finally(() => {
                        this.$hideLoader();
                    })
            },
            changePage(page) {
                this.setOffset(page);
                this.loadProducts();
            },
            nextPage() {
                if (this.pageNav.offset < this.pageNav.total) {
                    this.changePage(this.pageNav.offset + 1);
                }
            },
            windowResizeHandler(loadProducts = true) {
                const isMobile = window.innerWidth <= 768;

                if (isMobile !== this.isMobile) {
                    this.setIsMobile(isMobile);
                    if (loadProducts) {
                        this.changePage(1);
                    }
                }
            },
            handleInfScroll() {
                if (this.isMobile === false) {
                    return;
                }

                const scrollHeight = Math.max(
                    document.body.scrollHeight, document.documentElement.scrollHeight,
                    document.body.offsetHeight, document.documentElement.offsetHeight,
                    document.body.clientHeight, document.documentElement.clientHeight
                );

                const scrollY = window.scrollY + document.body.clientHeight;

                const isNeedLoad = scrollY > scrollHeight - 300;

                if (isNeedLoad && !this.$isLoading()) {
                    this.nextPage();
                }
            },
          isShowBlocks() {
            return this.shopId === 17008 || this.shopId === 647529;
          },
          freeDeilvery(productId,freeDelivery)
          {
            let checked = !freeDelivery;
            this.$showLoader();


            this.setFreeDeliveryAction({productId,checked})
                .then(() => {
                  this.$hideLoader();
                  this.setFreeDelivery({ productId,checked});
                })
                .catch((response) => {
                  this.$hideLoader();
                  this.$showErrors(response);
                });
          },
          topProduct(productId,top)
          {
            let checked = !top;
            this.$showLoader();

            this.topProductAction({productId,checked})
                .then(() => {
                  this.$hideLoader();
                  this.setTopProduct({ productId,checked});
                })
                .catch((response) => {
                  this.$hideLoader();
                  this.$showErrors(response);
                });
          }
        },
        mounted() {
            window.BX.ready(() => {
                window.mobileMenu.setAddButtonHandler(this.showAddSidebar.bind(this));
                window.mobileMenu.setSimpleAddButtonHandler(this.showAddSimpleSidebar.bind(this));
            });

            window.addEventListener('resize', this.windowResizeHandler.bind(this), {passive: true});

            document.addEventListener('scroll', this.handleInfScroll.bind(this), {passive: true});

            // Определяем текущую версию приложения - мобильное или десктоп.
            this.windowResizeHandler(false);

            const detect = new window.MobileDetect(window.navigator.userAgent);
            this.isMobileDevice = !!detect.mobile();
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.windowResizeHandler.bind(this));

            document.addEventListener('scroll', this.handleInfScroll.bind(this));
        },

    }
</script>
<style>
.tag-more-photo {
  background-color: #d6ebff;
  border-radius: 13px;
  margin-top: 3px;
  white-space: nowrap;
  font-weight: 400;
  font-size: 14px;
  line-height: 16px;
  padding: 5px 5px 4px;
  display: inline-block;
}
.btn-fiolet {
  border: 1px solid #8a49f3;
  border-radius: 4px;
  background: transparent;
  max-height: 45px;
  min-height: 30px;
  text-align: center;
  width: 100%;
  color: #8a49f3;
  font-size: 13px;
  font-weight: 500;
  line-height: 22px;
  margin-right: 10px;
  margin-left: 10px;
}
.crm__shop-item-row
{
  display: flex;
  margin-top: 10px;
}
.activeBtn{
  background-color: #8a49f3;
  color: white;
}
</style>