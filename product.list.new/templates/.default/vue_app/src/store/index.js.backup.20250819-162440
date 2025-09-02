import Vuex from 'vuex';
import Vue from 'vue';

import PageNav from "models/PageNav";
import SectionItem from "models/SectionItem";
import ProductItem from "models/ProductItem";
import ProductDetail from "models/ProductDetail";
import api from 'api';
import ListItem from "models/ListItem";

Vue.use(Vuex);

const SET_PRODUCT_STRATEGY_SET = 'set';
// const SET_PRODUCT_STRATEGY_ADD = 'add';

const jsParams = {
    sections        : window.jsParams.sections,
    grouped         : window.jsParams.grouped,
    products        : window.jsParams.products,
    cities          : window.jsParams.cities,
    pageNav         : window.jsParams.pageNav,
    typeBouquets    : window.jsParams.typeBouquets,
    quantityFlowers : window.jsParams.quantityFlowers,
    partners        : window.jsParams.partners,
    shopFrontUrl    : window.jsParams.shopFrontUrl,
    isAdmin         : window.jsParams.isAdmin,
    shops           : window.jsParams.shops,
    selectedShop    : window.jsParams.selectedShop,
    occasions       : window.jsParams.occasions,
    filter          : {
        search     : window.jsParams.filter.search,
        sectionIds : window.jsParams.filter.sectionIds || [],
        shopId     : window.jsParams.filter.shopId,
        inStock    : window.jsParams.filter.inStock,
    },
    hasProducts     : window.jsParams.hasProducts,
    shopId          : window.jsParams.shopId,
    floristCvetykz: window.jsParams.floristCvetykz,
};

