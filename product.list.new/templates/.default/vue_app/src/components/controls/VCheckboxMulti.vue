<template>
    <div class="multi-container">
        <v-checkbox
            v-for="(item, index) in values"
            :key="index"
            :checked="item.value"
            :placeholder="item.placeholder"
            @input="onInput($event, index)"
        />
    </div>
</template>

<script>

    import InputMultipleMixin from "mixins/InputMultipleMixin";
    import VCheckbox from "components/controls/VCheckbox";

    export default {
        name : "VCheckboxMulti",
        components : {
            VCheckbox,
        },
        mixins     : [InputMultipleMixin],
    }
</script>