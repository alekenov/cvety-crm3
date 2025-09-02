<template>
    <div class="form-half-ctn">
        <v-input
            :value="valueView"
            :type="'number'"
            :placeholder="'Время приготовления'"
            @input="onInput"
        />
        <v-select
            v-model="selectedOptionId"
            :options="options"
            @select="onSelect"
        />
    </div>
</template>

<script>
import VInput from "components/controlsv2/VInput";
import VSelectNative from "components/controlsv2/VSelectNative";

const MIN  = 'M';
const HOUR = 'H';
const DAY  = 'D';

export default {
    name : "VProductionMinutes",
    components : {
        VSelect: VSelectNative,
        VInput,
    },
    props: {
        value: {
            type: [String, Number],
        },
    },
    data() {
        return {
            selectedOptionId: '',
            cacheOptionIds: [],
        };
    },
    model: {
        event: 'input',
        prop: 'value',
    },
    computed: {
        options() {
            return [
                {id: MIN,  name: 'мин.'},
                {id: HOUR, name: 'ч.'},
                {id: DAY,  name: 'дн.'},
            ];
        },
        rates() {
            return {
                [MIN]  : 1,
                [HOUR] : 60,
                [DAY]  : 1440,
            };
        },
        valueView() {
            return this.value / this.rateValue;
        },
        rateValue() {
            return this.rates[this.selectedOptionId];
        },
        prevRateValue() {
            return this.rates[this.prevOptionId];
        },
        prevOptionId() {
            return this.cacheOptionIds[1];
        }
    },
    methods: {
        onInput(value) {
            this.$emit('input', value * this.rateValue);
        },
        onSelect() {
            this.prependOptionId(this.selectedOptionId);

            this.$emit('input', this.value * this.rateValue / this.prevRateValue);
        },
        getSelectedOptionId(value) {
            if (!value) {
                return MIN;
            }
            if (value % this.rates[DAY] === 0) {
                return DAY;
            }
            if (value % this.rates[HOUR] === 0) {
                return HOUR;
            }

            return MIN;
        },
        prependOptionId(id) {
            this.cacheOptionIds.splice(0, 0, id);

            if (this.cacheOptionIds.length > 2) {
                this.cacheOptionIds.splice(2, 1);
            }
        }
    },
    mounted() {
        this.selectedOptionId = this.getSelectedOptionId(this.value);

        this.prependOptionId(this.selectedOptionId);
        this.prependOptionId(this.selectedOptionId);
    },
}
</script>