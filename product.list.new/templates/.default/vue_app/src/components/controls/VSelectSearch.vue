<template>
    <div class="search-filter-item">
        <div
            class="search-filter-btn search-filter-btn--shop"
            :class="{active: isActive}"
            @click="showOptions"
        >
            <span class="search-filter-btn-text" v-if="value">{{prePlaceholder}} {{selectedName}}</span>
            <span class="search-filter-btn-text" v-else>{{popupTitle}}</span>
        </div>
        <div
            class="search-filter-dropdown"
            :class="{active: isActive}"
        >
            <div class="search-filter-dropdown__header">
                <div class="search-filter-dropdown-aside">
                    <div class="search-filter-dropdown__header-close">
                        <div class="cross-btn" @click="hideOptions()"></div>
                    </div>
                </div>
                <div class="search-filter-dropdown-title">{{popupTitle}}</div>
            </div>
            <div class="search-filter-dropdown__body" style="overflow: hidden">
                <div class="search-filter-dropdown__body-row">
                    <div class="search-filter-dropdown-search">
                        <v-input-search
                            v-model="search"
                        />
                    </div>
                    <ul class="search-filter-dropdown-shop-list">
                        <li
                            v-for="option in visibleOptions"
                            class="search-filter-dropdown-shop-list-item"
                            :class="{active: isSelected(option)}"
                            :key="option.id"
                            @click="onSelect(option)"
                        >
                            <span>{{option.name}}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import VInputSearch from "@/components/controls/VInputSearch";

export default {
    name       : "VSelectSearch",
    components : {
        VInputSearch,
    },
    props      : {
        value          : {
            type    : Number,
            default : 0,
        },
        options        : {
            type    : Array,
            default : () => []
        },
        popupTitle     : {
            type    : String,
            default : 'Выберите магазин',
        },
        prePlaceholder : {
            type    : String,
            default : 'Магазин',
        }
    },
    model      : {
        prop  : 'value',
        event : 'select',
    },
    data() {
        return {
            search   : '',
            isActive : false,
        };
    },
    computed   : {
        visibleOptions() {
            const search = this.search.toLowerCase();

            if (search.length === 0) {
                return this.options;
            }

            return this.options.filter((option) => option.name.toLowerCase().indexOf(search) > -1);
        },
        selectedOption() {
            return this.options.find(({id}) => id === this.value);
        },
        selectedName() {
            return this.selectedOption?.name || '';
        },
    },
    methods    : {
        isSelected({id}) {
            return id === this.value;
        },
        showOptions() {
            this.isActive = true;
        },
        isChildren(parent, child) {
            return parent === window.BX.findParent(child, {className: 'search-filter-item'}, true)
        },
        hideOptions(e) {
            if (e?.target && this.isChildren(this.$el, e.target)) {
                return;
            }

            this.isActive = false;
            this.search = '';
        },
        onSelect(option) {
            this.$emit('select', option.id);
            this.hideOptions();
        },
    },
    mounted() {
        document.addEventListener('click', this.hideOptions.bind(this), {passive: true});
    },
    beforeDestroy() {
        document.removeEventListener('click', this.hideOptions.bind(this));
    }
}
</script>