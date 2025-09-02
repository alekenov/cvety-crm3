<template>
    <v-select
        :value="value"
        :options="options"
        :multiple="multiple"
        :placeholder="placeholder"
        :close-on-select="!multiple"
        :searchable="multiple"
        :type="type"
        @select="onSelect"
    />
</template>

<script>
    import VSelect from "components/controlsv2/VSelect";

    export default {
        name       : "IList",
        components : {
            VSelect,
        },
        props      : {
            multiple    : {
                type    : Boolean,
                default : false,
            },
            options     : {
                type    : Array,
                default : () => [],
            },
            value       : {
                type : [
                    Array,
                    String,
                ],
            },
            placeholder : {
                type    : String,
                default : '',
            },
            type          : {
                type    : String,
                default : 'base',
            },
        },
        model      : {
            prop  : 'value',
            event : 'input',
        },
        methods    : {
            onSelect(value) {
                this.$emit('input', value);
            },
        },
    };
</script>