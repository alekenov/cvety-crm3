<template>
    <div class="panel-form-group">
        <div class="panel__subtitle">Состав букета</div>

        <div
            class="panel-form-row add-flower-row-wrap"
            v-for="(item, index) in value"
            :key="index"
        >
            <div class="add-flower-item">
                <v-dropdown
                    :error="isError(index, 'id')"
                    :value="item.id"
                    :options="optionsFiltered"
                    :placeholder="'Название цветка'"
                    @select="onSelect({id: $event, index})"
                />
            </div>
            <div class="add-flower-item">
                <v-input
                    :error="isError(index, 'amount')"
                    :value="item.amount"
                    :type="'number'"
                    :placeholder="'Количество, шт'"
                    @input="onInput({amount: $event, index})"
                />
            </div>
            <div
                v-if="canRemove"
                class="form-group add-flower-item--clear"
                @click="onRemove(index)"
            >
                <button class="clear-button-defaults add-flower-item-clear-btn js-add-flower-item-clear-btn"></button>
            </div>
        </div>
        <div class="panel-form-row"></div>

        <button
            class="btn btn_wide btn_bordered js-add-flower"
            type="button"
            @click="addRow"
        >
            <svg width="22" height="22" viewBox="0 0 22 22" style="margin-right: 5px;" fill-rule="evenodd" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" fill="232325" clip-rule="evenodd" d="M12 0H9.99998V9.99996H0V12H9.99998V22H12V12H22V9.99996H12V0Z"></path>
            </svg> Добавить цветок
        </button>
    </div>
</template>

<script>

import VDropdown from "@/components/controlsv2/VDropdown";
import VInput from "@/components/controlsv2/VInput";
import {simpleClone} from "@/services/Utils";

export default {
    name       : "VConsist",
    components : {
        VInput,
        VDropdown,
    },
    props      : {
        options: {
            type: Array,
            default: () => [],
        },
        value: {
            type: Array,
            default: () => [],
        }
    },
    model      : {
        prop  : 'value',
        event : 'change',
    },
    data() {
        return {
            errors: {},
        };
    },
    computed   : {
        optionsMap() {
            return this.options.reduce((carry, item) => {
                carry[item.id] = item;

                return carry;
            }, {});
        },
        optionsFiltered() {
            return this.options.map(item => {
                item = simpleClone(item);
                item.isDisabled = this.selectedIds.includes(item.id);

                return item;
            });
        },
        selectedIds() {
            return this.value.map(item => item.id).filter(id => id > 0);
        },
        hasErrors() {
            return Object.values(this.errors).some(item => item.id || item.amount);
        },
        canRemove() {
            return this.value.length > 1;
        },
    },
    methods    : {
        addRow() {
            const value = [...this.value, {id: '', name: '', amount: '1'}];

            this.emitChange(value);
        },
        emitChange(value) {
            this.$emit('change', value);
        },
        onSelect({id, index}) {
            this.clearError(index, 'id');

            const option = this.optionsMap[id];

            let value = simpleClone(this.value);
            value[index].id = id;
            value[index].name = option.name;

            this.emitChange(value);
        },
        onInput({amount, index}) {
            this.clearError(index, 'amount');

            let value = simpleClone(this.value);

            value[index].amount = amount;

            this.emitChange(value);
        },
        onRemove(index) {
            this.clearError(index, 'id');
            this.clearError(index, 'amount');

            let value = simpleClone(this.value);

            value.splice(index, 1);

            const hasErrors = this.hasErrors;
            this.clearErrors();

            if (hasErrors) {
                this.validate();
            }

            this.emitChange(value);
        },
        validate() {
            this.value.forEach((item, index) => {
                this.setError(index, 'id', !item.id);
                this.setError(index, 'amount', !item.amount);
            });

            return !this.hasErrors;
        },
        clearError(index, key) {
            this.setError(index, key, false);
        },
        clearErrors() {
            this.errors = {};
        },
        setError(index, key, isError) {
            if (!this.errors[index]) {
                this.$set(this.errors, index, {});
            }
            this.$set(this.errors[index], key, isError);
        },
        isError(index, key) {
            return this.errors[index] && this.errors[index][key];
        }
    },
    created() {
        if (!this.value?.length) {
            this.addRow();
        }
    }
}
</script>