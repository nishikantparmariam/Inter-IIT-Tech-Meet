 
var firebaseConfig = {
    apiKey: "AIzaSyAwnvDMnuTHJYzvECDh9qf_iYqYEwVEM-k",
    authDomain: "roadly-8e2fe.firebaseapp.com",
    databaseURL: "https://roadly-8e2fe.firebaseio.com",
    projectId: "roadly-8e2fe",
    storageBucket: "roadly-8e2fe.appspot.com",
    messagingSenderId: "937812971686",
    appId: "1:937812971686:web:420cafc6433c9d6a262467",
    measurementId: "G-E8NQRG6J9Y"
  };  
  firebase.initializeApp(firebaseConfig);
  
  firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    //firebase_user = user;//["user"];
    user_id = user["uid"]; 
    firebaseUser = user;
    var db = firebase.firestore();
    var docRef = db.collection("users").doc(firebaseUser["uid"]);    
    docRef.get().then(function(doc) {
        if (doc.exists) {
            firebaseUserData = doc.data();               
            checkForRealTime();
            console.log(firebaseUserData);                  
        } else {                          
            //check if it is a contractor

            var docRef2 = db.collection("contractors").doc(firebaseUser["uid"]);    
            docRef2.get().then(function(doc) {
                if (doc.exists) {
                    firebaseUserData = doc.data();   
                    console.log(firebaseUserData);   

                } else {                                              
                    
                    document.getElementById('askFordisplayName').style.cssText="display:block !important;";         
                }
            }).catch(function(error) {
                console.log("Error getting document:", error);
                
            });



           // document.getElementById('askFordisplayName').style.cssText="display:block !important;";         
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
        
    }); 
  
    if (file_code==="a") {  
    window.location="home.html";  //will pass our actual home domain after hosting  
    } 
  } else {
    if (file_code==="b")
    { 
    window.location="index.html"; //will pass our actual domain after hosting    
    }
  } 
 
});

function userSignOut() {
    firebase.auth().signOut().then(function() {
       
      window.location="index.html"; //will pass our actual domain after hosting    
      }).catch(function(error) {
          window.alert('Error')
      });
    }