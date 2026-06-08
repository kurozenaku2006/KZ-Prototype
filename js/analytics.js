function analyticsMethods(){

return {

  revenue(){

    return this.approvedClaims()
    .reduce(
      (sum,c)=>
      sum + Number(c.price || 0),
      0
    );

  },

  lowStockCount(){

    return this.products.filter(
      p => Number(p.stock || 0) <= 1
    ).length;

  },

  totalSalesRevenue(){

    return this.sales.reduce(
      (sum,sale)=>
      sum + Number(sale.amount || 0),
      0
    );

  },

  totalSalesCount(){

    return this.sales.length;

  },

  todayRevenue(){

    const today =
    new Date().toDateString();

    return this.sales

    .filter(sale => {

      if(!sale.createdAt){
        return false;
      }

      return new Date(
        sale.createdAt.seconds * 1000
      ).toDateString() === today;

    })

    .reduce(
      (sum,sale)=>
      sum + Number(sale.amount || 0),
      0
    );

  }

};

}
