<template>
    <div>
        <v-input-multi
            v-if="multiple"
            :values="value"
            @input="onInput"
        />
        <v-input
            v-else
            :value="value"
            :type="type"
            :placeholder="placeholder"
            @input="onInput"
        />
        <v-button
            v-if="multiple"
            @click="addMultiValue"
        >Добавить</v-button>
    </div>
</template>

<script>
    import VInput from "components/controlsv2/VInput";
    import VInputMulti from "components/controls/VInputMulti";
    import VButton from "components/controls/VButton";
    import IPropertyMixin from "mixins/IPropertyMixin";

    export default {
        name       : "IInput",
        components : {
            VInput,
            VInputMulti,
            VButton,
        },
        mixins     : [IPropertyMixin],
        props      : {
            placeholder: {
                type: String,
                default: '',
            },
            type: {
                type: String,
                default: 'text',
            },
        },
    }
</script>