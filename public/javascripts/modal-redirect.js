$(document).ready(function () {
  $('#fname-error-message').hide()
  $('#lname-error-message').hide()
  $('#eamil-error-message').hide()
  $('#password-error-message').hide()
  $('#confirm-error-message').hide()

  var fname_error = false
  var lname_error = false
  var email_error = false
  var password_error = false
  var confirm_error = false

  $('#form-fname').focusout(() => {
    check_fname()
  })
  $('#form-lname').focusout(() => {
    check_lname()
  })
  $('#form-email').focusout(() => {
    check_email()
  })
  $('#form-password').focusout(() => {
    check_password()
  })
  $('#form-confirm').focusout(() => {
    check_confirm()
  })

  check_fname = () => {
    var pattern = /^[a-zA-Z]*$/
    var fname = $('#form-fname').val()
    if (pattern.test(fname) && fname !== '') {
      $('#fname-error-message').hide()
      $('#form-fname').css('border', '2px solid #34F458')
      fname_error = false
    } else {
      $('#fname-error-message').html(
        'Please enter fistname and should contain characters only',
      )
      $('#fname-error-message').show()
      $('#form-fname').css('border', '2px solid #f90A0A')
      fname_error = true
    }
  }

  check_lname = () => {
    var pattern = /^[a-zA-Z]*$/
    var lname = $('#form-lname').val()
    if (pattern.test(lname) && lname !== '') {
      $('#lname-error-message').hide()
      $('#form-lname').css('border', '2px solid #34F458')
      lname_error = false
    } else {
      $('#lname-error-message').html(
        'Please enter lastname and should contain characters only',
      )
      $('#lname-error-message').show() 
      $('#form-lname').css('border', '2px solid #f90A0A')
      lname_error = true
    }
  } 

  check_email = () => {
    var pattern = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/
    var email = $('#form-email').val()
    if (pattern.test(email) && email !== '') {
      $('#email-error-message').hide()
      $('#form-email').css('border', '2px solid #34F458')
      password_error = false
    } else {
      $('#email-error-message').html('Please enter valid Email Id ')
      $('#email-error-message').show()
      $('#form-email').css('border', '2px solid #f90A0A')
      email_error = true
    }
  }

  function check_password() {
    var pattern = $('#form-password').val().length
    if (pattern > 3) {
      $('#password-error-message').hide()
      $('#form-password').css('border', '2px solid #34F458')
      password_error = false
    } else {
      $('#password-error-message').html(
        'Enter password and atleat 4 characters',
      )
      $('#password-error-message').show()
      $('#form-password').css('border', '2px solid #f90A0A')
      password_error = true
    }
  }
  check_confirm = () => {
    var password = $('#form-password').val()
    var confirm_password = $('#form-confirm').val()
    if (password === confirm_password && confirm_password !== '') {
      $('#confirm-error-message').hide()
      $('#form-confirm').css('border', '2px solid #34F458')
      confirm_error = false
    } else {
      $('#confirm-error-message').html(
        'Re-enter password and it should be matching',
      )
      $('#confirm-error-message').show()
      $('#form-confirm').css('border', '2px solid #f90A0A')
      confirm_error = true
    }
  }

  $('#login-form').submit(function () {
    check_email()
    check_password()

    if (email_error == false && password_error == false) {
     
      return true
    } else {
     
      return false
    }
  })
  $('#signup-form').submit(function() {
    check_fname()
    check_lname()
    check_email()
    check_password()
    check_confirm()
    if (
      fname_error == false &&
      lname_error == false &&
      email_error == false &&
      password_error == false &&
      confirm_error == false
    ) {
     
      return true
    } else {
      
      return false
    }
  })
})
