/*****************************************************************************
  CONTROLS THE REGISTRATION INTERFACE
*****************************************************************************/

// DEVELOPER OPTIONS
var DEV_MODE = false;
var apiBaseURL = 'http://register.tartanhacks.com/api/';

// SET UP THE INTIAL SCREEN
$(function(){ 
  // Identify grouped elements in the interface. So beautiful </s>.
  $groups = $('.group');
  $ticketGroup = $($groups[0]);
  $preRegisterGroup = $($groups[1]);
  $formGroup = $($groups[2]);
  $successGroup = $($groups[3]);
  $waitlistGroup = $($groups[4]);

  $("input[type=checkbox], option").uniform();
  $groups.hide();
  getRegistrationTypes(handleTicketAvailability);
});


/*****************************************************************************
  USER FACING MESSAGES
*****************************************************************************/

var appMessages = {

  // Messages to be shown before a user picks a ticket category

  not_begun:
    "<strong>Registration has not yet begun. </strong>" + 
    "Check below to see when you can register.",

  only_preReg:
    "<strong>Preregistration is now open. </strong>" +
    "Check below to see when you can register.",

  gen_regis_started:
    "<strong>Undergrad registration is now open. </strong>" +
    "Check below to see when you can register.",

  everything_started:
    "<strong>Registration is now open. </strong>",

  // Messages to be shown while user is filling out form

  preregister_ribbon :
    "<strong>Hey there early bird.</strong> " + 
    "Just a few quick questions and you're all done.",

  genregister_ribbon: 
    "<strong>Woohoo! </strong>Just a couple quick questions.",

  gradregister_ribbon:
    "Just a few more questions. Remember, " +
    "<strong>Grad students cannot win prizes</strong>",

  extregister_ribbon:
    "<strong>Just a few quick questions. </strong>" +
    "We're thrilled about your upcoming visit to CMU.",

  // Messages to be shown after form has been submitted

  registered_success:
    "<strong>Congrats,</strong> you've been successfully registered.",

  registered_waitlist:
    "<strong>Sorry,</strong> you've been added to the wait list.",

};


/*****************************************************************************
  PRIMARY LOGIC
*****************************************************************************/

// Make API call to get registration availability.
function getRegistrationTypes(callback){
  if (DEV_MODE){
    callback({
      "PRE": {"active": true, "remaining": 75}, 
      "EXT": {"active": false, "remaining": 50}, 
      "GRAD": {"active": false, "remaining": -3}, 
      "GEN": {"active": true, "remaining": 100}
    });
  }else{
    $.ajax({
      type: 'GET', 
      url: apiBaseURL + 'active_registration_types', 
      success: callback
    });
  }
}

// Set ticket type to available, set ticket count, and click event.
function activateTicketOption(elementID, ticketsAvailable, clickEvent){
  var $ticket =  $('#' + elementID);
  $ticket.removeClass('inactive');
  $ticket.click(clickEvent);

  var ticketMessage;
  if (ticketsAvailable > 0){
    ticketMessage = ticketsAvailable +  " Tickets Left";
  }else{
    ticketMessage = "Join Waitlist"; 
  }
  $ticket.find('.remaining').html(ticketMessage);
}

// Given the registration status, active the given ticket types. 
function handleTicketAvailability(regStatus){
  console.log(regStatus);
  var genTicketAvailable = regStatus.PRE.remaining + regStatus.GEN.remaining;

  $ticketGroup.show();

  if (regStatus.PRE.active == false){
    $('.ribbon').html(appMessages.not_begun);
  }
  else if (regStatus.GEN.active == false){
    $('.ribbon').html(appMessages.only_preReg);
  }
  else if (regStatus.GRAD.active == false || regStatus.EXT.active == false){
    $('.ribbon').html(appMessages.gen_regis_started);
  }else{
    $('.ribbon').html(appMessages.everything_started);
  }

  if (regStatus.PRE.active){
    activateTicketOption('undergrad', genTicketAvailable, isPre);
  }
  if (regStatus.GEN.active){
    activateTicketOption('undergrad', genTicketAvailable, isGen);
  }
  if (regStatus.GRAD.active){
    activateTicketOption('grad', regStatus.GRAD.remaining, isGrad);
  }
  if (regStatus.EXT.active){
    activateTicketOption('outside', regStatus.EXT.remaining, isOutside);
  }
}

