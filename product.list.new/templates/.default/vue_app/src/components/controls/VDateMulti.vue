<template>
    <div class="multi-container">
        <v-date
            v-for="(value, index) in values"
            :key="index"
            :value="value"
            @input="onInput($event, index)"
        />
    </div>
</template>

<script>
    import VDate from "components/controls/VDate";
    import InputMultipleMixin from "mixins/InputMultipleMixin";

    export default {
        name       : "VDateMulti",
        components : {
            VDate,
        },
        mixins     : [InputMultipleMixin],
    }
</script>