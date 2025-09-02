<template>
    <div class="panel-wrapper" >
        <div
            class="panel"
            :class="{visible:isVisible()}"
            @click="overlayClickHandler"
            ref="panel"
        >
            <div class="panel-content">
                <div class="panel__inner" :style="panelInnerStyle">
                    <div class="panel__close new-close" @click="hidePanel"></div>
                    <component
                        :is="currentComponent"
                        v-if="isVisible()"
                    ></component>
                </div>
            </div>
        </div>
        <div class="panel__overlay" @click="hidePanel"></div>
    </div>
</template>

<script>
    import {mapState, mapMutations, mapActions} from 'vuex';
    import ProductAdd from "@/components/ProductAdd";
    import ProductEdit from "@/components/ProductEdit";
    import ProductUnion from "@/components/ProductUnion";
    import ProductOfferList from "@/components/ProductOfferList";
    import ProductOfferAdd from "@/components/ProductOfferAdd";
    import ProductOfferAddNew from "@/components/ProductOfferAddNew";
    import ProductOfferEditNew from "@/components/ProductOfferEditNew";
    import ProductAdditionalAdd from "@/components/ProductAdditionalAdd";
    import ProductAdditionalEdit from "@/components/ProductAdditionalEdit";
    import ProductOfferEdit from "@/components/ProductOfferEdit";
    import ProductSimpleAdd from "@/components/ProductSimpleAdd";
    import ProductSimpleAddNew from "@/components/ProductSimpleAddNew";
    import {isIos} from "@/services/Utils";

    export default {
        name : "ProductSidePanel",
        components: {
            ProductAdd,
            ProductEdit,
            ProductUnion,
            ProductOfferList,
            ProductOfferAdd,
            ProductOfferAddNew,
            ProductOfferEditNew,
            ProductOfferEdit,
            ProductSimpleAdd,
            ProductSimpleAddNew,
            ProductAdditionalAdd,
            ProductAdditionalEdit,
        },
        provide() {
            return {
                hidePanel: this.hidePanel,
            }
        },
        data() {
            return {
                namespace: 'product-',
                isPanelVisible: false,
                panelInnerHeight: 0,
            };
        },
        computed: {
            ...mapState([
                'mode'
            ]),
            currentComponent() {
                return this.namespace + this.getMode();
            },
            panelInnerStyle() {
                let style = {};
                if (this.panelInnerHeight) {
                    style.height = this.panelInnerHeight + 'px';
                }

                return style;
            },
        },
        methods: {
            ...mapMutations([
                'setMode',
                'setDetail',
            ]),
            ...mapActions([
                'loadProducts',
            ]),
            showAddPanel() {
                this.setMode('add');
                this.showPanel();
            },
            showAddSimplePanel() {
                this.setMode('simple-add-new');
                this.showPanel();
            },
            showAdditionalAddPanel() {
                this.setMode('additional-add');
                this.showPanel();
            },
            showAdditionalEditPanel() {
                this.setMode('additional-edit');
                this.showPanel();
            },
            showDetailPanel() {
                this.setMode('edit');
                this.showPanel();
            },
            setIsPanelVisible(isVisible) {
                this.isPanelVisible = isVisible;
            },
            /**
             * Метод, когда считать панель отображаемой.
             * @return String
             */
            isVisible() {
                return this.isPanelVisible;
            },
            onShowPanel() {
                // описать метод открытия панели.
                this.setIsPanelVisible(true);
            },
            onHidePanel() {
                // описать метод закрытия панели.
                this.setIsPanelVisible(false);
                this.setDetail(null);

                this.$showLoader();
                this.loadProducts()
                    .finally(() => {
                        this.$hideLoader();
                    });
            },
            /**
             * @return String
             */
            getMode() {
                return this.mode;
            },
            showPanel() {
                this.hideBodyScroll();
                this.onShowPanel();
            },
            hidePanel() {
                this.showBodyScroll();
                this.onHidePanel();
            },
            overlayClickHandler(e) {
                if (e.target === this.$refs.panel) {
                    this.hidePanel();
                }
            },
            hideBodyScroll() {
                document.body.style.overflow = 'hidden';
            },
            showBodyScroll() {
                document.body.style.overflow = '';
            },
        },
        created() {
            if (isIos()) {
                this.panelInnerHeight = window.innerHeight;
            }
        }
    };
</script>