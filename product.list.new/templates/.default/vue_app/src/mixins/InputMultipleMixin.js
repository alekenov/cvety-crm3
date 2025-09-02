export default {
    props   : {
        values : {
            type    : Array,
            default : () => [],
        },
    },
    model   : {
        prop  : 'values',
        event : 'input',
    },
    methods : {
        onInput(value, index) {
            let clonedValues = Object.assign([], this.values);

            clonedValues[index] = value;

            this.$emit('input', clonedValues);
        },
    },
}