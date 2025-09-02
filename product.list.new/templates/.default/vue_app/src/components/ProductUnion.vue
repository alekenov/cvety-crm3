<template>
  <div class="panel__block" style="display: block;margin-top: 40px">

    <div class="h-[calc(100vh-8rem)] overflow-y-auto">

      <div class="max-w-6xl mx-auto">
        <div class="p-6 max-w-2xl mx-auto">
          <div class="p-4 space-y-4">
            <div class="flex items-center">
              <v-checkbox class="flex items-center mb-4 p-3" placeholder="Новый набор" v-model="newUnion"
                          @input="loadOldUnions()"/>
            </div>

            <v-input v-model="titleUnion" placeholder="Название набора" class="w-full p-2 border rounded-lg"/>

            <div v-if="!newUnion">
              <h2 class="font-medium mb-4">Уже созданные наборы</h2>
              <div class="flex flex-wrap gap-2" v-if="oldUnions.length > 0">

                <v-select :options="getOldUnions()" :value="unionId" v-model="unionId"
                          classS="border rounded-lg px-3 py-2" @select="onChangeUnion"/>
              </div>
              <div v-else>У вас нет созданных наборов, создайте новый</div>
            </div>
            <div class="space-y-2">

              <div class="bg-white p-3 rounded-lg border" v-for="(union, index) in unions">
                <div class="flex gap-3">
                  <div class="w-16 h-16">
                    <img :src="union.image" class="w-full h-full object-cover rounded-lg" alt=""/>
                  </div>
                  <div class="flex-grow"><h3 class="font-medium">{{ union.name }}</h3>
                    <div class="text-sm font-medium mt-1">{{ union.price }} ₸</div>
                    <div class="text-sm font-medium mt-1">
                      Текст в блоке переключения
                    </div>
                    <div class="text-sm font-medium mt-1">
                      <v-input v-model="union.textSelect" placeholder="" class="w-24 p-2 border rounded-lg"/>
                    </div>
                  </div>
                  <button class="text-gray-400 hover:text-red-500 self-start" @click="removeUnion(index)">
                    <span><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                               class="lucide lucide-x "><path d="M18 6 6 18"></path><path
                        d="m6 6 12 12"></path></svg></span>
                  </button>
                </div>
              </div>
            </div>
            <v-product-search-v2
                ref="search"
                :multiple="false"
                placeholder="Выберите товары из каталога"
                @select="onSelectItem"
            />


            <div class="bg-blue-50 p-4 rounded-lg text-sm text-blue-600">Объединяйте похожие букеты, чтобы показать их
              на одной странице. Например: классический букет роз и тот же букет, но в другом оформлении
            </div>
            <div class="bg-yellow-50 p-4 rounded-lg text-sm text-gray-900" v-if="isUnion()">Выбранные товары уже состоят
              в
              наборах. При сохранение, текущий товар добавится в набор и все остальные товары, которые не состоят в
              данном наборе. Если наборов несколько, у разных товаров, то добавится в первый набор.
            </div>
          </div>
        </div>
      </div>

    </div>


    <div class="panel__edit-actions-item sacz">
      <button
          class="btn btn_wide btn_secondary"
          @click.stop="save">
        Сохранить
      </button>
    </div>

    <div class="panel__actions-block">
      <a
          href="javascript:void(0)"
          class="text-capital"
          @click.prevent="backHandler"
      >Назад</a>
    </div>


  </div>
</template>

<script>
import {mapActions, mapMutations, mapState} from "vuex";
import VProductSearch from "@/components/controls/VProductSearch";
import VInput from "@/components/controls/VInput.vue";
import VCheckbox from "@/components/controls/VCheckbox.vue";
import VProductSearchV2 from "@/components/controls/VProductSearchV2.vue";

import VSelect from "@/components/controlsv2/VSelect.vue";

const removeFromArray = function (arr, value) {
  const index = arr.indexOf(value)

  if (index > -1) {
    arr.splice(index, 1)
  }
};

