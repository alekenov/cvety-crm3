<template>
    <textarea
        class="crm-text"
        :placeholder="placeholder"
        :value="value"
        @input="onInput"
    ></textarea>
</template>

<script>
    import InputMixin from "mixins/InputMixin";

    export default {
        name   : "VTextarea",
        mixins : [InputMixin],
    };
</script>