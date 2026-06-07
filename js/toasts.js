function toastMethods(){

return {

showToast(type,title,message){

  const id=Date.now();

  this.toasts.push({
    id,
    type,
    title,
    message
  });

  setTimeout(()=>{

    this.removeToast(id);

  },3500);

},

removeToast(id){

  this.toasts=
  this.toasts.filter(
    t=>t.id!==id
  );

}

};

}
