<template>
    <div class="checkbox">
        <label>
            <input
                type="checkbox"
                :checked="checked"
                @input="onInput"
            >
            <span class="checkbox__check"></span>
            <span class="form-group__label">{{placeholder}}</span>
        </label>
    </div>
</template>

<script>
    export default {
        name    : "VCheckbox",
        props   : {
            checked     : {
                type    : Boolean,
                default : false,
            },
            placeholder : {
                type    : String,
                default : '',
            },
        },
        model   : {
            prop  : 'checked',
            event : 'input',
        },
        methods : {
            onInput(e) {
                this.$emit('input', e.target.checked);
            },
        },
    }
</script>