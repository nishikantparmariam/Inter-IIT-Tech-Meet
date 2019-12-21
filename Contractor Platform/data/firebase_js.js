 
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
 

function userSignOut(){
       
    $('.before_login').fadeIn(300);
    $('.after_login').hide(); //will pass our actual domain after hosting    
}