export default {
  name: "ProductUnion",
  components: {
    VInput, VCheckbox, VProductSearchV2, VSelect,
    VProductSearch,
  },
  data() {
    return {
      items: [],
      newIds: [],
      delIds: [],
      newUnion: true,
      titleUnion: '',
      oldUnions: [],
      unionId: 0,
      unions: [],
    }
  },
  computed: {
    ...mapState({
      productId: state => state.detail.id,
      product: state => state.detail,
    }),
    needSave() {
      return this.newIds.length || this.delIds.length
    }
  },
  methods: {
    ...mapMutations([
      'setMode',
    ]),
    ...mapActions({
      getUnionProductsAction: 'getUnionProducts',
      saveUnionProductsAction: 'saveUnionProducts',
      loadOldUnionAction : 'loadOldUnion'
    }),
    backHandler() {
      this.setMode('edit')
    },


    getOldUnions() {
      let result = [];

      for (let key of Object.keys(this.oldUnions)) {
        let s = this.oldUnions[key];
        result.push({
          'id': s.id,
          'name': s.title
        });
      }

      return result;
    },


    removeUnion(index) {
      let result = [];

      for (let i = 0; i < this.unions.length; i++) {
        let item = this.unions[i];
        if (i !== index) {
          result.push(item)
        }
      }
      this.unions = [];
      this.unions = result;

    },

    loadOldUnions(loader = true) {

      if (this.oldUnions.length > 0) {
        return;
      }


      if (loader)
        this.$showLoader();
      this.loadOldUnionAction()
          .then((data) => {
            this.oldUnions = data.data.unions;
            if (loader) {
              this.$hideLoader();
            } else {
              this.onChangeUnion();
            }

          })
          .catch((response) => {
            if (loader)
              this.$hideLoader();
          });
    },


    onChangeUnion() {
      let f = this.oldUnions.find((prop) => prop.id == this.unionId);
      if (f) {
        this.unions = [];
        this.titleUnion = f.title;
        let is = f.products.find((prop) => prop.id == this.productId && this.productId > 0);

        if (!is) {
          this.unions.push({
            id: this.productId,
            name: this.name ?? 'Текущий товар',
            image: this.images.length > 0 ? this.images[0].src : '',
            price: this.price,
            isUnion: 0,
            textSelect: ''
          });
        }
        for (let i = 0; i < f.products.length; i++) {
          let item = f.products[i];
          this.unions.push({
            id: item.id,
            name: item.name,
            image: item.image,
            price: item.price,
            isUnion: item.isUnion,
            textSelect: item.textSelect,
            parentId: f.id
          });
        }

      }
    },

    isUnion() {
      return this.unions.find((prop) => prop.isUnion);
    },


    onSelectItem(item, blockId) {

      if (item) {
        let f = this.unions.find((prop) => prop.id === item.id);
        if (!f) {
          if(this.unions.length === 0)
          {
            this.unions.push({id: this.productId, name: this.name ?? 'Текущий товар', image: this.images.length > 0 ? this.images[0].src : '', price: this.price, isUnion: 0,textSelect : ''});
          }


          this.unions.push({id: item.id, name: item.name, image: item.image, price: item.price, isUnion: item.isUnion,textSelect : ''});
        }
      }

      this.$refs.search.selectedProducts = 0
    },


    save() {

      let items = this.items;
      this.$showLoader();

      let titleUnion = '';
      let union = [];
      let unionId = 0;

      if(this.unions.length > 0)
      {
        for (let i = 0; i < this.unions.length; i++) {
          let c = this.unions[i];
          union.push({id: c.id,textSelect : c.textSelect});
        }
        union = JSON.stringify(union);
        titleUnion =  this.titleUnion;
      }
      if(!this.newUnion && this.unionId > 0)
      {
        unionId = this.unionId
      }

      let data = new FormData();

      console.log('unionunion',union)
      data.append('union', union);
      data.append('titleUnion', titleUnion);
      data.append('unionId', unionId);
      data.append('productId', this.product.id);


      this.saveUnionProductsAction(data)
          .then(() => {
            this.$hideLoader()
          })
          .catch((response) => {
            this.$hideLoader()
            this.$showErrors(response)
          })

    },

    getUnionProducts() {

      this.name = this.product.name;
      this.images =  this.product.images;
      this.price =  this.product.price;

      let a = this.product.union;

      if(a.id > 0)
      {
        this.unionId = a.id;
        this.newUnion = false;
        this.loadOldUnions(false);
      }

    },

  },
  mounted() {
    this.getUnionProducts()
  },
}
</script>

<style>
.p-3 {
  padding: .75rem;
}

.bg-white {
  --tw-bg-opacity: 1;
  background-color: #fff;
  background-color: rgb(255 255 255 / var(--tw-bg-opacity, 1));
}

.border {
  border-width: 1px;
}
.rounded-lg {
  border-radius: .5rem;
}
.gap-3 {
  gap: .75rem;
}

.flex {
  display: flex;
}
.w-16 {
  width: 4rem;
}

.h-16 {
  height: 4rem;
}
.object-cover {
  object-fit: cover;
}
.rounded-lg {
  border-radius: .5rem;
}
.w-full {
  width: 100%;
}
.h-full {
  height: 100%;
}
.flex-grow {
  flex-grow: 1;
}
.font-medium {
  font-weight: 500;
}

.text-sm {
  font-size: .875rem;
  line-height: 1.25rem;
}
.mt-1 {
  margin-top: .25rem;
}
.p-2 {
  padding: .5rem;
}
.border {
  border-width: 1px;
}
.rounded-lg {
  border-radius: .5rem;
}
.w-24 {
  width: 6rem;
}
.gap-2 {
  gap: .5rem;
}
.flex-wrap {
  flex-wrap: wrap;
}
.flex {
  display: flex
;
}
.mb-4 {
  margin-bottom: 1rem;
}
.py-2 {
  padding-bottom: .5rem;
  padding-top: .5rem;
}
.px-3 {
  padding-left: .75rem;
  padding-right: .75rem;
}
.border {
  border-width: 1px;
}
.rounded-lg {
  border-radius: .5rem;
}

.text-blue-600 {
  --tw-text-opacity: 1;
  color: #2563eb;
  color: rgb(37 99 235 / var(--tw-text-opacity, 1));
}
.text-sm {
  font-size: .875rem;
  line-height: 1.25rem;
}
.p-4 {
  padding: 1rem;
}
.bg-blue-50 {
  --tw-bg-opacity: 1;
  background-color: #eff6ff;
  background-color: rgb(239 246 255 / var(--tw-bg-opacity, 1));
}
.space-y-4 > :not([hidden]) ~ :not([hidden]) {
  --tw-space-y-reverse: 0;
  margin-bottom: calc(1rem* var(--tw-space-y-reverse));
  margin-top: calc(1rem*(1 - var(--tw-space-y-reverse)));
}
</style>