<template>
    <div class="multi-container">
        <v-textarea
            v-for="(value, index) in values"
            :key="index"
            :value="value"
            @input="onInput($event, index)"
        />
    </div>
</template>

<script>
    import VTextarea from "components/controls/VTextarea";
    import InputMultipleMixin from "mixins/InputMultipleMixin";

    export default {
        name       : "VTextareaMulti",
        components : {
            VTextarea,
        },
        mixins     : [InputMultipleMixin],
    };
</script>