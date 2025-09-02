<template>
    <div class="panel-form-row">
        <div :class="containerClassWrapper">
            <div class="dropdown-wrap">
                <input
                    :value="viewedValue"
                    type="text"
                    class="input-label-transform input-label-transform-ellipsis"
                    @blur="onBlur"
                    @focus="onFocus"
                    @input="onInput"
                >
                <label :class="labelClassWrapper">{{placeholder}}</label>
                <div :class="dropdownClassWrapper">
                    <div
                        class="dropdown-content__item"
                        v-for="option in filteredOptions"
                        :key="option.id"
                        @click="onSelect(option)"
                    >
                        <button class="dropdown-content__item-button">{{option.name}}</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name     : "VDropdown",
    props    : {
        options     : {
            type    : Array,
            default : () => [],
        },
        value       : {
            type : [
                Number,
                String
            ],
        },
        placeholder : {
            type    : String,
            default : '',
        },
        error       : {
            type    : String,
            default : '',
        },
    },
    model    : {
        prop  : 'value',
        event : 'select',
    },
    data() {
        return {
            search    : '',
            isFocused : false,
        };
    },
    computed : {
        isActive() {
            return true;
        },
        isSearch() {
            return this.search.length > 0;
        },
        viewedValue() {
            return this.isFocused
                ? this.search
                : this.selectedOption?.name || '';
        },
        selectedOption() {
            return this.options.find(option => option.id === this.value);
        },
        filteredOptions() {
            let options = [];

            if (this.isSearch) {
                options = this.options.filter(option => option.name.toLowerCase().indexOf(this.search.toLowerCase()) > -1);
            }

            return options;
        },
        dropdownClassWrapper() {
            return {
                'dropdown-content' : true,
                'active'           : this.filteredOptions.length,
            };
        },
        labelClassWrapper() {
            return {
                'input-label-transform__label'          : true,
                'input-label-transform__label--focused' : this.isSearch || this.value || this.isFocused,
            };
        },
        containerClassWrapper() {
            return {
                'error'                                  : this.error,
                'input-label-transform__input-container' : true,
            };
        },
    },
    methods  : {
        onFocus() {
            this.isFocused = true;
        },
        onBlur() {
            setTimeout(() => {
                this.isFocused = false;
                this.clearSearch();
            }, 500);
        },
        onInput(e) {
            this.search = e.target.value;
        },
        clearSearch() {
            this.search = '';
        },
        onSelect(item) {
            this.$emit('select', item.id);
        },
    },
}
</script>