export default class Base {

    static createFrom(data) {
        return new this(data);
    }

    static createFromArray(arrayOfData) {
        return arrayOfData.map((data) => this.createFrom(data));
    }
}