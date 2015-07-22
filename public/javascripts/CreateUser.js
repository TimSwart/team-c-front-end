jQuery('#createUser').submit(function(){
    var toPass = {
        "username":jQuery('#username').val(),
        "password":jQuery('#password').val(),
        "email":jQuery('#email').val(),
        "firstName":jQuery('#first').val(),
        "lastName":jQuery('#last').val()
    };
    //console.log(toPass);
    navigation.postJSON(window.apiRoute+'/login/createUser/', toPass, function(err, res){
        if(res) {
            window.alert("Please check your email for an account creation confirmation.");
        }
    });
});
