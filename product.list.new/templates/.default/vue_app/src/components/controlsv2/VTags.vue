<template>
    <div class="tags-list-form-row">
        <div class="tags-list-title">{{placeholder}}</div>
        <div class="input-tags-list">
            <label
                v-for="option in options"
                class="input-tag-choice"
                :key="option.id"
            >
                <input
                    type="checkbox"
                    name="some_name"
                    :value="option.id"
                    :checked="isChecked(option)"
                    @change="onChange(option)"
                >
                <span class="input-tag-choice__text">{{option.name}}</span>
            </label>
        </div>
    </div>
</template>

<script>
export default {
    name    : "VTags",
    props   : {
        options     : {
            type    : Array,
            default : () => [],
        },
        value       : {
            type    : Array,
            default : () => [],
        },
        placeholder : {
            type    : String,
            default : '',
        },
    },
    model   : {
        prop  : 'value',
        event : 'select',
    },
    methods : {
        isChecked(option) {
            return this.value.includes(option.id);
        },
        onChange(option) {
            let value;

            if (this.isChecked(option)) {
                value = this.value.filter(id => id !== option.id);
            }
            else {
                value = [...this.value, option.id];
            }

            this.emitSelect(value);
        },
        emitSelect(value) {
            this.$emit('select', value);
        },
    },
}
</script>