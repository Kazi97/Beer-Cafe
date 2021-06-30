import { api, LightningElement, track } from 'lwc';

export default class BeerSearch extends LightningElement {


    @api searchKey;
    beerSearchHandler(event) {

        const isEnterKey = event.keyCode === 13;
        if (isEnterKey) {
            this.searchKey = event.target.value;
            this.dispatchEvent(new CustomEvent("beersearch", { detail: this.searchKey }));
        }
    }
}