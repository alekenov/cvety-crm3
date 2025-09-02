<template>
    <div
        class="input-label-transform__input-container"
        tabindex="1"
        @focus="onFocus"
        @blur="onBlur"
    >
        <div
            class="input-tags-list"
            style="min-height: 34px;"
        >
            <div
                v-for="option in selectedOptions"
                class="input-tag"
                :key="option.id"
            >
                {{option.name}}
                <span
                    class="form-group__item-remove-icon purple"
                    @click="onChange(option)"
                ></span>
            </div>
        </div>
        <label :class="labelClassWrapper">Цвета букета</label>
        <div :class="inputClassWrapper"></div>

        <div class="flower-color-check-grid" v-show="isFocused">
            <label
                v-for="option in options"
                :class="optionClassWrapper(option)"
                :style="optionStyleWrapper(option)"
                :key="option.id"
            >
                <input
                    type="checkbox"
                    name="color"
                    :value="option.id"
                    :checked="isSelected(option)"
                    @change="onChange(option)"
                >
                <div :class="fakerClassWrapper(option)"></div>
            </label>
        </div>
    </div>
</template>

<script>
import {simpleClone} from "@/services/Utils";

export default {
    name     : "VSelectColor",
    props    : {
        options : {
            type    : Array,
            default : () => [],
        },
        value   : {
            type : Array,
            default: () => [],
        },
    },
    model    : {
        prop  : 'value',
        event : 'select',
    },
    data() {
        return {
            isFocused : false,
        };
    },
    computed : {
        hasTags() {
            return !!this.value?.length;
        },
        labelClassWrapper() {
            return {
                'has-tag'                      : this.hasTags || this.isFocused,
                'input-label-transform__label' : true,
            };
        },
        inputClassWrapper() {
            return {
                'input-tags-list-border' : true,
                'active'                 : this.hasTags,
            };
        },
        selectedOptions() {
            return this.options.filter(option => this.isSelected(option));
        },
    },
    methods  : {
        optionStyleWrapper(option) {
            const isMix   = this.isMixColor(option);
            const isWhite = this.isWhiteColor(option);

            return {
                backgroundColor : isMix ? false : '#' + option.color,
                border          : isWhite ? '1px solid #e4e4e4' : false,
            };
        },
        optionClassWrapper(option) {
            return {
                'flower-color-check-grid__item'               : true,
                'flower-color-check-grid__item--multicolored' : this.isMixColor(option),
            };
        },
        fakerClassWrapper(option) {
            return {
                'flower-color-check-grid__item-faker'        : true,
                'flower-color-check-grid__item-faker--white' : this.isPurpleColor(option),
            };
        },
        isWhiteColor(option) {
            return option.id === 26;
        },
        isPurpleColor(option) {
            return option.id === 24;
        },
        isMixColor(option) {
            return option.id === 17016;
        },
        onFocus() {
            this.isFocused = true;
        },
        onBlur() {
            this.isFocused = false;
        },
        isSelected({id}) {
            return this.value.includes(id);
        },
        onChange({id}) {
            let value = simpleClone(this.value);
            // let value = this.value;

            if (this.isSelected({id})) {
                let index = value.indexOf(id);

                value.splice(index, 1);
            }
            else {
                value.push(id);
            }

            this.emitSelect(value);

            this.$el.focus();
        },
        emitSelect(value) {
            this.$emit('select', value);
        },
    },
}
</script>