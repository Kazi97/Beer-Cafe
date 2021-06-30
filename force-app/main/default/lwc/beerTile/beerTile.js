import { api, LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class BeerTile extends NavigationMixin(LightningElement) {

    @api beerDetail;

    //on button click it will redirect to the particular beer detail page
    //will use navigationmixin
    showBeerDetailHandler(event) {
        console.log(event.target.value);

        this[NavigationMixin.GenerateUrl]({
            type: 'standard__recordPage',
            attributes: {
                recordId: event.target.value,
                objectApiName: 'Beer__c',
                actionName: 'view'
            }
        }).then(url => {
            window.open(url, '_blank')
        });

    }

    addToCartHandler(event) {

        this.dispatchEvent(new CustomEvent('beeraddtocart', { detail: event.target.value }));
    }
}