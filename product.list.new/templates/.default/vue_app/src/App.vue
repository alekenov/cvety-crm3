<template>
    <div>
        <product-list/>
        <notifications group="notification" />
    </div>
</template>

<script>
    import ProductList from "components/ProductList";

    export default {
        name: 'App',
        components : {
            ProductList,
        },
    }
</script>