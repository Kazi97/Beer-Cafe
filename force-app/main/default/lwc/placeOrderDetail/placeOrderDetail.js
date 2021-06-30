import { LightningElement } from 'lwc';

export default class PlaceOrderDetail extends LightningElement {

    value = '';

    get options() {
        return [
            { label: 'Take away', value: 'Take_away' },
            { label: 'Dine In', value: 'Dine_In' },
        ];
    }

    takeAway
    dineIn
    itemDeliveryHandler(event){

        console.log(event.target.value)
        if(event.target.value === 'Take_away'){
            this.takeAway = true;
            this.dineIn = false;
        }
        else if(event.target.value === 'Dine_In'){
            this.dineIn = true;
            this.takeAway = false;
            this.dispatchEvent(new CustomEvent('dinein'));
        }
    }

    customerDetailHandler(event){

        const isEnterKey = event.keyCode === 13
        if(isEnterKey){
            this.dispatchEvent(new CustomEvent('takeaway', { detail: event.target.value}));
        }
        
    }
}