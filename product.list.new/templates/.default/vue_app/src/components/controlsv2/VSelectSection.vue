<template>
    <div class="panel-form-step">
        <div class="panel__top">
            <h2 class="panel__title">Выберите категорию</h2>
        </div>

        <div class="panel__content panel__content--padded-bottom">
            <div class="search-input-wrap search-input-wrap--panel search-input-wrap--fw">
                <input
                    v-model="search"
                    type="search"
                    placeholder="Найти"
                    class="search-input"
                >
            </div>

            <div
                v-if="isSearchMode"
                class="panel-categories-search-result"
            >
                <label
                    v-for="item in searchedSections"
                    class="panel-categories-search-result-item"
                    :key="item.id"
                    @click="onSelect(item)"
                >
                    <div class="panel-categories-search-result-item__text">{{item.name}}</div>
                    <div class="panel-categories-search-result-item__category">{{item.parentName}}</div>
                </label>
            </div>

            <div
                v-else
                class="panel-categories-options"
            >

                <div class="panel-popular-categories">
                    <div
                        class="panel-popular-categories-item"
                        v-for="section in popularSections"
                        :key="section.id"
                        @click="onSelect(section)"
                    >{{section.name}}</div>
                </div>

                <div
                    class="panel-categories-options-item"
                    v-for="(item, index) in grouped" :key="index"
                >
                    <div
                        class="panel-categories-options-title"
                        :class="{active: isSectionActive(index)}"
                        @click="onSectionClick(item)"
                    >
                        <div class="panel-categories-options-title__icon">
                            <img
                                v-if="item.image"
                                :src="item.image"
                            >
                        </div>
                        <div
                            class="panel-categories-options-title__text"
                        >{{item.name}}</div>

                        <div
                            v-if="item.items.length"
                            class="panel-categories-options-title__dropdown-wrap"
                            style="width: 12px;height: 12px;"
                            @click.stop="toggleSection(index)"
                        >
                            <img src="/local/templates/cvety.crm/images/chevron-down-grey.svg" alt="">
                        </div>
                    </div>

                    <div
                        class="panel-categories-options-body js-slidetoggle-content slidetoggle-content"
                        :style="{display: isSectionActive(index) ? 'block': 'none'}"
                    >
                        <label
                            class="panel-categories-options-body__item"
                            v-for="subItem in item.items"
                            :key="subItem.id"
                            @click.stop="onSelect(subItem)"
                        >
                            {{subItem.name}}
                        </label>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {mapGetters} from "vuex";

export default {
    name : "VSelectSection",
    props: {
        sections: {
            type: Array,
            default: () => [],
        },
        grouped: {
            type: Array,
            default: () => [],
        },
        value: {
            type: [Number, String],
            default: 0,
        },
    },
    model: {
        prop: 'value',
        event: 'select',
    },
    data() {
        return {
            search: "",
            activeSections: [],
        };
    },
    computed: {
        ...mapGetters([
            'sectionsMap',
            'popularSections',
        ]),
        isSearchMode() {
            return this.search.length > 0;
        },
        preparedSections() {
            return this.sections.map((item) => {
                const parent = this.sectionsMap[item.parentId] || {};

                return {
                    id         : item.id,
                    name       : item.name,
                    parentName : parent?.name || '',
                };
            });
        },
        searchedSections() {
            const search = this.search.toLowerCase();

            return this.preparedSections.filter(item => {
                return item.name.toLowerCase().indexOf(search) > -1
                    || item.parentName.toLowerCase().indexOf(search) > -1;
            });
        },
    },
    methods: {
        toggleSection(sectionIndex) {
            if (this.isSectionActive(sectionIndex)) {
                let index = this.activeSections.indexOf(sectionIndex);
                this.activeSections.splice(index, 1);
            }
            else {
                this.activeSections.push(sectionIndex);
            }
        },
        isSectionActive(index) {
            return this.activeSections.includes(index);
        },
        canBeToggled(item) {
            return item.depthLevel === 1 && item.items.length > 0;
        },
        onSectionClick(item) {
            if (this.canBeToggled(item)) {
                const sectionIndex = this.grouped.findIndex(i => i.id === item.id);

                this.toggleSection(sectionIndex);
            }
            else {
                this.onSelect(item);
            }
        },
        onSelect(item) {
            this.$emit('select', item.id);
        }
    },
}
</script>