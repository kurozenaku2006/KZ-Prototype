function claimMethods(){

return {

 filteredClaims(){

  let filtered = this.claims;

  if(this.claimFilter !== 'all'){

    filtered = filtered.filter(
      c => c.status === this.claimFilter
    );

  }

  if(this.claimSearch){

    filtered = filtered.filter(c =>

      (c.customerName || '')
      .toLowerCase()
      .includes(this.claimSearch.toLowerCase())

      ||

      (c.productName || '')
      .toLowerCase()
      .includes(this.claimSearch.toLowerCase())

      ||

      (c.contact || '')
      .toLowerCase()
      .includes(this.claimSearch.toLowerCase())

      ||

      (c.phone || '')
      .toLowerCase()
      .includes(this.claimSearch.toLowerCase())

    );

  }

  return filtered;

},

    pendingClaims(){
      return this.claims.filter(c => c.status === 'pending');
    },

    approvedClaims(){
      return this.claims.filter(c => c.status === 'approved');
    },

    rejectedClaims(){
      return this.claims.filter(c => c.status === 'rejected');
    },

    openClaimModal(claim){

  this.selectedClaim = claim;

  this.showClaimModal = true;

},

 async updateClaimStatus(claim,newStatus){

const actionKey = claim.id + '_' + newStatus;

if(this.processingButtons[actionKey]){
  return;
}

this.processingButtons[actionKey] = true;
      
      try{

        await this.db.runTransaction(async transaction => {

          const claimRef =
          this.db.collection('claims').doc(claim.id);

          const claimDoc =
          await transaction.get(claimRef);

          if(!claimDoc.exists){
            throw new Error('Claim not found');
          }

          const claimData = claimDoc.data();

          const oldStatus =
          claimData.status || 'pending';

          if(oldStatus === newStatus){
            return;
          }


          if(!claimData.productId){
  throw new Error('Missing product ID');
}

const productRef =
this.db.collection('products')
.doc(claimData.productId);

          const productDoc =
          await transaction.get(productRef);

         if(!productDoc.exists){
  throw new Error('Product not found');
}

const productData =
productDoc.data();
          
          let stock =
          Number(productData.stock || 0);

          if(
            oldStatus !== 'approved'
            &&
            newStatus === 'approved'
          ){

            if(stock <= 0){
              throw new Error('Out of stock');
            }

            stock -= 1;

          }

          if(
            oldStatus === 'approved'
            &&
            newStatus !== 'approved'
          ){

            stock += 1;

          }

          transaction.update(productRef,{
            stock,
            updatedAt:
            firebase.firestore.FieldValue.serverTimestamp()
          });

        transaction.update(claimRef,{

  status:newStatus,

  orderStatus:
    newStatus === 'approved'
      ? 'approved'
      : firebase.firestore.FieldValue.delete(),

  updatedAt:
  firebase.firestore.FieldValue.serverTimestamp()

});

        });

        // CREATE SALES RECORD
if(
  claim.status !== 'approved' &&
  newStatus === 'approved'
){

  await this.db.collection('sales').add({

    claimId:claim.id,

    productId:claim.productId || '',

    productName:claim.productName || '',

    customerName:claim.customerName || '',

    amount:Number(claim.price || 0),

    createdAt:
    firebase.firestore.FieldValue.serverTimestamp()

  });

}

// REMOVE SALES RECORD IF APPROVAL REVERTED

if(
  claim.status === 'approved' &&
  newStatus !== 'approved'
){

  const salesSnapshot =
  await this.db
  .collection('sales')
  .where('claimId','==',claim.id)
  .get();

  const deletePromises = [];

  salesSnapshot.forEach(doc => {

    deletePromises.push(
      doc.ref.delete()
    );

  });

  await Promise.all(deletePromises);

}
        

        this.showClaimModal = false;
this.selectedClaim = null;

        await this.logActivity(
  'CLAIM_STATUS_UPDATED',
  {
    customer:claim.customerName,
    product:claim.productName,
    oldStatus:claim.status,
    newStatus
  }
);

         this.showToast(
  newStatus === 'approved'
    ? 'success'
    : newStatus === 'rejected'
    ? 'warning'
    : 'info',

  `CLAIM ${newStatus.toUpperCase()}`,

  `${claim.customerName}'s claim updated`
);

      }

             catch(error){

        console.error(error);
this.showToast(
  'error',
  'ACTION FAILED',
  error.message
);
        
      }

      finally{

  delete this.processingButtons[actionKey];

      }

    },
 
    async moveClaimToBin(claim){

      if(this.processingClaims[claim.id]){
        return;
      }

      const confirmDelete =
      confirm('Move claim to bin?');

      if(!confirmDelete){
        return;
      }

      this.processingClaims[claim.id] = true;

      try{

        await this.db.runTransaction(async transaction => {

          const claimRef =
          this.db.collection('claims')
          .doc(claim.id);

          const claimDoc =
          await transaction.get(claimRef);

          if(!claimDoc.exists){
            throw new Error('Claim already deleted');
          }

          const claimData =
          claimDoc.data();

          if(
  claimData.status === 'approved'
  &&
  claimData.productId
){

  const productRef =
  this.db.collection('products')
  .doc(claimData.productId);

  const productDoc =
  await transaction.get(productRef);

  if(productDoc.exists){

    transaction.update(productRef,{
      stock:
      Number(productDoc.data().stock || 0) + 1
    });

  }

}

                   const binRef =
          this.db.collection('claimBin')
          .doc();

          transaction.set(binRef,{

            ...claimData,

            originalClaimId:claim.id,

            deletedAt:
            firebase.firestore.FieldValue.serverTimestamp()

          });

          transaction.delete(claimRef);

        });

        await this.logActivity(
  'CLAIM_MOVED_TO_BIN',
  {
    customer:claim.customerName,
    product:claim.productName,
    status:claim.status
  }
);

this.showToast(
  'warning',
  'CLAIM DELETED',
  'Claim moved to bin'
);

      }

      catch(error){

        console.error(error);
        alert(error.message || 'Delete failed');

      }

      finally{

        delete this.processingClaims[claim.id];

      }

    },
 async restoreClaim(claim){

  try{

    await this.db.runTransaction(async transaction => {

      const binRef =
      this.db.collection('claimBin')
      .doc(claim.id);

      const restoredRef =
      this.db.collection('claims')
      .doc(claim.originalClaimId || claim.id);

      const {
        deletedAt,
        originalClaimId,
        ...cleanClaim
      } = claim;

      transaction.set(
        restoredRef,
        cleanClaim
      );

      transaction.delete(binRef);

      // STOCK FIX

      if(
        cleanClaim.status === 'approved'
        &&
        cleanClaim.productId
      ){

        const productRef =
        this.db.collection('products')
        .doc(cleanClaim.productId);

        const productDoc =
        await transaction.get(productRef);

        if(productDoc.exists){

          const currentStock =
          Number(productDoc.data().stock || 0);

          transaction.update(productRef,{
            stock:Math.max(0,currentStock - 1)
          });

        }

      }

    });

    await this.logActivity(
      'CLAIM_RESTORED',
      {
        customer:claim.customerName,
        product:claim.productName
      }
    );

    this.showToast(
      'success',
      'CLAIM RESTORED',
      'Claim returned to active claims'
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

async permanentlyDeleteClaim(claim){

  try{

    const confirmDelete =
   prompt(
'Type DELETE to permanently remove this claim'
);
    
   if(confirmDelete !== 'DELETE'){
  return;
}

    await this.db
    .collection('claimBin')
    .doc(claim.id)
    .delete();

    await this.logActivity(
      'CLAIM_PERMANENTLY_DELETED',
      {
        customer:claim.customerName,
        product:claim.productName,
        status:claim.status
      }
    );

    this.showToast(
      'error',
      'PERMANENT DELETE',
      'Claim permanently removed'
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

}

}; 

}
