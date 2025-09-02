<template>
    <div>
        <v-textarea-multi
            v-if="multiple"
            :values="value"
            @input="onInput"
        />
        <v-textarea
            v-else
            :value="value"
            @input="onInput"
        />
        <v-button
            v-if="multiple"
            @click="addMultiValue"
        >Добавить</v-button>
    </div>
</template>

<script>
    import VButton from "components/controls/VButton";
    import VTextareaMulti from "components/controls/VTextareaMulti";
    import VTextarea from "components/controls/VTextarea";
    import IPropertyMixin from "mixins/IPropertyMixin";

    export default {
        name       : "IText",
        components : {
            VButton,
            VTextarea,
            VTextareaMulti,
        },
        mixins     : [IPropertyMixin],
    }
</script>