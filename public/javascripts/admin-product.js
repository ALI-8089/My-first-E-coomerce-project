$('#product-spec').hide()

$('#dis-ena-btn').click(function () {
  var $this = $(this)
  $this.toggleClass('dis-ena-btn')
  if ($this.hasClass('dis-ena-btn')) {
    $this.text('Exit spec').show().prop('disabled', false)
    $('#product-spec').show()

    $('#first-submit').hide()
  } else {
    $this.text('Add spec')
    $('#product-spec').hide()
    $('#first-submit').show()
  }
})
// let color = document.getElementById("colorName").value

//      document.getElementById('color-box').style.color=color

function addToCart(proId) {
  $.ajax({
    url: '/add-to-cart/' + proId,
    method: 'get',
    success: (response) => {
      if (response.login) {
        let count = $('#cart-count').html()
        count = parseInt(count) + 1
        $('#cart-count').html(count)
      } else {
        location.href = '/guest-empty-cart'
      }
    },
  })
}

function changeQuantity(cartId, proId, userId, count) {
  let quantity = parseInt(document.getElementById(proId).innerHTML)
  count = parseInt(count)
  if (count == -1 && quantity == 1) {
    if (confirm('r u want to deleter product')) {
      $.ajax({
        url: '/change-product-quantity',
        data: {
          user: userId,
          cart: cartId,
          product: proId,
          count: count,
          quantity: quantity,
        },
        method: 'post',
        success: (response) => {
          if (response.removeProduct) {
            location.reload()
          } else {
            document.getElementById(proId).innerHTML = quantity + count
            document.getElementById('total').innerHTML = response.total
          }
        },
      })
    }
  } else {
    $.ajax({
      url: '/change-product-quantity',
      data: {
        user: userId,
        cart: cartId,
        product: proId,
        count: count,
        quantity: quantity,
      },
      method: 'post',
      success: (response) => {
        if (response.removeProduct) {
          location.reload()
        } else {
          document.getElementById(proId).innerHTML = quantity + count
          document.getElementById('total').innerHTML = response.total
        }
      },
    })
  }
}

function deleteCartProduct(cartId, proId) {
  if (confirm('r u want to delete')) {
    $.ajax({
      url: '/delete-cart-product',
      data: {
        cart: cartId,
        product: proId,
      },
      method: 'post',
      success: (response) => {
        if (response.removeProduct) {
          location.reload()
        }
      },
    })
  }
}

$('#checkout-form').submit((e) => {
  e.preventDefault()
  $.ajax({
    url: '/place-order',
    method: 'post',
    data: $('#checkout-form').serialize(),
    success: (response) => {
      if (response.codSuccess) {
        $('#exampleModal').modal('show')
        $('#exampleModal').on('hidden.bs.modal', function () {
          location.href = '/orders'
        })
      } else {
        let result = razorpayPayment(response, () => {
          if (!result) {
            location.href = '/orders'
          }
        })
      }
    },
  })
})

function razorpayPayment(order) {
  var options = {
    key: 'rzp_test_AOR6LcLadTlBtS', // Enter the Key ID generated from the Dashboard
    amount: order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
    currency: 'INR',
    name: 'CycMaster',
    description: 'Test Transaction',
    image: 'https://example.com/your_logo',
    order_id: order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
    handler: function (response) {
      verifyPayment(response, order)
    },

    prefill: {
      name: 'Gaurav Kumar',
      email: 'gaurav.kumar@example.com',
      contact: '9999999999',
    },
    notes: {
      address: 'Razorpay Corporate Office',
    },
    theme: {
      color: '#3399cc',
    },
  }
  var rzp1 = new Razorpay(options)
  rzp1.open()
}
function verifyPayment(payment, order) {
  $.ajax({
    url: '/verify-payment',
    data: {
      payment,
      order,
    },
    method: 'POST',
    success: (response) => {
      if (response.status) {
        $('#exampleModal').modal('show')
        $('#exampleModal').on('hidden.bs.modal', function () {
          location.href = '/orders'
        })
      } else {
        alert('')
      }
    },
  })
}
// ******************admin*************

$(document).ready(function () {
  $('#table_id').DataTable()
})

$(document).ready(function () {
  $('#add-btn').click(function () {
    let value = $('#input').val()
    $('#type').append(new Option(value), value)
  })
})
// function blockUser(userId){
// $.ajax({
// url:'/admin/block-user',
// data:{
//   userId:userId
// },
// method:'post',
// success:(response) => {
//   alert("hi")
//   if(response){
//     $('#block-btn').html("Blocked")

//   }

// }
// })
// }
