<template>
    <div>
        <v-checkbox-multi
            v-if="multiple"
            :values="value"
            @input="onInput"
        />
        <v-checkbox
            v-else
            :checked="value.value"
            :placeholder="value.placeholder"
            @input="onInput"
        />
    </div>
</template>

<script>
    import VCheckbox from "components/controls/VCheckbox";
    import VCheckboxMulti from "components/controls/VCheckboxMulti";
    import IPropertyMixin from "mixins/IPropertyMixin";

    export default {
        name       : "ICheckbox",
        components : {
            VCheckbox,
            VCheckboxMulti,
        },
        mixins     : [IPropertyMixin],
    };
</script>