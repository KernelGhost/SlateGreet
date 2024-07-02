var children;
var curr = 1;
var selected_user = null;
var password = null;
var $user = $("#name");
var $pass = $("#login-password");

function show_error() {
    console.log("error")
}

function setup_users_list() {
    var $list = $user;
    var to_append = null;
    $.each(lightdm.users, function (i) {
        var username = lightdm.users[i].name;
        var dispname = lightdm.users[i].display_name;
        $list.append(
            '<div id="'+username+'">'+dispname+'</div>'
        );
    });
    children = $("#name").children().length;
}

function select_user_from_list(idx, err) {
    var idx = idx || 0;
    if (!err) find_and_display_user_picture(idx);
    if (lightdm.authentication_user) lightdm.cancel_authentication();
    selected_user = lightdm.users[idx].username;
    if (selected_user !== null) start_authentication(selected_user);
    $pass.trigger('focus');
}

function start_authentication(username) {
    lightdm.cancel_autologin();
    selected_user = username;
    lightdm.authenticate(username);
}

function authentication_complete() {
    if (lightdm.is_authenticated) {
        //lightdm.login (lightdm.authentication_user, lightdm.default_session); //lightdm-webkit-greeter
        //lightdm.login (lightdm.authentication_user, lightdm.start_session_sync, 'gnome'); //lightdm-webkit2-greeter
        lightdm.start_session(lightdm.default_session);
    } else {
        select_user_from_list(curr-1, true);
        document.getElementById("login-password").classList.add("shake");
        document.getElementById("login-password").addEventListener("animationend", function() {
            document.getElementById("login-password").classList.remove("shake");
        }, {once:true});
    }
}

function find_and_display_user_picture(idx, z) {
    document.getElementById("login-picture").style.opacity = 0;

    setTimeout(function() {
        $('#login-picture').attr(
            'src',
            lightdm.users[idx].image
        );
        document.getElementById("login-picture").addEventListener("load", function() {document.getElementById("login-picture").style.opacity = 1;});
    }, 350);
}

function provide_secret() {
    password = $pass.val() || null;
    if (password !== null) lightdm.respond(password);
}

function init() {
    lightdm.authentication_complete.connect(authentication_complete);
    setup_users_list();
    select_user_from_list(0, false);
    $("#last").on('click', function(e) {
        curr--;
        if (curr <= 0) curr = children;
        if (children != 1) select_user_from_list(curr-1, false);
        $("#name").css("margin-left", -31-(265*(curr-1))+"px");
    });

    $("#next").on('click', function(e) {
        curr++;
        if (curr > children) curr = 1;
        if (children != 1) select_user_from_list(curr-1, false);
        $("#name").css("margin-left", -31-(265*(curr-1))+"px");
    });
}

init();
