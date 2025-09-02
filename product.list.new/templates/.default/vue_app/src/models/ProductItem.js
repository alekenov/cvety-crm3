import Base from "models/Base";

export default class ProductItem
    extends Base {
    constructor({id, name, isActive, isFavorite, inStock, image,  imageResized, priceFormated,morePhoto,freeDelivery,top}) {
        super();
        this.id             = id;
        this.isActive       = isActive;
        this.isFavorite     = isFavorite;
        this.inStock        = inStock;
        this.name           = name;
        this.image          = image;
        this.imageResized   = imageResized;
        this.priceFormatted = priceFormated;
        this.morePhoto = morePhoto;
        this.freeDelivery = freeDelivery;
        this.top = top;

    }
}