function authMethods(){

return {

async logout(){

  await this.logActivity(
    'ADMIN_LOGOUT',
    {}
  );

  await firebase.auth().signOut();

  window.location.href='login.html';

},

setupAuth(){

const auth = firebase.auth();

auth.onAuthStateChanged(user=>{

  if(!user){
    window.location.href='login.html';
    return;
  }

  const adminEmails=[
    'vedantbhalge2006@gmail.com'
  ];

  if(!adminEmails.includes(user.email)){

    alert('Access denied');

    firebase.auth().signOut();

    window.location.href='login.html';

    return;
  }

  if(!this._loginLogged){

    this._loginLogged=true;

    this.logActivity(
      'ADMIN_LOGIN',
      {
        email:user.email
      }
    );

  }

});

}

};

}
