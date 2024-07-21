// GLOBAL VARIABLES.
var number_of_users = lightdm.users.length; // Holds the number of users.
var selected_user_index = 1;                // Holds the index of the currently selected user.

// Name: 'select_user_from_list'
// Role: Display the selected user's profile picture and configure LightDM for a new login attempt for that user.
// Note: Since 'idx' is zero-indexed, you must pass 'selected_user_index - 1' in all calls to this function.
function select_user_from_list(idx, update) {
    if (update === true) {
        // Display the selected user's name and profile picture.
        update_display(idx);
    }

    // If authentication had commenced for a previously-selected user, cancel it.
    if (lightdm.authentication_user) {
        lightdm.cancel_authentication();
    }

    // Cancel automatic login.
    lightdm.cancel_autologin();

    // Commence authentication for the selected user.
    lightdm.authenticate(lightdm.users[idx].username);

    // Place the cursor in the password text input field.
    document.getElementById("login-password").focus();
}

// Name: 'update_display'
// Role: Update the displayed username and profile picture to that of the selected user.
// Note: Since 'idx' is zero-indexed, you must pass 'selected_user_index - 1' in all calls to this function.
function update_display(idx) {
    // Store the new user's display name.
    var username = lightdm.users[idx].display_name;

    // Make the current profile picture and display name invisible.
    document.getElementById("login-picture").style.opacity = 0;
    document.getElementById("username").style.opacity = 0;

    // After a delay of 350 milliseconds, run the function.
    setTimeout(function() {
        // Update the display name.
        document.getElementById('username').innerText = username;

        // Update the profile picture.
        $('#login-picture').attr('src',lightdm.users[idx].image);

        // Check if the image loaded successfully.
        $('#login-picture').on('error', function() {
            // Use default profile picture if the image fails to load.
            $(this).attr('src', 'static/Default.svg');
        });

        // Run once the new profile picture has loaded.
        document.getElementById("login-picture").addEventListener("load", function() {
            // Make the new profile picture visible.
            document.getElementById("login-picture").style.opacity = 1;
            
            // Make the new display name visible.
            document.getElementById("username").style.opacity = 1;
        });
    }, 350);
}

// Name: 'provide_secret'
// Role: Try authenticating by sending the password entered by the user to LightDM.
function provide_secret() {
    // Set the password to 'null' if a falsy value is entered.
    var password = document.getElementById("login-password").value || null;

    // Attempt to login if the entered password is not 'null'.
    if (password !== null) {
        lightdm.respond(password);
    }
}

// Name: 'authentication_complete'
// Role: Exit the greeter or display an incorrect password animation, depending on whether authentication was successful.
function authentication_complete() {
    if (lightdm.is_authenticated) {
        //lightdm.login (lightdm.authentication_user, lightdm.default_session); //lightdm-webkit-greeter
        //lightdm.login (lightdm.authentication_user, lightdm.start_session_sync, 'gnome'); //lightdm-webkit2-greeter
        lightdm.start_session(lightdm.default_session);
    } else {
        // Implement a macOS-style shaking animation for the password input field to indicate an incorrect password entry.
        document.getElementById("login-password").classList.add("shake");

        // Remove the shaking animation after it has played once.
        document.getElementById("login-password").addEventListener("animationend", function() {
            document.getElementById("login-password").classList.remove("shake");
        }, {once:true});

        // Prepare for another login attempt for the same user.
        select_user_from_list(selected_user_index - 1, false);
    }
}

// Name: 'init'
// Role: Set up the greeter by defining event handlers for login screen elements.
function init() {
    // Connect the LightDM event 'authentication_complete' to the callback function 'authentication_complete' to run following a successful login.
    lightdm.authentication_complete.connect(authentication_complete);

    // Select the first user within the list of users.
    select_user_from_list(0, true);

    // Enable the 'next' and 'previous' buttons if there are at least two users on the system.
    if (number_of_users >= 2) {
        document.getElementById('next').style.opacity = '1';
        document.getElementById('next').style.pointerEvents = 'auto';
        document.getElementById('prev').style.opacity = '1';
        document.getElementById('prev').style.pointerEvents = 'auto';
    }

    // Handle click event on element with the ID 'prev'.
    $("#prev").on('click', function(e) {
        // Decrement the selected user index.
        selected_user_index--;

        // If required, underflow by looping back to the final user's index.
        if (selected_user_index == 0) {
            selected_user_index = number_of_users;
        }

        // The selected user will only change if there are two or more users on the system.
        if (number_of_users >= 2) {
            // Clear the password field.
            document.getElementById("login-password").value = "";
            
            // Select the new user.
            select_user_from_list(selected_user_index - 1, true);
        }
    });

    // Handle click event on element with the ID 'next'.
    $("#next").on('click', function(e) {
        // Increment the selected user index.
        selected_user_index++;

        // If required, overflow by looping back to the first user's index.
        if (selected_user_index > number_of_users) {
            selected_user_index = 1;
        }

        // The selected user will only change if there are two or more users on the system.
        if (number_of_users >= 2) {
            // Clear the password field.
            document.getElementById("login-password").value = "";

            // Select the new user.
            select_user_from_list(selected_user_index - 1, true);
        }
    });
}

// Initialise the greeter.
init();
