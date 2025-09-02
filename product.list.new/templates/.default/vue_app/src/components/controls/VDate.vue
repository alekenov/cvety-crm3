<template>
    <date-picker
        value-type="format"
        :value="value"
        :lang="'ru'"
        :format="format"
        :first-day-of-week="1"
        :placeholder="placeholder"
        :editable="false"
        @input="onInput"
    ></date-picker>
</template>

<script>
    import DatePicker from 'vue2-datepicker';
    import 'vue2-datepicker/index.css';
    import 'vue2-datepicker/locale/ru';

    export default {
        name       : "VDate",
        components : {
            DatePicker,
        },
        props      : {
            placeholder : {
                type    : String,
                default : ''
            },
            value       : {
                type    : String,
                default : '',
            },
        },
        model      : {
            prop  : 'value',
            event : 'input',
        },
        data() {
            return {
                format : 'YYYY-MM-DD'
            };
        },
        methods    : {
            onInput(date) {
                this.$emit('input', date);
            },
        }
    }
</script>