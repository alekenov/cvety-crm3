<template>
    <label class="switch">
        <input
            type="checkbox"
            class="switch-input"
            name="product-id"
            :checked="checked"
            @change="onChange"
        />
        <span :class="sliderClassWrapper"></span>
    </label>
</template>

<script>
export default {
    name  : "VSwitch",
    props : {
        checked : {
            type    : Boolean,
            default : false,
        },
        color: {
            type: String,
            validator(value) {
                return ['blue', 'base'].includes(value);
            },
            default: 'base',
        }
    },
    model : {
        event : 'change',
        prop  : 'checked',
    },
    computed: {
        sliderClassWrapper() {
            return {
                'switch-slider'        : true,
                'switch-slider--round' : true,
                'switch-slider--blue'  : this.color === 'blue',
            };
        },
    },
    methods: {
        onChange(e) {
            this.$emit('change', e.target.checked);
        }
    }
}
</script>