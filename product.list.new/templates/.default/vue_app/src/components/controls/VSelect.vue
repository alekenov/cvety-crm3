<template>
    <multiselect
        label="name"
        track-by="name"
        :options="options"
        :value="selectedOption"
        :placeholder="placeholder"
        :searchable="searchable"
        :multiple="multiple"
        :close-on-select="closeOnSelect"
        :hide-selected="multiple"
        :select-label="''"
        :deselect-label="''"
        :option-height="104"
        :show-labels="false"
        :allow-empty="true"
        :class="{'multiselect__simple-container': !multiple, 'multiselect__multiple-container': multiple}"
        @select="onSelect"
        @remove="onRemove"
        @open="$emit('open')"
        @close="$emit('close')"
    >
        <template slot="placeholder">
            <div class="multiselect__placeholder-custom">{{placeholder}}</div>
        </template>
        <template slot="singleLabel" slot-scope="props">
            <div class="single-container">
                {{props.option.name}}
            </div>
        </template>
        <template slot="option" slot-scope="props">
            <div class="single-container">
                {{props.option.name}}
            </div>
        </template>
        <template slot="noResult">
            Не найдено совпадений
        </template>
        <template slot="noOptions">
            Список пуст
        </template>
        <template slot="tag" slot-scope="{option, search, remove}">
            <div class="input-tag">
                {{option.name}}
                <span class="form-group__item-remove-icon purple" @click="remove(option)"></span>
            </div>
        </template>
    </multiselect>
</template>

<script>
    import Multiselect from 'vue-multiselect';
    import 'vue-multiselect/dist/vue-multiselect.min.css';
    import {isArray, isNumber, isString} from "services/Utils";

    export default {
        name       : "VSelect",
        components : {
            Multiselect,
        },
        props      : {
            options       : {
                type    : Array,
                default : () => [],
            },
            value         : {
                type : [
                    Number,
                    String,
                    Boolean,
                    Array,
                ],
            },
            placeholder   : {
                type    : String,
                default : 'Выберите значение'
            },
            multiple      : {
                type    : Boolean,
                default : false,
            },
            searchable    : {
                type    : Boolean,
                default : false,
            },
            closeOnSelect : {
                type    : Boolean,
                default : true,
            },
        },
        model      : {
            prop  : 'value',
            event : 'select',
        },
        computed   : {
            selected() {
                if (this.multiple) {
                    if (isArray(this.value) === false) {
                        return [];
                    }

                    return this.value;
                }
                else {
                    if (isNumber(this.value) || isString(this.value)) {
                        return this.value;
                    }

                    return 0;
                }
            },
            selectedOption() {
                if (this.multiple) {
                    return this.options.filter((option) => this.selected.includes(option.id));
                }
                else {
                    return this.options.find((option) => this.selected === option.id);
                }
            },
        },
        methods    : {
            onSelect(selected) {
                let selectedId;
                if (this.multiple) {
                    selectedId = [selected.id, ...this.selected];
                }
                else {
                    selectedId = selected.id;
                }

                this.emitSelect(selectedId);
            },
            onRemove(option) {
                const newSelected = this.selected.filter((id) => id !== option.id);

                this.emitSelect(newSelected);
            },
            emitSelect(ids) {
                this.$emit('select', ids);
            }
        },
    };
</script>