/* eslint-disable no-unused-vars */
const activePage = window.location.pathname
console.log(window.location.pathname)
document.querySelectorAll('.activity').forEach((link) => {
  if (link.href.includes(`${activePage}`)) {
    link.classList.add('active')
  }
})

$('#product-spec').hide()

$('#dis-ena-btn').click(function () {
  const $this = $(this)
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
        alert('Product added cart')
        let count = $('#cart-count').html()
        count = parseInt(count) + 1
        $('#cart-count').html(count)
      } else {
        location.href = '/guest-empty-cart'
      }
    }
  })
}

function changeQuantity(cartId, proId, userId, count) {
  const quantity = parseInt(document.getElementById(proId).innerHTML)
  count = parseInt(count)
  if (count === -1 && quantity === 1) {
    if (confirm('Are you sure you want to remove this item?')) {
      $.ajax({
        url: '/change-product-quantity',
        data: {
          user: userId,
          cart: cartId,
          product: proId,
          count,
          quantity
        },
        method: 'post',
        success: (response) => {
          if (response.removeProduct) {
            location.reload()
          } else {
            document.getElementById(proId).innerHTML = quantity + count
            document.getElementById('total').innerHTML = response.total
          }
        }
      })
    }
  } else {
    $.ajax({
      url: '/change-product-quantity',
      data: {
        user: userId,
        cart: cartId,
        product: proId,
        count,
        quantity
      },
      method: 'post',
      success: (response) => {
        if (response.removeProduct) {
          location.reload()
        } else {
          document.getElementById(proId).innerHTML = quantity + count
          document.getElementById('total').innerHTML = response.total
        }
      }
    })
  }
}

function deleteCartProduct (cartId, proId) {
  if (confirm('Are you sure you want to remove this item?')) {
    $.ajax({
      url: '/delete-cart-product',
      data: {
        cart: cartId,
        product: proId
      },
      method: 'post',
      success: (response) => {
        if (response.removeProduct) {
          location.reload()
        }
      }
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
        const result = razorpayPayment(response, () => {
          if (!result) {
            location.href = '/orders'
          }
        })
      }
    },
  })
})

function razorpayPayment (order) {
  const options = {
    key: 'rzp_test_AOR6LcLadTlBtS', // Enter the Key ID generated from the Dashboard
    amount: order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
    currency: 'INR',
    name: 'CycMaster',
    description: 'Test Transaction',
    image: 'https://example.com/your_logo',
    order_id: order.id, // This is a sample Order ID. Pass the `id` obtained in the response of Step 1
    handler: function (response) {
      verifyPayment(response, order)
    },

    prefill: {
      name: 'Gaurav Kumar',
      email: 'gaurav.kumar@example.com',
      contact: '9999999999'
    },
    notes: {
      address: 'Razorpay Corporate Office',
    },
    theme: {
      color: '#3399cc'
    }
  }
  // eslint-disable-next-line no-undef
  const rzp1 = new Razorpay(options)
  rzp1.on('payment.failed', (response) => {
    alert('payment failed')
    location.href = '/orders'
  })

  rzp1.open()
}
function verifyPayment (payment, order) {
  $.ajax({
    url: '/verify-payment',
    data: {
      payment,
      order
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

// eslint-disable-next-line no-undef
$(document).ready(function () {
  // eslint-disable-next-line no-undef
  $('#table_id').DataTable()
})

$(document).ready(function () {
  $('#add-btn').click(function () {
    const value = $('#input').val()
    $('#type').append(new Option(value), value)
  })
})
// eslint-disable-next-line no-unused-vars
function coupen (total, discount, coupenId) {
  $.ajax({
    url: '/coupen',
    data: {
      total,
      discount,
      coupenId
    },
    method: 'post',
    success: (response) => {
      document.getElementById('coupen-price').innerHTML = response.coupenPrice
      document.getElementById(coupenId).innerHTML = 'Applied'
    },
  })
}

// eslint-disable-next-line no-unused-vars
function coupenDelete (coupenId) {
  $.ajax({
    url: '/admin/coupen-delete',
    data: {
      coupenId
    },
    method: 'post',
    success: (response) => {
      if (response) {
        location.reload()
      }
    },
  })
}

function download () {
  const invoice = document.getElementById('invoice')
  const opt = {
    margin: 1,
    filename: 'Order Invoice.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  }
  // eslint-disable-next-line no-undef
  html2pdf().from(invoice).set(opt).save()
}

// var xValues = ["Italy", "France", "Spain", "USA", "Argentina"];
// var yValues = [55, 49, 44, 24, 15];
// var barColors = ["red", "green","blue","orange","brown"];

// new Chart("myChart", {
//   type: "bar",
//   data: {
//     labels: xValues,
//     datasets: [{
//       backgroundColor: barColors,
//       data: yValues
//     }]
//   },
//   options: {
//     legend: {display: false},
//     title: {
//       display: true,
//       text: "World Wine Production 2018"
//     }
//   }
// });
