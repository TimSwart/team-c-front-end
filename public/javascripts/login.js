/**
 * Created by Trevor on 6/26/2015.
 */
function sendAuth() {

    $(document).ready(function () {
        var user, pass;

        user = $("#username").val();
        pass = $("#password").val();
        var host = window.apiRoute + "/login/";

        $.post(host, {user: user, password: pass},
            function (data) {
                var cookie = data; //req.cookies.auth

                if (data != "Invalid Credentials!") {

                    alert("login success");
                }

                if (data == "Invalid Credentials!") {
                    alert("Invalid Credentials!");
                }
            }
        );
        $("#username").val("");
        $("#password").val("");
    });
}