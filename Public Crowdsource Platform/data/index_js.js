var db = firebase.firestore();
function validateEmail(email_passed) {
    var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(String(email_passed).toLowerCase());
    /*reference stackoverflow*/ 
}
function signup() {    
    var signup_email = document.getElementById("signup_email").value;
    var signup_password = document.getElementById("signup_password").value;
    //var signup_fullname = document.getElementById("signup_fullname").value;
    //var signup_batch = document.getElementById("signup_batch").value;

    if (signup_email===""||signup_password==="")//||signup_fullname===""||signup_batch==="") 
    {
        document.getElementById("err_show2").innerHTML="Please fill all fields.";
        document.getElementById("signup_fullname").focus();
    } else
     {
        
        if (true) 
        {
                if (signup_password.length>=6) 
                {
                    document.getElementById("err_show2").innerHTML="";
                    firebase.auth().createUserWithEmailAndPassword(signup_email, signup_password).then((user)=>{                      
                    }).catch(function(error) {
                            // Handle Errors here.
                            var errorCode = error.code;
                            var errorMessage = error.message;
                            console.log(errorCode);
                            console.log(errorMessage);
                            console.log(error);
                            if (errorCode=="auth/email-already-in-use") {
                                    document.getElementById("err_show2").innerHTML="Use another email";
                            }

                         

                            if(error){
                                console.log("Not Writing");
                                document.getElementById("err_show2").innerHTML=errorMessage;
                            } 
                            
                            
                            }); 
                                                            
                                                
                       
                }   
                else 
                {
                    document.getElementById("err_show2").innerHTML="Check Password Length";
                }
        }
        else 
        {
            document.getElementById("signup_fullname").focus();
            document.getElementById("err_show2").innerHTML="Enter valid email";
        }
        
     }
    };
    
    function login() 
    {
        var login_email = document.getElementById("login_email").value;
        var login_password = document.getElementById("login_password").value;
        if (login_email=="" || login_password=="") 
        {
            document.getElementById("err_show1").innerHTML="Please fill all fields.";            
        } else
         {            
            if (true) 
            {
                firebase.auth().signInWithEmailAndPassword(login_email, login_password).catch(function(error) {
                    document.getElementById("err_show1").innerHTML="";
                    // Handle Errors here.
                    var errorCode = error.code;
                    var errorMessage = error.message;                    
                        if(error){
                            document.getElementById("err_show1").innerHTML=errorMessage;
                        }
                    // ...
                    });
            }
            else 
            {
                document.getElementById("reginput_email").focus();
                document.getElementById("err_show1").innerHTML="Enter valid email";
            }
            
         }
    }