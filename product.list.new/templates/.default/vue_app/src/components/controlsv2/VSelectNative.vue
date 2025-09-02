<template>
    <select
        class="cvety-select-native"
        :disabled="disabled"
        @change="onChange"
        @focus="$emit('focus')"
        @blur="$emit('blur')"
    >
        <option selected disabled hidden></option>
        <option
            v-for="(option, index) in options"
            :value="option.id"
            :selected="isSelected(option)"
            :disabled="isDisabled(option)"
            :key="index"
        >{{option.name}}</option>
    </select>
</template>

<script>
export default {
    name     : "VSelectNative",
    props    : {
        options     : {
            type    : Array,
            default : () => []
        },
        value       : {
            type    : [
                Number,
                String
            ],
            default : '0'
        },
        disabled    : {
            type    : Boolean,
            default : false,
        },
        placeholder : {
            type    : String,
            default : '',
        },
    },
    model    : {
        event : 'select',
        prop  : 'value',
    },
    methods  : {
        isSelected(option) {
            return option.id == this.value;
        },
        isDisabled(option) {
            return option?.isDisabled === true;
        },
        onChange(e) {
            let value  = e.target.value;
            let parsed = parseInt(value);

            if (!isNaN(parsed) && (parsed + '').length === value.length) {
                value = parsed;
            }

            this.$emit('select', value);
        },
    },
}
</script>