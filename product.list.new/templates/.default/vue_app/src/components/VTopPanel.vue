<template>
    <div
        class="page__search"
        :style="containerStyleWrapper"
        :class="containerClassWrapper"
        ref="pageSearch"
    >
        <div class="page-search-content" ref="pageSearchContent">
            <v-input-search
                :value="prevFilter.search"
                @input="onInputSearch"
            />

            <div class="search-filters-wrap">
                <v-select-search
                    v-if="isAdmin"
                    :value="prevFilter.shopId"
                    :options="shops"
                    @select="onSelectShop"
                />
                <v-filter
                    :sections="sections"
                    :section-ids="prevFilter.sectionIds"
                    :in-stock="prevFilter.inStock"
                    @select-section="onSelectSection"
                    @change-in-stock="onChangeInStock"
                    @reset="onReset"
                />
            </div>
        </div>
    </div>
</template>

<script>
import VInputSearch from "@/components/controls/VInputSearch";
import VSelectSearch from "@/components/controls/VSelectSearch";
import {pos, simpleClone} from "@/services/Utils";
import VFilter from "@/components/VFilter";

export default {
    name       : "VTopPanel",
    components : {
        VFilter,
        VSelectSearch,
        VInputSearch,
    },
    props      : {
        filter      : {
            type    : Object,
            default : () => ({
                search     : '',
                shopId     : 0,
                sectionIds : [],
                inStock    : true,
            })
        },
        delay : {
            type    : Number,
            default : 700,
        },
        shops       : {
            type    : Array,
            default : () => [],
        },
        sections    : {
            type    : Array,
            default : () => [],
        },
        isAdmin     : {
            type    : Boolean,
            default : false,
        },
    },
    data() {
        return {
            timer         : null,
            lastScrollTop : 0,
            minHeight     : 88,
            isScrollUp    : false,
            prevFilter    : simpleClone(this.filter),
        };
    },
    computed: {
        containerStyleWrapper() {
            return {
                minHeight: this.minHeight
            };
        },
        containerClassWrapper() {
            return {
                'scroll-up': this.isScrollUp,
            };
        },
    },
    methods    : {
        setDelay(key, value) {
            if (this.timer) {
                clearTimeout(this.timer);
            }

            this.setPrevFilter(key, value);

            this.timer = setTimeout(() => {
                this.timer = null;
                this.setFilter(this.prevFilter);
            }, this.delay);
        },
        setPrevFilter(key, value) {
            if (!this.prevFilter) {
                this.prevFilter = simpleClone(this.filter);
            }
            this.prevFilter[key] = value;
        },
        setFilter(filter) {
            this.$emit('set-filter', filter);
        },
        onInputSearch(value) {
            this.setDelay('search', value);
        },
        onSelectShop(shopId) {
            this.setPrevFilter('shopId', shopId);
            this.setFilter(this.prevFilter);
        },
        onSelectSection(sectionIds) {
            this.setDelay('sectionIds', sectionIds);
        },
        onChangeInStock(checked) {
            this.setDelay('inStock', checked);
        },
        onReset() {
            if(this.timer) {
                clearTimeout(this.timer);
                this.timer = null;
            }

            this.setPrevFilter('inStock', true);
            this.setPrevFilter('sectionIds', []);

            this.setFilter(this.prevFilter);
        },
        handleHeaderScroll() {
            if (window.innerWidth < 767) {
                const currentScroll = window.scrollY;

                const headerWrap = pos(this.$refs.pageSearch);

                const contentWrap = pos(this.$refs.pageSearchContent);

                this.minHeight = contentWrap.height;

                if (currentScroll < headerWrap.top + headerWrap.height + 20) {
                    this.isScrollUp = false;

                    return;
                }

                this.isScrollUp = this.lastScrollTop > currentScroll;

                this.lastScrollTop = currentScroll;
            }
        }
    },
    mounted() {
        document.addEventListener('scroll', this.handleHeaderScroll.bind(this), {passive: true});
    },
    beforeDestroy() {
        document.removeEventListener('scroll', this.handleHeaderScroll.bind(this));
    },
    watch: {
        filter: {
            type: 'deep',
            handler() {
                this.prevFilter = simpleClone(this.filter);
            }
        }
    }
}
</script>