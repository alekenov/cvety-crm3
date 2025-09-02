<template>
    <div :class="containerClassWrapper">
        <input
            :value="value"
            :type="type"
            :min="min"
            :maxlength="maxlength"
            class="input-label-transform"
            :readonly="readonly"
            @input="onInput"
        >
        <label :class="labelClassWrapper">{{placeholder}}</label>
    </div>
</template>

<script>
export default {
    name     : "VInput",
    props    : {
        value       : {
            type    : [
                Number,
                String,
            ],
            default : '',
        },
        placeholder : {
            type    : String,
            default : ''
        },
        readonly    : {
            type    : Boolean,
            default : false,
        },
        type        : {
            type    : String,
            default : 'text',
            validator(value) {
                return [
                    'text',
                    'number',
                ].includes(value);
            }
        },
        min         : {
            type: [Number, Boolean],
            default: false,
        },
        maxlength: {
            type: [Number, String, Boolean],
            default: false,
        },
        error       : {
            type    : Boolean,
            default : false,
        }
    },
    model    : {
        prop  : 'value',
        event : 'input',
    },
    computed : {
        labelClassWrapper() {
            return {
                'input-label-transform__label'          : true,
                'input-label-transform__label--focused' : !this.isEmptyValue,
            };
        },
        containerClassWrapper() {
            return {
                'input-label-transform__input-container' : true,
                'error'                                  : this.error,
            };
        },
        isEmptyValue() {
            return (this.value + '').length === 0;
        },
    },
    methods  : {
        onInput(e) {
            let value = e.target.value;

            if (this.min && value < this.min) {
                value = this.value;
                e.target.value = value;
            }

            this.$emit('input', value);
        }
    }
}
</script>