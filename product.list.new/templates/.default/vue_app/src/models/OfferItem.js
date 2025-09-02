import Base from "models/Base";
import FileItem from "models/FileItem";

export default class OfferItem
    extends Base {
    constructor({id, name, price, priceFormatted, morePhoto, quantityFlowers, typeBouquet, consist}) {
        super({});

        this.id              = id;
        this.name            = name;
        this.price           = price;
        this.priceFormatted  = priceFormatted;
        this.morePhoto       = morePhoto.map((item) => FileItem.createFrom({id: item.id, src: item.src ? item.src : item.imageSrc}));
        this.quantityFlowers = quantityFlowers;
        this.typeBouquet     = typeBouquet;
        this.consist         = consist;
    }

}