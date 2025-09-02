export default {
    props   : {
        value : {
            type    : [
                String,
                Number,
            ],
            default : '',
        },
        placeholder : {
            type    : String,
            default : ''
        },
    },
    model   : {
        event : 'input',
        prop  : 'value',
    },
    methods : {
        onInput(e) {
            this.$emit('input', e.target.value);
        },
    },
};