<template>
    <div class="multi-container">
        <v-input
            v-for="(value, index) in values"
            :key="index"
            :value="value"
            @input="onInput($event, index)"
        />
    </div>
</template>

<script>
    import VInput from "components/controls/VInput";
    import InputMultipleMixin from "mixins/InputMultipleMixin";

    export default {
        name       : "VInputMulti",
        components : {
            VInput,
        },
        mixins     : [InputMultipleMixin],
    };
</script>