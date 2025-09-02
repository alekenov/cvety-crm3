export default {
    props: {
        multiple: {
            type: Boolean,
            default: false,
        },
        value: {
            type: [Array, String],
        },
    },
    model      : {
        prop  : 'value',
        event : 'input',
    },
    methods    : {
        onInput(value) {
            this.emitInput(value);
        },
        addMultiValue() {
            let clonedValues = Object.assign([], this.value);
            clonedValues.push('');

            this.emitInput(clonedValues);
        },
        emitInput(value) {
            this.$emit('input', value);
        },
    },
};