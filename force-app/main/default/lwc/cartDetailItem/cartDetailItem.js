import { api, LightningElement } from 'lwc';

export default class CartDetailItem extends LightningElement {

    @api cartItem

    deleteCartItemHandler() {
        console.log(`Cart Detail Item ${this.cartItem.Id}`)
        this.dispatchEvent(new CustomEvent('delete', { detail: this.cartItem.Id }));
    }
}