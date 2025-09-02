<template>
    <div class="search-filter-item">
        <div
            class="search-filter-btn search-filter-btn--filter"
            :class="{active: isActive}"
            @click="showPopup"
        >
            <span class="search-filter-btn-text">Фильтры</span>
            <div class="with-val-label"></div>
        </div>

        <div
            class="search-filter-dropdown"
            :class="{active: isActive}"
        >
            <div class="search-filter-dropdown__header">
                <div class="search-filter-dropdown-aside">
                    <div class="search-filter-dropdown__header-close" @click="hidePopup()">
                        <div class="cross-btn"></div>
                    </div>
                </div>
                <div class="search-filter-dropdown-title">Фильтры</div>
                <div class="search-filter-dropdown-aside search-filter-dropdown-clear">
                    <a href="javascript:void(0)" @click="onReset">Сбросить</a>
                </div>
            </div>
            <div class="search-filter-dropdown__body">
                <v-checkbox-multi-new
                    :value="sectionIds"
                    :options="sections"
                    :title="'Тип товара'"
                    @select="onSelectSection"
                />

                <div class="search-filter-dropdown__body-row">
                    <div class="search-filter-dropdown__body-row-title">Наличие</div>
                    <div class="search-filter-dropdown-form-row">
                        <div class="search-filter-dropdown-form-row__text">Показать товары в наличии</div>
                        <div class="search-filter-dropdown-form-row__choice">
                            <v-switch
                                :checked="inStock"
                                :color="'blue'"
                                @change="onChangeInStock"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import VCheckboxMultiNew from "@/components/controls/VCheckboxMultiNew";
import VSwitch from "@/components/controls/VSwitch";
export default {
    name : "VFilter",
    components : {
        VSwitch,
        VCheckboxMultiNew
    },
    props : {
        sections   : {
            type    : Array,
            default : () => [],
        },
        sectionIds : {
            type    : Array,
            default : () => [],
        },
        inStock    : {
            type    : Boolean,
            default : true,
        }
    },
    data() {
        return {
            isActive : false,
        };
    },
    methods: {
        onSelectSection(values) {
            this.$emit('select-section', values);
        },
        onReset() {
            this.$emit('reset');
            this.hidePopup();
        },
        onChangeInStock(checked) {
            this.$emit('change-in-stock', checked);
        },
        showPopup() {
            this.isActive = true;
        },
        isChildren(parent, child) {
            return parent === window.BX.findParent(child, {className: 'search-filter-item'}, true)
        },
        hidePopup(e) {
            if (e?.target && this.isChildren(this.$el, e.target)) {
                return;
            }

            this.isActive = false;
        },
    },
    mounted() {
        document.addEventListener('click', this.hidePopup.bind(this), {passive: true});
    },
    beforeDestroy() {
        document.removeEventListener('click', this.hidePopup.bind(this));
    }
}
</script>