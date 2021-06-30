import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class CartDetailCheckout extends NavigationMixin(LightningElement) {
    @api totalPrice
    @api couponAppliedMessage
    couponCode
    couponField = false
    continueShoppingHandler() {

        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'Beer_Explorer'
            }
        });
    }

    couponFieldHandler(){
        this.couponField = true
    }

    couponCodeHandler(event) {
        this.couponCode = event.target.value;
    }

    applyCouponHandler() {

        if(this.couponCode){
            this.dispatchEvent(new CustomEvent('applycoupon', { detail: this.couponCode }));
        }else{
            alert('Please provide a valid coupon code');
        }
        
    }

    placeOrderHandler(){

        this.dispatchEvent(new CustomEvent('placeorder'));
    }
}