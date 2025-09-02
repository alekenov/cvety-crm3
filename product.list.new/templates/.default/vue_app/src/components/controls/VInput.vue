<template>
    <input
        type="text"
        :value="value"
        :placeholder="placeholder"
        @input="onInput"
    />
</template>

<script>
    import InputMixin from "mixins/InputMixin";

    export default {
        name   : "VInput",
        mixins : [InputMixin],
    };
</script>