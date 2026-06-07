function activityMethods(){

return {

async logActivity(action,details={}){

try{

const user=
firebase.auth().currentUser;

await this.db
.collection('activityLogs')
.add({

action,

details,

adminEmail:
user?.email || 'Unknown',

createdAt:
firebase.firestore
.FieldValue
.serverTimestamp()

});

}

catch(error){

console.error(
'Activity log failed:',
error
);

}

}

};

}
