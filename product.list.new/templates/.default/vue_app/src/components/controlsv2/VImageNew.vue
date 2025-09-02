<template>
    <div class="panel-form-row" style="margin-bottom: 12px;">
        <div
            v-if="isEmpty"
            class="form-group__file form-group__file--photo"
            @click="clickHandler"
        >
            <div class="form-group__photo-icon"></div>
            <div v-if="multiple" class="form-group__file-text">
                Добавьте фотографии товара
            </div>
            <div v-else class="form-group__file-text">
                Добавьте фотографию товара
            </div>
            <div v-if="multiple" class="form-group__file-note">
                Не более {{limit}} фото, jpg, jpeg, png.
            </div>
            <div v-else class="form-group__file-note">
                jpg, jpeg, png.
            </div>
        </div>

        <div
            v-else
            class="form-group__file-grid"
        >
            <div
                class="form-group__file-grid-item"
                v-if="!isLimit"
            >
                <button
                    class="form-group__file-grid-item-add"
                    type="button"
                    @click.prevent="clickHandler"
                >
                </button>
            </div>
            <div
                class="form-group__file-grid-item"
                v-for="(item, index) in actualFiles"
                :key="'image_' + index"
            >
                <span
                    class="form-group__file-grid-item__image-item"
                    draggable="true"
                    :style="getImageItemStyle(item)"
                    @dragstart="onDragStart($event, item)"
                    @dragenter.prevent="noop"
                    @dragleave.prevent="noop"
                    @dragover="onDragOverImages"
                    @drop.stop="onDragDropExistingImage($event, item)"
                ></span>
                <button
                    class="form-group__file-grid-item-remove"
                    type="button"
                    @click.stop="onRemove(item.id)"
                >
                    <div class="form-group__item-remove-icon"></div>
                </button>
            </div>
        </div>

        <input
            v-show="false"
            type="file"
            accept="image/*"
            ref="fileInput"
            :capture="capture"
            :multiple="multiple"
            @change="onChange"
        />
    </div>
</template>

<script>
import FileItem from "models/FileItem";
import {getFileSrc} from "services/Utils";

/*const getCoords = function (element) {
    const box = element.getBoundingClientRect()

    return {
        top: box.top + window.pageYOffset,
        left: box.left + window.pageXOffset
    };
};*/

export default {
    name  : "VImageNew",
    props : {
        multiple : {
            type    : Boolean,
            default : false,
        },
        value    : {
            type : Array,
        },
        capture  : {
            type    : [
                String,
                Boolean
            ],
            default : false
        }
    },
    model : {
        prop  : 'value',
        event : 'change',
    },
    data() {
        return {
            index : -1,
        };
    },
    computed : {
        actualFiles() {
            return this.value.filter((file) => file.isDeleted === false);
        },
        length() {
            return this.actualFiles.length;
        },
        hasFiles() {
            return this.length > 0;
        },
        isEmpty() {
            return !this.hasFiles;
        },
        limit() {
            return this.multiple ? 10 : 1;
        },
        isLimit() {
            return this.length === this.limit;
        },
    },
    methods  : {
        noop() {},
        getImageItemStyle(item) {
            return {
                backgroundImage: "url('" + item.src + "')",
            }
        },
        onDragStart(e, item) {
            e.dataTransfer.setData('text/plain', item.src)
            e.dataTransfer.setData('sort', '1')
            e.dataTransfer.setData('id', item.id)

            const img = new Image()
            img.src = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAMSURBVBhXY/j//z8ABf4C/qc1gYQAAAAASUVORK5CYII=`
            e.dataTransfer.setDragImage(img, 1, 1)
        },
        onDragOverImages(e) {
            if (e.dataTransfer.types.includes('sort')) {
                e.preventDefault()

                return true
            }

            return false
        },
        onDragDropExistingImage(e, item) {
            const srcId = e.dataTransfer.getData('id')

            const srcIndex = this.value.findIndex((file) => file.id == srcId)
            const trgIndex = this.value.findIndex((file) => file.id == item.id)

            const srcItem = this.value[srcIndex]

            const value = this.value.concat()

            if (srcIndex < trgIndex) {
                value.splice(trgIndex + 1, 0, srcItem)
                value.splice(srcIndex, 1)
            }
            else {
                value.splice(trgIndex, 0, srcItem)
                value.splice(srcIndex + 1, 1)
            }

            this.emitChange(value)
        },
        getNewIndex() {
            return this.index--;
        },
        async onChange(e) {
            const arFiles = Array.apply('map', e.target.files);

            let files = [];
            for (let i = 0; i < arFiles.length; i++) {
                if (this.length + i >= this.limit) {
                    break;
                }

                let file = arFiles[i];
                files.push({
                    id        : this.getNewIndex(),
                    name      : file.name,
                    src       : await getFileSrc(file),
                    file      : file,
                    isNew     : true,
                    isDeleted : false,
                });
            }

            if (this.multiple) {
                files = [
                    ...this.value,
                    ...files
                ];
            }

            this.emitChange(files);

            e.target.value = '';
        },
        onRemove(id) {
            const newFiles = this.value.reduce((carry, file) => {
                if (id < 0 && id === file.id) {
                    return carry;
                }

                carry.push(FileItem.createFrom({
                    id        : file.id,
                    name      : file.name,
                    src       : file.src,
                    file      : file.file,
                    isNew     : file.isNew,
                    isDeleted : file.id === id ? true : file.isDeleted,
                }));

                return carry;
            }, []);

            this.emitChange(newFiles);
        },
        emitChange(value) {
            this.$emit('change', value);
        },
        clickHandler() {
            this.$refs.fileInput.click();
        },
    },
};
</script>
<style>
.form-group__file-grid-item__image-item {
    display: block;
    height: 84px;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
}
</style>