function orderMethods(){

return {

filteredOrders(){

if(!this.orderSearch){
return this.orders;
}

return this.orders.filter(order =>

```
(order.customerName || '')
.toLowerCase()
.includes(this.orderSearch.toLowerCase())

||

(order.productName || '')
.toLowerCase()
.includes(this.orderSearch.toLowerCase())

||

(order.trackingId || '')
.toLowerCase()
.includes(this.orderSearch.toLowerCase())
```

);

},

async updateOrderStatus(order,status){

try{

```
await this.db
.collection('claims')
.doc(order.id)
.update({

  orderStatus:status,

  shippedDate:
    status === 'shipped'
    ? new Date().toISOString().split('T')[0]
    : order.shippedDate || '',

  updatedAt:
  firebase.firestore.FieldValue.serverTimestamp()

});

await this.logActivity(
  'ORDER_STATUS_UPDATED',
  {
    customer:order.customerName,
    product:order.productName,
    newStatus:status
  }
);

this.showToast(
  'success',
  'ORDER UPDATED',
  status.toUpperCase()
);
```

}

catch(error){

```
console.error(error);

this.showToast(
  'error',
  'UPDATE FAILED',
  error.message
);
```

}

},

async saveShipmentTracking(order){

try{

```
await this.db
.collection('claims')
.doc(order.id)
.update({

  courierName:
  order.courierName || '',

  trackingId:
  order.trackingId || '',

  shippedDate:
  order.shippedDate || '',

  deliveryDate:
  order.deliveryDate || '',

  trackingNotes:
  order.trackingNotes || '',

  updatedAt:
  firebase.firestore.FieldValue.serverTimestamp()

});

await this.logActivity(
  'SHIPMENT_UPDATED',
  {
    customer:order.customerName,
    product:order.productName,
    trackingId:order.trackingId
  }
);

this.showToast(
  'success',
  'TRACKING SAVED',
  'Shipment details updated'
);
```

}

catch(error){

```
console.error(error);

this.showToast(
  'error',
  'SAVE FAILED',
  error.message
);
```

}

}

};

}
