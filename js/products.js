function productMethods(){

return {

filteredProducts(){

if(!this.productSearch.trim()){
return this.products;
}

return this.products.filter(product =>

```
(product.name || '')
.toLowerCase()
.includes(this.productSearch.toLowerCase())

||

(product.category || '')
.toLowerCase()
.includes(this.productSearch.toLowerCase())
```

);

},

lowStockCount(){

return this.products.filter(
p => Number(p.stock || 0) <= 1
).length;

},

async addKit(){

try{

if(
!this.newKit.name ||
!this.newKit.price
){
this.showToast(
'warning',
'MISSING INFO',
'Name and price required'
);
return;
}

if(
this.newKit.image &&
!this.newKit.image.startsWith('http')
){
this.showToast(
'warning',
'INVALID IMAGE',
'Enter valid image URL'
);
return;
}

const addedKit = {
...this.newKit
};

await this.db
.collection('products')
.add({

name:addedKit.name,
price:Number(addedKit.price),
stock:Number(addedKit.stock || 0),
category:addedKit.category,

image:
addedKit.image ||
'https://placehold.co/600x600/111827/ffffff?text=NO+IMAGE',

createdAt:
firebase.firestore.FieldValue.serverTimestamp(),

updatedAt:
firebase.firestore.FieldValue.serverTimestamp()

});

await this.logActivity(
'KIT_ADDED',
{
name:addedKit.name,
category:addedKit.category,
price:Number(addedKit.price)
}
);

this.newKit = {
name:'',
price:'',
stock:'',
category:'HG',
image:''
};

this.showAddKit = false;

this.showToast(
'success',
'KIT ADDED',
'New kit added successfully'
);

}

catch(error){

console.error(error);

this.showToast(
'error',
'ADD FAILED',
'Failed to add kit'
);

}

},

openEditKit(product){

this.editKit = {
...product
};

this.showEditKit = true;

},

async updateKit(){

try{

if(
!this.editKit.name ||
!this.editKit.price
){
this.showToast(
'warning',
'MISSING INFO',
'Name and price required'
);
return;
}

await this.db
.collection('products')
.doc(this.editKit.id)
.update({

name:this.editKit.name,
price:Number(this.editKit.price),
stock:Number(this.editKit.stock || 0),
category:this.editKit.category,

image:
this.editKit.image ||
'https://placehold.co/600x600/111827/ffffff?text=NO+IMAGE',

updatedAt:
firebase.firestore.FieldValue.serverTimestamp()

});

this.showEditKit = false;

await this.logActivity(
'KIT_UPDATED',
{
id:this.editKit.id,
name:this.editKit.name
}
);

this.showToast(
'success',
'KIT UPDATED',
'Kit updated successfully'
);

}

catch(error){

console.error(error);

this.showToast(
'error',
'UPDATE FAILED',
'Failed to update kit'
);

}

},

async deleteKit(id){

try{

const confirmDelete =
confirm('Move this kit to Trash?');

if(!confirmDelete){
return;
}

await this.db
.collection('products')
.doc(id)
.update({

isDeleted:true,

deletedAt:
firebase.firestore.FieldValue.serverTimestamp()

});

await this.logActivity(
'KIT_MOVED_TO_TRASH',
{
productId:id
}
);

this.showToast(
'warning',
'KIT MOVED',
'Kit moved to Trash'
);

}

catch(error){

console.error(error);

this.showToast(
'error',
'DELETE FAILED',
'Failed to move kit'
);

}

},

async restoreKit(product){

try{

await this.db
.collection('products')
.doc(product.id)
.update({

isDeleted:false,

deletedAt:null

});

await this.logActivity(
'KIT_RESTORED',
{
productId:product.id,
name:product.name
}
);

this.showToast(
'success',
'KIT RESTORED',
product.name + ' restored'
);

}

catch(error){

console.error(error);

this.showToast(
'error',
'RESTORE FAILED',
error.message
);

}

},

async permanentlyDeleteKit(product){

try{

const confirmDelete =
prompt(
'Type DELETE to permanently remove this kit'
);

if(confirmDelete !== 'DELETE'){
return;
}

await this.db
.collection('products')
.doc(product.id)
.delete();

await this.logActivity(
'KIT_PERMANENTLY_DELETED',
{
productId:product.id,
name:product.name
}
);

this.showToast(
'error',
'KIT REMOVED',
'Kit permanently deleted'
);

}

catch(error){

console.error(error);

this.showToast(
'error',
'DELETE FAILED',
error.message
);

}

},

async quickRestock(product,amount){

try{

await this.db
.collection('products')
.doc(product.id)
.update({

stock:(Number(product.stock)||0)+amount,

updatedAt:
firebase.firestore.FieldValue.serverTimestamp()

});

await this.logActivity(
'KIT_RESTOCKED',
{
product:product.name,
added:amount
}
);

this.showToast(
'success',
'STOCK UPDATED',
`${product.name} stock increased by ${amount}`
);

}

catch(error){

console.error(error);

this.showToast(
'error',
'RESTOCK FAILED',
'Failed to update stock'
);

}

}

};

}
