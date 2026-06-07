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

pendingClaims(){ ... },

approvedClaims(){ ... },

rejectedClaims(){ ... },

revenue(){ ... },

openClaimModal(claim){ ... },

updateClaimStatus(claim,newStatus){ ... },

moveClaimToBin(claim){ ... },

restoreClaim(claim){ ... },

permanentlyDeleteClaim(claim){ ... }

};

}
