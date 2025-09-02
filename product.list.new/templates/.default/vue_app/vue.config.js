module.exports = {
    publicPath          : '/local/components/crm/product.list.new/templates/.default/vue_app/dist/',
    filenameHashing     : false,
    productionSourceMap : false,
    configureWebpack    : {
        optimization : {
            splitChunks : false
        },
    },
    chainWebpack        : config => {
        config.plugins.delete('html')
        config.plugins.delete('preload')
        config.plugins.delete('prefetch')
        config.resolve.modules.add("./src")
    }
};