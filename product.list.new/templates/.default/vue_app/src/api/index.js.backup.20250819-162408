const BX = window.BX;

function call(method, data) {
    return new Promise((resolve, reject) => {
        let config = {
            mode   : 'class',
            method : 'post',
            data,
        };

        if (data instanceof FormData) {
            config.preparePost = false;
            config.cache = false;
        }

        const bxPromise = BX.ajax.runComponentAction('crm:product.list.new', method, config);

        bxPromise.then(resolve);
        bxPromise.catch(reject);
    });
}

export default {
    getList({offset, shopId, search, inStock, sectionIds}) {
        return call('getList', {
            offset,
            params : {
                shopId,
                search,
                inStock,
                sectionIds,
            },
        });
    },

    getDetail({id}) {
        return call('getDetail', {id});
    },

    activate({productId}) {
        return call('activate', {productId});
    },

    deactivate({productId}) {
        return call('deactivate', {productId});
    },

    setInStock({productId}) {
        return call('setInStock', {productId});
    },

    unsetInStock({productId}) {
        return call('unsetInStock', {productId});
    },

    add(formData) {
        return call('add', formData);
    },

    edit(formData) {
        return call('edit', formData);
    },

    remove({id}) {
        return call('remove', {id});
    },

    removeOffer({id, productId}) {
        return call('removeOffer', {id, productId});
    },

    addOffer(formData) {
        return call('addOffer', formData);
    },

    addOfferNew(formData) {
        return call('addOfferNew', formData);
    },

    editOfferNew(formData) {
        return call('editOfferNew', formData);
    },

    editOffer(formData) {
        return call('editOffer', formData);
    },

    addSimple(formData) {
        return call('addSimpleProduct', formData);
    },

    addAdditional(formData) {
        return call('addAdditional', formData);
    },

    editAdditional(formData) {
        return call('editAdditional', formData);
    },

    addToFavorite(id) {
        return call('addToFavorite', {id});
    },

    removeFromFavorite(id) {
        return call('removeFromFavorite', {id});
    },

    searchProductsForUnion({search, productId, shopId = 0}) {
        return call('removeFromFavorite', {
            search,
            productId,
            shopId,
        });
    },

    saveUnionProducts(params) {
        return call('saveUnionProducts', params)
    },

    getUnionProducts(productId) {
        return call('getUnionProducts', {
            productId,
        })
    },
    changeFreeDelivery({productId,checked}) {
        return call('setFreeDelivery', {
            productId,checked
        })
    },
    changeTopProduct({productId,checked}) {
        return call('changeTopProduct', {
            productId,checked
        })
    },


    loadOldUnion()
    {
        return call('loadOldUnion');
    },


}