export default new Vuex.Store({
    state     : {
        sections        : SectionItem.createFromArray(jsParams.sections),
        grouped         : jsParams.grouped,
        cities          : jsParams.cities,
        products        : ProductItem.createFromArray(jsParams.products),
        pageNav         : PageNav.createFrom(jsParams.pageNav),
        detail          : {},
        mode            : '',
        search          : '',
        offerId         : 0,
        typeBouquets    : ListItem.createFromArray(jsParams.typeBouquets),
        quantityFlowers : ListItem.createFromArray(jsParams.quantityFlowers),
        partners        : ListItem.createFromArray(jsParams.partners),
        shops           : ListItem.createFromArray(jsParams.shops),
        selectedShop    : jsParams.selectedShop,
        isMobile        : false,
        filter          : {
            search     : jsParams.filter.search,
            shopId     : jsParams.filter.shopId,
            inStock    : jsParams.filter.inStock,
            sectionIds : jsParams.filter.sectionIds,
        },

        shopFrontUrl : jsParams.shopFrontUrl,
        isAdmin      : jsParams.isAdmin,
        hasProducts  : jsParams.hasProducts,
        shopId          : jsParams.shopId,
        isFloristCvetykz: jsParams.floristCvetykz,
    },
    mutations : {
        setProducts(state, payload) {
            state.products = ProductItem.createFromArray(payload);
        },
        addProducts(state, payload) {
            state.products = [
                ...state.products,
                ...ProductItem.createFromArray(payload),
            ];
        },
        setPageNav(state, payload) {
            state.pageNav = PageNav.createFrom(payload);
        },
        setOffset(state, payload) {
            state.pageNav.offset = payload;
        },
        setMode(state, payload) {
            state.mode = payload;
        },
        setIsMobile(state, payload) {
            state.isMobile = payload;
        },
        setDetail(state, payload) {
            state.detail = payload === null ? null : ProductDetail.createFrom(payload);
        },
        setOfferId(state, payload) {
            state.offerId = payload;
        },
        setSelectedShop(state, payload) {
            state.selectedShop = payload;
        },
        setHasProducts(state) {
            state.hasProducts = true;
        },
        setActive(state, {productId, checked}) {
            const index = state.products.findIndex(({id}) => id === productId);

            if (index >= 0) {
                state.products[index].isActive = checked;
            }
        },
        setFreeDelivery(state, {productId, checked}) {
            const index = state.products.findIndex(({id}) => id === productId);

            if (index >= 0) {
                state.products[index].freeDelivery = checked;
            }
        },

        setTopProduct(state, {productId, checked}) {
            const index = state.products.findIndex(({id}) => id === productId);

            if (index >= 0) {
                state.products[index].top = checked;
            }
        },



        setInStock(state, {productId, checked}) {
            const index = state.products.findIndex(({id}) => id === productId);

            if (index >= 0) {
                state.products[index].inStock = checked;
            }
        },
        setFilterSearch(state, payload) {
            state.search = payload;
        },
        setFilterSectionIds(state, payload) {
            state.filter.sectionIds = payload;
        },
        setFilterShopId(state, payload) {
            state.filter.shopId = payload;
        },
        setFilterInStock(state, payload) {
            state.filter.inStock = payload;
        },
        setFilter(state, filter) {
            state.filter = filter;
        },
        checkFavorite(state, {id, isFavorite}) {
            const product = state.products.find((item => item.id === id));

            if (!product) {
                return;
            }

            product.isFavorite = isFavorite;
        },
    },
    getters   : {
        allProps(state) {
            const obProperties = state.sections.reduce((carry, {properties}) => {
                properties.forEach(function (property) {
                    carry[property.id] = property;
                });

                return carry;
            }, {});

            return Object.values(obProperties);
        },
        allOffersProps(state) {
            const obProperties = state.sections.reduce((carry, {offersProperties}) => {
                offersProperties.forEach(function (property) {
                    carry[property.id] = property;
                });

                return carry;
            }, {});

            return Object.values(obProperties);
        },
        flowers(state, getters) {
            return getters.allProps.find(({code}) => code === 'CONSIST')?.listValues || [];
        },
        sectionsMap(state) {
            return state.sections.reduce((carry, item) => {
                carry[item.id] = item;

                return carry;
            }, {});
        },
        popularSections(state) {
            return state.sections.filter(section => section.isPopular && !section.hasChild);
        },
    },
    actions   : {
        loadProducts({state, commit}, {mergeStrategy = SET_PRODUCT_STRATEGY_SET} = {}) {
            const params = {
                offset     : state.pageNav.offset,
                shopId     : state.filter.shopId,
                search     : state.filter.search,
                inStock    : state.filter.inStock,
                sectionIds : state.filter.sectionIds,
            };

            return api.getList(params)
                      .then(response => {
                          const data = response.data;

                          if (mergeStrategy === SET_PRODUCT_STRATEGY_SET) {
                              commit('setProducts', data.products);
                          }
                          else {
                              commit('addProducts', data.products);
                          }
                          commit('setPageNav', data.pageNav);
                      });
        },

        loadDetail({commit}, id) {
            return api.getDetail({id})
                      .then(({data}) => {
                          commit('setDetail', data);
                      });
        },

        addProduct({commit}, formData) {
            return api.add(formData)
                      .then(response => {
                          commit('setDetail', response.data);
                      });
        },

        editProduct({commit}, formData) {
            return api.edit(formData)
                      .then(response => {
                          commit('setDetail', response.data);
                      });
        },

        remove(context, {id}) {
            return api.remove({id});
        },

        removeOffer({state, commit}, {id}) {
            const getListParams = {
                id,
                productId : state.detail.id
            };

            return api.removeOffer(getListParams)
                      .then(response => {
                          commit('setMode', 'offer-list');
                          commit('setDetail', response.data);
                      });
        },

        addOffer({commit}, formData) {
            return api.addOffer(formData)
                      .then(response => {
                          commit('setDetail', response.data);
                          commit('setOfferId', response.data.lastOfferId);
                      });
        },

        addOfferNew({commit}, formData) {
            return api.addOfferNew(formData)
                      .then(response => {
                          commit('setDetail', response.data);
                          commit('setOfferId', response.data.lastOfferId);
                      });
        },

        editOfferNew({commit}, formData) {
            return api.editOfferNew(formData)
                      .then(response => {
                          commit('setDetail', response.data);
                      });
        },

        editOffer({commit}, formData) {
            return api.editOffer(formData)
                      .then(response => {
                          commit('setDetail', response.data);
                      });
        },

        addSimple(context, formData) {
            return api.addSimple(formData);
        },

        addAdditional(context, formData) {
            return api.addAdditional(formData);
        },

        editAdditional(context, formData) {
            return api.editAdditional(formData);
        },

        setFilter({commit, dispatch}, filter) {
            commit('setFilter', filter);
            commit('setOffset', 1);

            return dispatch('loadProducts', {mergeStrategy: SET_PRODUCT_STRATEGY_SET});
        },

        activate(context, {productId}) {
            return api.activate({productId});
        },

        deactivate(context, {productId}) {
            return api.deactivate({productId});
        },

        setInStock(context, {productId}) {
            return api.setInStock({productId});
        },

        unsetInStock(context, {productId}) {
            return api.unsetInStock({productId});
        },

        addToFavorite({commit}, id) {
            return api.addToFavorite(id)
                      .then(() => {
                          commit('checkFavorite', {id, isFavorite: true})
                      });
        },
        removeFromFavorite({commit}, id) {
            return api.removeFromFavorite(id)
                      .then(() => {
                          commit('checkFavorite', {id, isFavorite: false})
                      });
        },
        saveUnionProducts(context, params) {
            return api.saveUnionProducts(params)
        },
        getUnionProducts(context, productId) {
            return api.getUnionProducts(productId)
        },

        changeFreeDelivery(context, {productId,checked}) {
            return api.changeFreeDelivery({productId,checked})
        },
        changeTopProduct(context, {productId,checked}) {
            return api.changeTopProduct({productId,checked})
        },

        loadOldUnion({commit,dispatch}) {
            return api.loadOldUnion();
        },
    },
});