<template>
    <div class="search-input-wrap">
        <input
            type="search"
            :value="value"
            :class="inputClassWrapper"
            placeholder="Найти"
            @input="onInput"
        />
        <button
            class="search-input-clear"
            @click="onClearClick"
        />
    </div>
</template>

<script>
export default {
    name       : "VInputSearch",
    components : {
    },
    props      : {
        value : {
            type    : String,
            default : '',
        },
    },
    model      : {
        event : 'input',
        prop  : 'value',
    },
    computed   : {
        inputClassWrapper() {
            return {
                'search-input' : true,
                'has-val'      : this.value,
            };
        },
    },
    methods    : {
        onInput(e) {
            this.$emit('input', e.target.value);
        },
        onClearClick(e) {
            e.preventDefault();
            this.$emit('input', '');
        }
    }
};
</script>