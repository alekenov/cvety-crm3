import Base from "models/Base";
import FileItem from "models/FileItem";
import PropertyValues from "models/PropertyValues";
import OfferItem from "models/OfferItem";

export default class ProductDetail
    extends Base {
    constructor({id, isActive, description, images, name, price,percent,quantity, properties, sectionId, isSku, isProduct, offers, offersNew,url,isBouquetsGroup,priceGroup,countGroup,colorsVariant,bigCard,union}) {
        super();
        this.id          = id;
        this.isActive    = isActive;
        this.images      = FileItem.createFromArray(images);
        this.name        = name;
        this.price       = price;
        this.quantity       = quantity;
        this.percent       = percent;
        this.description = description;
        this.sectionId   = sectionId;
        this.isSku       = isSku;
        this.isProduct   = isProduct;
        this.properties  = new PropertyValues(properties);
        this.offers      = OfferItem.createFromArray(Object.values(offers));
        this.offersNew   = offersNew;
        this.url   = url;
        this.colorsVariant = colorsVariant ?? []

        this.isBouquetsGroup = isBouquetsGroup;
        this.priceGroup = priceGroup;
        this.countGroup = countGroup;
        this.bigCard = bigCard;
        this.union = union;

    }
}