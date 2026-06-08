function adminApp() {
  return {

    drawerOpen:false,
    section:'kits',

    claims:[],
    products:[],
    orders:[],
    claimBin:[],
    deletedProducts:[],
    activityLogs:[],
    sales:[],

    init() {

      Auth.init(this);
      Products.init(this);
      Claims.init(this);
      Orders.init(this);
      Activity.init(this);
      Analytics.init(this);

    }

  }
}
