import { LightningElement, track, wire } from 'lwc';
import getBeerDetails from '@salesforce/apex/BeerController.getBeerDetails'
import getCartId from '@salesforce/apex/BeerController.getCartId';
import createCartItem from '@salesforce/apex/BeerController.createCartItem';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';

export default class BeerList extends NavigationMixin(LightningElement) {

    @track beerSearchTerm = null;
    @track beerDetails

    beerSearchHandler(event) {
        this.beerSearchTerm = event.detail;
        // console.log(this.beerSearchTerm);
    }

    @wire(getBeerDetails, { beerName: '$beerSearchTerm' })
    wireBeerDetail({ data, error }) {
        if (data) {
            this.beerDetails = data;
            // console.log(this.beerDetails);
            // console.log(this.beerDetails.length);

        } else if (error) {
            console.error(error);
        }
    }

    @track count = null
    get beerData() {
        if (this.beerDetails) {
            this.count = this.beerDetails.length;
            return true;
        } return false;
    }

    @track cartId
    connectedCallback() {
        this.defaultCartId();
    }

    defaultCartId() {
        getCartId().then(result => {
            const wrapper = JSON.parse(result);
            if (wrapper) {
                this.itemCount = wrapper.Count;
                this.cartId = wrapper.CartId;
            }
        }).catch(error => {
            console.error('Cart Id ', error);
        });

    }

    @track beerId
    @track itemCount = 0
    @track cartItemId
    beerAddToCartHandler(event) {
        this.beerId = event.detail;
        // this.itemCount = this.itemCount + 1;
        // console.log('Beer record ',this.beerId);
        // console.log('Cart Id ',this.cartId);


        const beerDetailsRecord = this.beerDetails.find(result => result.Id === this.beerId);

        createCartItem({
            cartId: this.cartId,
            beerRecordId: this.beerId,
            amount: beerDetailsRecord.Price__c
        }).then(result => {
            this.cartItemId = result;
            this.itemCount = this.itemCount + 1;
            // console.log('Cart Item Id ',this.cartItemId)
            // console.log('Beer Count ',this.itemCount);

            this.dispatchEvent(new ShowToastEvent({
                title: 'SUCCESS',
                message: beerDetailsRecord.Name + ' is added to Cart',
                variant: 'success'
            }))
        }).catch(error => {
            console.error(error);

            this.dispatchEvent(new ShowToastEvent({
                title: 'ERROR',
                message: JSON.stringify(error),
                variant: 'error'
            }))
        })
    }

    navigateToCartDetail(){

        this[NavigationMixin.GenerateUrl]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'Cart_Detail'
            },
            state:{
                c__cartId : this.cartId
            }
        }).then(url => {
            window.open(url, '_blank')
        });
    }
}