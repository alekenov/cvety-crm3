<template>
    <select
        class="tender-select-native form-control input-sm"
        :disabled="disabled"
        @change="onChange"
    >
        <option selected disabled>-</option>
        <option
            v-for="(option, index) in options"
            :value="option.id"
            :selected="option.id == value"
            :key="index"
        >{{option.name}}</option>
    </select>
</template>

<script>
    export default {
        name    : "VSelectNative",
        props   : {
            options     : {
                type    : Array,
                default : () => []
            },
            value       : {
                type    : [Number, String],
                default : '0'
            },
            disabled: {
                type: Boolean,
                default: false,
            },
        },
        model   : {
            event : 'select',
            prop  : 'value',
        },
        methods : {
            onChange(e) {
                let value = e.target.value;
                let parsed = parseInt(value);

                if (!isNaN(parsed) && (parsed + '').length === value.length) {
                    value = parsed;
                }

                this.$emit('select', value);
            }
        },
    }
</script>