import { LightningElement, track } from 'lwc';
import CUSTOMERDETAIL_FIELD from '@salesforce/schema/Address_Book__c.Customer_Detail__c'
import CITY_FIELD from '@salesforce/schema/Address_Book__c.City__c'
import COUNTRY_FIELD from '@salesforce/schema/Address_Book__c.Country__c'
import POSTALCODE_FIELD from '@salesforce/schema/Address_Book__c.Postal_Code__c'
import STATE_FIELD from '@salesforce/schema/Address_Book__c.State__c'
import STREET_FIELD from '@salesforce/schema/Address_Book__c.Street__c'
import USER_FIELD from '@salesforce/schema/Address_Book__c.User__c'

export default class AddNewAddress extends LightningElement {

    objApiName = 'Address_Book__c'
    fieldArray = [CUSTOMERDETAIL_FIELD, STREET_FIELD, CITY_FIELD, POSTALCODE_FIELD, COUNTRY_FIELD, STATE_FIELD, USER_FIELD]

    @track formHandler = true
    formHandlerUp(){
        this.formHandler = false
    }

    formHandlerDown(){
        this.formHandler = true
    }

}