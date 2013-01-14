/*****************************************************************************
  CONTROLS THE REGISTRATION INTERFACE
*****************************************************************************/

// DEVELOPER OPTIONS
var DEV_MODE = false;
var apiBaseURL = 'http://register.tartanhacks.com/api/';

// SET UP THE INTIAL SCREEN
$(function(){ 
  // Identify grouped elements in the interface
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
  PRIMARY LOGIC
*****************************************************************************/

// Make API call to get registration availability.
function getRegistrationTypes(callback){
  if (DEV_MODE){
    callback({
      "PRE": {"active": true, "remaining": 75}, 
      "EXT": {"active": true, "remaining": 50}, 
      "GRAD": {"active": true, "remaining": 4}, 
      "GEN": {"active": false, "remaining": 100}
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
  $ticket.find('.remaining').html(ticketsAvailable +  " Tickets Left");
}

// Given the registration status, active the given ticket types. 
function handleTicketAvailability(regStatus){
  console.log(regStatus);
  var genTicketAvailable = regStatus.PRE.remaining + regStatus.GEN.remaining;

  $ticketGroup.show();

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
      $('.ribbon').html("<strong>Hey there early bird.</strong> Just a few quick questions and you're all done.");
      isUndergrad();
    }else {
      alert('To register now, select at least one checkbox.')
      // GENERAL REGISTRATION IS NOT YET OPEN 
    }
    return false;
  });
}

function isGen(){
  regType = 'GEN';
  $('.ribbon').html("<strong>Woohoo! </strong>Just a couple quick questions.");
  isUndergrad();
}

function isUndergrad(){
  $groups.hide();
  $formGroup.show();
  $('.noncmu').remove();
  $('.gradOnly').remove();
  $('select').uniform();
  $('#first_name').focus();
  $('input[type=text], input[type=email]').blur(function(){
    jsfvRealtime(this);
  });
  $('input').change(function(){
    if (validateForm() == true){
      $('#submit').removeClass('inactive');
    }else{
      $('#submit').addClass('inactive');
    }
  });
}

function isGrad(){
  regType = 'GRAD';
  $groups.hide();
  $formGroup.show();
  $('.ribbon').html("Just a few more questions. Remember, <strong>Grad students cannot win prizes</strong>");
  $('.noncmu').remove();
  $('select').uniform();
  $('#first_name').focus();

  $('input[type=text], input[type=email]').blur(function(){
    jsfvRealtime(this);
  });
  $('input').change(function(){
    if (validateForm() == true){
      $('#submit').removeClass('inactive');
    }else{
      $('#submit').addClass('inactive');
    }
  });
}

function isOutside(){
  regType = 'EXT';
  $groups.hide();
  $formGroup.show();
   $('.ribbon').html("<strong>Just a few quick questions.</strong> We're thrilled about your upcoming visit to CMU.");
  $('.cmuOnly').remove();
  $('.gradOnly').remove();
  $('select').uniform();
  $('#first_name').focus();
  $('input[type=text], input[type=email]').blur(function(){
    jsfvRealtime(this);
  });
  $('input').change(function(){
    if (validateForm() == true){
      $('#submit').removeClass('inactive');
    }else{
      $('#submit').addClass('inactive');
    }
  });
}

function submitForm(){
  if (validateForm() == true){
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
          if (data.waitlist == false) {
            successMessage();
          } else {
            waitlistMessage();
          }
      },
      error: function(data){
        alert('An error occurred.');
        console.log(data);
      }
    });
  }else{
    alert("Make sure you correctly fill in all fields, and check all checkboxes.")
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
  $('.ribbon').html("<strong>Congrats,</strong> you've been successfully registered.")
  $successGroup.show();
}

function waitlistMessage(){
  $groups.hide();
  $('header').hide();
  $('.ribbon').html("<strong>Sorry,</strong> you've been added to the waitlist.")
  $waitlistGroup.show();
}