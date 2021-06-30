public with sharing class BeerController {
    
    @AuraEnabled(cacheable=true)
    public static List<Beer__c> getBeerDetails(String beerName){

        String searchTerm = '%'+beerName+'%';
        return ([SELECT Id, Name, Alcohol__c, brewery_id__c, brewery_Name__c, Id__c, Image__c, Tags__c, Total_Quantity__c, Price__c, Remaining_Quantity__c 
                FROM Beer__c WHERE Name LIKE :searchTerm ORDER BY Name LIMIT 50]);
    }

    //it generates a cart id and returns it
    public static String generateCartId(){

        Integer num = Integer.valueOf(Math.round((Math.random() * (900000) + 100000)));
        String cartId = 'CID-'+String.valueOf(num);
        return cartId;
    }

    @AuraEnabled
    public static Coupon__c getValidCouponInfo(String couponname){

        return (getCouponInformation(couponname));
    }

    //it checks weather a valid cupon is applied by the user and returns its id
    public static Coupon__c getCouponInformation(String couponName){
        Coupon__c couponRec = [SELECT Id, Name, Price__c FROM Coupon__c WHERE Expired__c = false AND (Remaining_Quantity__c > 0 OR NAME = 'Default') AND  Name = :couponName];

        return couponRec;
    }

    //returns the cartId if there is already an open and active cart.
    //else create a new open and active cart, then returns the cartId 
    @AuraEnabled(cacheable=false)
    public static String getCartId(){

        List<Cart__c> cartInfo = [SELECT Id,Name FROM Cart__C WHERE User__c = :UserInfo.getUserId() AND Cart_Status__c = 'Open' AND Is_Active__c = True ];
        
        if(cartInfo != null && cartInfo.size() > 0){

            List<Cart_Item__c> cartItem = [SELECT Id,Beer__c,Cart__c,Item_Amount__c,Item_Quantity__c FROM Cart_Item__c WHERE Cart__c =: cartInfo.get(0).Id]; 
            
            Decimal itemQuantity = 0;
            for(Cart_Item__c item : cartItem){
                itemQuantity = itemQuantity + item.Item_Quantity__c;
            }

            cartWrapper wrapper = new cartWrapper();
            wrapper.CartId = cartInfo.get(0).Id;
            wrapper.items = cartItem;
            wrapper.Count = itemQuantity;

            return JSON.serialize(wrapper);
        }else{

            Cart__C defaultCart = new Cart__C();
            Coupon__c coupon = getCouponInformation('Default');
            defaultCart.Cart_Id__c = generateCartId();
            defaultCart.Coupon__c = coupon.Id;
            defaultCart.Is_Active__c = True;
            defaultCart.Cart_Status__c = 'Open';
            defaultCart.User__c = UserInfo.getUserId();
            insert defaultCart;
            
            cartWrapper wrapper = new cartWrapper();
            wrapper.CartId = defaultCart.Id;
            wrapper.items = null;
            wrapper.Count = 0;

            return JSON.serialize(wrapper);
        }
    }

    //create cart item and return cart_item record Id
    @AuraEnabled
    public static String createCartItem(String cartId, String beerRecordId, Decimal amount){

        Cart_Item__c cartItem = new Cart_Item__c();
        Map<Id,Cart_Item__c> cartItemMap = getCartItem(cartId);

        if(cartItemMap.containsKey(beerRecordId)){
            cartItem = cartItemMap.get(beerRecordId);
            cartItem.Item_Amount__c = cartItem.Item_Amount__c + amount;
            cartItem.Item_Quantity__c = cartItem.Item_Quantity__c + 1;
            update cartItem;
        }else{
            cartItem.Cart__c = cartId;
            cartItem.Beer__c = beerRecordId;
            cartItem.Item_Amount__c = amount;
            cartItem.Item_Quantity__c = 1;
            insert cartItem;
        }
        
        return cartItem.Id;
    }

    public static Map<Id,Cart_Item__c> getCartItem(String cartId){

        Map<Id,Cart_Item__c> cartItemMap = new Map<Id,Cart_Item__c>();
        List<Cart_Item__c> cartItems = [SELECT Id,Beer__c,Cart__c,Item_Amount__c,Item_Quantity__c FROM Cart_Item__c WHERE Cart__c =:  cartId];

        for(Cart_Item__c cartItem : cartItems){

            cartItemMap.put(cartItem.Beer__c,cartItem);
        }

        return cartItemMap;
    }

    //get the list of item and sends to CarDetails
    @AuraEnabled
    public static List<SObject> getItems(String cartId){

        List<Cart_Item__c> cartItem = [SELECT Id,Name, Beer__c, Cart__c, Item_Amount__c,Item_Quantity__c,Total_Amount__c,Beer__r.Name FROM Cart_Item__c WHERE Cart__c = :cartId];
        return cartItem;
    }

    //returns the list of available address.
    @AuraEnabled
    public static List<Address_Book__c> addressDetails(String customer){
        String searchKey = '%' + customer + '%';
        return [SELECT Id,City__c,Country__c,Postal_Code__c,State__c,Street__c,User__c,	Customer_Detail__c FROM Address_Book__c WHERE Customer_Detail__c LIKE :searchKey];
    }

    @AuraEnabled
    public static Order__c createOrder(String cartId, String addressId, Decimal amount,String coupon){

        //creating order
        Order__c order = new Order__c();
        order.Cart__c = cartId;
        order.Shipping_Address__c = addressId;
        order.subTotal__c = amount;
        order.User__c = UserInfo.getUserId();
        insert order;

        List<Cart_Item__c> cartItem = getItems(cartId);

        //creating order items related to the above order
        List<Order_Item__c> orderItems = new List<Order_Item__c>();
        for(Cart_Item__c items : cartItem){

            Order_Item__c oitem = new Order_Item__c();
            oitem.Related_Order__c = order.Id;
            oitem.Beer__c = items.Beer__c;
            oitem.Item_Price__c = items.Item_Amount__c;
            oitem.Ordered_Quantity__c = items.Item_Quantity__c;
            orderItems.add(oitem);
        }
        insert orderItems;

        Cart__c cart = new Cart__c();
        cart.Id = cartId;
        cart.Cart_Status__c = 'Closed';
        cart.Is_Active__c = false;
        update cart;

        Order__c orderInfo = [SELECT Id, Name FROM Order__c WHERE Id =: order.Id];

        return orderInfo;
    }

    @AuraEnabled(cacheable=true)
    public static List<Order__c> orderDetail(String order){

        return [SELECT Id,subTotal__c,User__c,Name,Shipping_Address__c,
                Shipping_Address__r.Customer_Detail__c,
                Shipping_Address__r.City__c,
                Shipping_Address__r.Country__c,
                Shipping_Address__r.Street__c,
                Shipping_Address__r.State__c,
                Shipping_Address__r.Postal_Code__c 
                FROM Order__c WHERE Id =: order];
    }

    @AuraEnabled(cacheable=true)
    public static List<Order_Item__c> orderItemDetail(String order){

        return [SELECT Id,Beer__r.Name,Item_Price__c,Ordered_Quantity__c,Related_Order__c FROM Order_Item__c WHERE Related_Order__c =: order];

    }
    

    public class cartWrapper{

        @AuraEnabled
        public String CartId {get;set;}

        @AuraEnabled
        public Decimal Count {get; set;}

        @AuraEnabled
        public List<Cart_Item__c> items {get;set;}
    }
}