<template>
    <div class="pagenavigation" v-if="pageNav.total > 1">
        <span
            class="pagenav-item"
            v-for="page in pages"
            :key="page"
            :class="{active: isActivePage(page)}"
            @click="change(page)"
        >
            {{page}}
        </span>
    </div>
</template>

<script>
    // @emit change(pageNumber, navNum)
    import PageNav from "models/PageNav";

    export default {
        name : "Pagination",
        props: {
            range: {
                type: Number,
                default: 2
            },
            pageNav: {
                type: PageNav,
                required: true
            }
        },
        computed: {
            rangeStart() {
                const start = this.pageNav.offset - this.range;

                return (start > 0) ? start : 1;
            },
            rangeEnd() {
                const end = this.pageNav.offset + this.range;

                return (end < this.pageNav.total) ? end : this.pageNav.total;
            },
            pages() {
                let pages = [];

                for(let i = this.rangeStart; i <= this.rangeEnd; i++) {
                    pages.push(i);
                }

                return pages;
            }
        },
        methods: {
            change(pageNumber) {
                if (pageNumber === this.pageNav.offset) {
                    return false;
                }

                this.$emit('change', pageNumber, this.pageNav.navNum);
            },
            isActivePage(pageNumber) {
                return pageNumber === this.pageNav.offset;
            }
        }
    }
</script>