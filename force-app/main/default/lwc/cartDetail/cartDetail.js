import { LightningElement, track, wire } from 'lwc';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
import getItems from '@salesforce/apex/BeerController.getItems'
import { deleteRecord } from 'lightning/uiRecordApi';
import getValidCouponInfo from '@salesforce/apex/BeerController.getValidCouponInfo'
import addressDetails from '@salesforce/apex/BeerController.addressDetails'
import createOrder from '@salesforce/apex/BeerController.createOrder'
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CartDetail extends NavigationMixin(LightningElement) {

    @track emptyCart = false
    @track cartItemData = false
    @track cartId
    @wire(CurrentPageReference)
    setCurrentPageReference(pageReference) {
        this.cartId = pageReference.state.c__cartId;

    }

    connectedCallback() {
        this.getCartItem();
    }

    //getting cart details code
    @track cartItems
    @track itemCount
    // cardTitle
    @track totalAmount = 0
    getCartItem() {

        getItems({ cartId: this.cartId }).then(result => {

            this.cartItemData = true
            this.cartItems = result;
            this.itemCount = this.cartItems.length;
            // this.cardTitle = `Total Items: ${this.itemCount}`
            console.log(`Cart Item ${result}`)


            for (let i = 0; i < this.cartItems.length; i++) {
                // console.log(`Total Quantity ${this.cartItems[i].Item_Quantity__c}`)
                // console.log(`Total Price ${this.cartItems[i].Item_Amount__c}`)
                this.totalAmount = this.totalAmount + this.cartItems[i].Item_Amount__c;
                // console.log(`Total Price ${this.totalAmount}`)
            }

            // console.log(`Total Price ${this.totalAmount}`)

        }).catch(error => {
            console.error(error);
        })
    }


    // get cartItemData() {
    //     if (this.cartItems) {
    //         return true;
    //     } return false;
    // }

    //delete any cart code
    deleteCartItem(event) {

        const selectedCartItemId = event.detail;
        const selectedCartItemRecord = this.cartItems.find(item => item.Id === selectedCartItemId)
        const indexOfCartItem = this.cartItems.indexOf(selectedCartItemRecord);

        deleteRecord(selectedCartItemId).then(() => {
            console.log(`Item Deleted`);
            this.cartItems.splice(indexOfCartItem, 1);
            this.totalAmount = this.totalAmount - selectedCartItemRecord.Item_Amount__c;
            this.cartItemData = true;
            this.itemCount = this.cartItems.length;
            // this.cardTitle = `Total Items: ${this.itemCount}`
        }).catch(error => {
            console.error(error);
        })
    }


    //apply coupon code
    @track couponName
    @track couponValue = 0;
    @track couponUseCount = 0
    @track couponAppliedMessage
    couponHandler(event) {

        this.couponName = event.detail;
        // console.log(`Coupon Name ${this.couponName}`)
        getValidCouponInfo({ couponname: this.couponName }).then(result => {
            if (this.couponUseCount < 1) {
                // console.log(`Valid Coupon Value: ${result}`);
                this.couponValue = result.Price__c;
                this.totalAmount = this.totalAmount - this.couponValue;
                this.couponUseCount = 1
                this.couponAppliedMessage = `Discount Applied: ${result.Price__c}`
            } else {
                this.couponAppliedMessage = `Coupon Already Used`
                // alert(`only One Coupon can be used`);
            }


        }).catch(error => {
            this.couponAppliedMessage = `invalid coupon`
            // alert(`Please provide a valid coupon code, error returned: ${error.body.message}`);
            this.couponValue = 0;
            this.totalAmount = this.totalAmount + this.couponValue;
        });

    }

    //code for placeorder
    @track placeOrder = false
    placeOrderHandler() {
        // console.log(`Item count => ${this.itemCount}`)
        if(this.itemCount > 0){
            this.cartItemData = false;
            this.placeOrder = true;
        }
    }

    @track address = ''
    @track takeAway = false
    @track dinIn = false
    // @track addDetail = false
    takeAwayHandler(event) {

        // console.log('Takeaway via cartDetail')
        this.dinIn = false
        this.takeAway = true
        const customerSearchKey = event.detail;
        // console.log(customerSearchKey)
        addressDetails({ customer: customerSearchKey }).then(result => {
            // console.log(result)
            this.address = result;
            // console.log(this.address.length)
        }).catch(error => {

            console.error(error);
        })
    }

    get addDetail() {
        if (this.address.length > 0) {
            return true;
        } return false
    }

    dineInHandler() {
        this.dinIn = true
        this.takeAway = false
        // console.log('DineIn via cartDetail')
    }

    @track addNewAddress = false
    addNewAddressHandler() {
        this.addNewAddress = true;
    }

    @track selectAddress = false
    @track selectedDeliveryAddressId
    deliverHandler(event) {

        
        this.selectedDeliveryAddressId = event.target.value;
        if(this.selectedDeliveryAddressId){
            this.selectAddress = true
        }
        
    }

    @track checkout = true
    checkOutHandler(){

        // console.log(`Cart Id => ${this.cartId}`)
        // console.log(`Address Id => ${this.selectedDeliveryAddressId}`)
        // console.log(`Total Amount => ${this.totalAmount}`)

        createOrder({
            cartId : this.cartId,
            addressId : this.selectedDeliveryAddressId,
            amount : this.totalAmount
        }).then(result => {
            // console.log(`Order Details => ${result}`);
            
            this.dispatchEvent(new ShowToastEvent({
                title : 'SUCCESS',
                message : 'Order successfully placed. Your Order number is '+result.Name,
                variant : 'success'
            }))

            this[NavigationMixin.Navigate]({
                type : 'standard__navItemPage',
                attributes : {
                    apiName : 'Order_Detail'
                },
                state : {
                    c__orderId : result.Id
                }
            })

        }).catch(error => {
            console.error(error);
        })

        this.cartItemData = false
        this.checkout = false
        this.placeOrder = false
        this.emptyCart = true
    }
        

    // testHandler() {
    //     console.log(`Cart Id ${this.cartId}`)
    // }

}