// Global string describing the registration type. PRE || GEN || GRAD || EXT
var regType;

function isPre(){
  regType = 'PRE';
  
  // Show the preregistration confirmation prompt.
  $preRegisterGroup.show();
  $('#undergrad').addClass('selected'); 
  
  // Helper functions.
  var isFreshman = function(){ return $('#freshman').is(":checked");};
  var isMember = function(){ return $('#woman').is(":checked");};
  var valid = function(){ return (isFreshman() || isMember());};

  var $next = $('#next');

  $('#freshman, #woman').change(function(){
    if (valid() == true){ $next.removeClass('inactive');}
    else{ $next.addClass('inactive');}
  });

  // Check on submit if the user can preregister.
  $('#next').click(function(){
    if (valid() == true) { 
      $('.ribbon').html(appMessages.preregister_ribbon);
      isUndergrad();
    }else {
      alert('To register now, select at least one check box.')
    }
    return false;
  });
}

function isGen(){
  regType = 'GEN';
  $('.ribbon').html(appMessages.genregister_ribbon);
  isUndergrad();
}

// Styles inputs, binds validation functions, and sets focus to #first_name.
function setUpForm(){
  $('select').uniform();
  $('#first_name').focus();

  // Give color based validation queues
  var validate_input = function(){ jsfvRealtime(this);};
  
  // Adjust color of submit button based on whether form is valid.
  var updateSubmitButton = function(){
    if (validateForm()) $('#submit').removeClass('inactive');
    else $('#submit').addClass('inactive');
  };

  $('input[type=text], input[type=email]').blur(validate_input);
  $('input').change(updateSubmitButton);
}

function isUndergrad(){
  $groups.hide();
  $formGroup.show();
  $('.noncmu').remove();
  $('.gradOnly').remove();
  setUpForm();
}

function isGrad(){
  regType = 'GRAD';
  $groups.hide();
  $formGroup.show();
  $('.ribbon').html(appMessages.gradregister_ribbon);
  $('.noncmu').remove();
  setUpForm();
}

function isOutside(){
  regType = 'EXT';
  $groups.hide();
  $formGroup.show();
   $('.ribbon').html(appMessages.extregister_ribbon);
  $('.cmuOnly').remove();
  $('.gradOnly').remove();
  setUpForm();
}

function submitForm(){
  if (validateForm()){
    $('.btn').addClass('depressed');

    var university = ($('#university')[0] || {}),
        cmuCollege = ($('#cmuCollege')[0] || {});

    $.ajax({
      type: 'POST',
      url: apiBaseURL + 'submit_registration',
      data: {
       'type': regType,
       'firstName': $('#first_name')[0].value,
       'lastName': $('#last_name')[0].value,
       'email': $('#email')[0].value,
       'gradYear': $('#gradYear')[0].value,
       'tshirtSize': $('#tshirtSize')[0].value,
       'dietaryRestriction': $('#dietary')[0].value,
       'university': (university.value || 'CMU'),
       'cmuCollege': (cmuCollege.value || 'NA')
      },
      success: function(data){
        if (data.waitlist) waitlistMessage();
        else successMessage();
      },
      error: function(data){
        alert('An error occurred.');
        console.log(data);
      }
    });
  }else{
    alert("Make sure you fill in all fields and check all check boxes.")
    return false;
  }
}

function validateForm(){
  var invalid = false;
  invalid += !JSFV_validateRequired($('#first_name')[0].value);
  invalid += !JSFV_validateRequired($('#last_name')[0].value);
  invalid += !JSFV_validateEmail($('#email')[0].value);
  invalid += ($('input.required:not(:checked)').length);
  return (invalid == 0);

}

function successMessage(){
  $groups.hide();
  $('header').hide();
  $('.ribbon').html(appMessages.registered_success);
  $successGroup.show();
}

function waitlistMessage(){
  $groups.hide();
  $('header').hide();
  $('.ribbon').html(appMessages.registered_waitlist);
  $waitlistGroup.show();
}