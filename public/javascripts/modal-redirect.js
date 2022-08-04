$(document).ready(function () {
  $('#fname-error-message').hide()
  $('#lname-error-message').hide()
  $('#eamil-error-message').hide()
  $('#password-error-message').hide()
  $('#confirm-error-message').hide()

  let fnameError = false
  let lnameError = false
  let emailError = false
  let passwordError = false
  let confirmError = false

  $('#form-fname').focusout(() => {
    checkFname()
  })
  $('#form-lname').focusout(() => {
    checkLname()
  })
  $('#form-email').focusout(() => {
    checkEmail()
  })
  $('#form-password').focusout(() => {
    checkPassword()
  })
  $('#form-confirm').focusout(() => {
    checkConfirm()
  })

  function checkFname () {
    const pattern = /^[a-zA-Z]*$/
    const fname = $('#form-fname').val()
    if (pattern.test(fname) && fname !== '') {
      $('#fname-error-message').hide()
      $('#form-fname').css('border', '2px solid #34F458')
      fnameError = false
    } else {
      $('#fname-error-message').html(
        'Please enter fistname and should contain characters only',
      )
      $('#fname-error-message').show()
      $('#form-fname').css('border', '2px solid #f90A0A')
      fnameError = true
    }
  }

  function checkLname () {
    const pattern = /^[a-zA-Z]*$/
    const lname = $('#form-lname').val()
    if (pattern.test(lname) && lname !== '') {
      $('#lname-error-message').hide()
      $('#form-lname').css('border', '2px solid #34F458')
      lnameError = false
    } else {
      $('#lname-error-message').html(
        'Please enter lastname and should contain characters only',
      )
      $('#lname-error-message').show()
      $('#form-lname').css('border', '2px solid #f90A0A')
      lnameError = true
    }
  }

  function checkEmail() {
    const pattern = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/
    const email = $('#form-email').val()
    if (pattern.test(email) && email !== '') {
      $('#email-error-message').hide()
      $('#form-email').css('border', '2px solid #34F458')
      emailError = false
    } else {
      $('#email-error-message').html('Please enter valid Email Id ')
      $('#email-error-message').show()
      $('#form-email').css('border', '2px solid #f90A0A')
      emailError = true
    }
  }

  function checkPassword() {
    const pattern = $('#form-password').val().length
    if (pattern > 3) {
      $('#password-error-message').hide()
      $('#form-password').css('border', '2px solid #34F458')
      passwordError = false
    } else {
      $('#password-error-message').html(
        'Enter password and atleat 4 characters',
      )
      $('#password-error-message').show()
      $('#form-password').css('border', '2px solid #f90A0A')
      passwordError = true
    }
  }
  function checkConfirm () {
    const password = $('#form-password').val()
    const confirmPassword = $('#form-confirm').val()
    if (password === confirmPassword && confirmPassword !== '') {
      $('#confirm-error-message').hide()
      $('#form-confirm').css('border', '2px solid #34F458')
      confirmError = false
    } else {
      $('#confirm-error-message').html(
        'Re-enter password and it should be matching',
      )
      $('#confirm-error-message').show()
      $('#form-confirm').css('border', '2px solid #f90A0A')
      confirmError = true
    }
  }

  $('#login-form').submit(function () {
    // eslint-disable-next-line no-undef
    checkEmail()
    checkPassword()

    if (emailError === false && passwordError === false) {
      return true
    } else {
      return false
    }
  })
  $('#signup-form').submit(function () {
    checkFname()
    checkLname()
    checkEmail()
    checkPassword()
    checkConfirm()
    if (
      fnameError === false &&
      lnameError === false &&
      emailError === false &&
      passwordError === false &&
      confirmError === false
    ) {
      return true
    } else {
      return false
    }
  })
})
