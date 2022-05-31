var express = require('express')
const async = require('hbs/lib/async')
var router = express.Router()
const userDb = require('../db-setup/users')
/* GET home page. */
router.get('/', async function (req, res, next) {
  let user = req.session.user
  let cartCount = null
  if (req.session.loggedIn) {
    cartCount = await userDb.getCartCount(req.session.user._id)
    res.render('users/home', { user, cartCount, admin: false })
  } else {
    res.redirect('/login')
  }
})
router.get('/login', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/')
  } else {
    res.render('users/signIn', { loginErr: req.session.loginErr, admin: false })
    req.session.loginErr = false
  }
})
router.post('/login', (req, res) => {
  console.log(req.body)
  userDb.DoLogin(req.body).then((response) => {
    console.log(response)
    if (response.status) {
      req.session.loggedIn = true
      req.session.user = response.user
      res.redirect('/')
    } else {
      req.session.loginErr = 'OOPS..!  Password Not Matching With EmailId'
      res.redirect('/login')
    }
  })
})

router.get('/signup', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/')
  } else {
    res.render('users/signUp',{signupErr:req.session.signupErr,admin:false})
    req.session.signupErr=false
  }
})
router.post('/signup', (req, res) => {
  
  userDb.DoSignup(req.body).then((respones) => {
    console.log(respones);
    if(respones.status){
      req.session.signupErr = "USER IS ALREADY EXIST"
      res.redirect('/signup')
    }else{
      res.redirect('/login')
    }
    
    
  })
})
router.get('/mountain-bike', (req, res) => {
  let mtb ="mtb";
  userDb.getproducts(mtb).then((products) => {
    res.render('users/mtb', { products, admin: false })
  })
 
})
router.get('/hybrid-bike', (req, res) => {
  let hybrid ="hybrid";
  userDb. getproducts(hybrid).then((hybrid) => {
    res.render('users/hybrid', { hybrid, admin: false })
  })
  
})

router.get('/road-bike', (req, res) => {
  let road ="road";
  userDb. getproducts(road).then((road) => {
    res.render('users/road', { road, admin: false })
  })
  
})

router.get('/gravel-bike', (req, res) => {
  let gravel ="gravel";
  userDb. getproducts(gravel).then((gravel) => {
    res.render('users/gravel', { gravel, admin: false })
  })
 
})
router.get('/product-spec', (req, res) => {
  res.render('users/product-spec')
})

router.get('/add-to-cart/:id', (req, res) => {
  // console.log('ajax call')
  userDb.addToCart(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true })
  })
})
router.get('/cart', async (req, res) => {
  let products = await userDb.getCartProduct(req.session.user._id)
  let totalValue=0
  if(products.length > 0) {
    totalValue = await userDb.getTotalAmount(req.session.user._id)
  }
   
  // console.log(totalValue)
  res.render('users/cart', { products, totalValue, user: req.session.user })
})
router.post('/change-product-quantity', (req, res) => {
  // console.log(req.body);
  userDb.changeProductQuantity(req.body).then(async (response) => {
    console.log(response)
    response.total = await userDb.getTotalAmount(req.body.user)
    res.json(response)
  })
})
router.post('/delete-cart-product', (req, res) => {
  // console.log(req.body);
  userDb.deleteCartProduct(req.body).then((response) => {
    res.json(response)
  })
})
router.get('/place-order', async (req, res) => {
  let totalValue = await userDb.getTotalAmount(req.session.user._id)
  res.render('users/address-gateway', { totalValue, user: req.session.user })
})
router.post('/place-order', async (req, res) => {
  let products = await userDb.getCartProductList(req.body.user)
  let totalPrice = await userDb.getTotalAmount(req.body.user)
  userDb.palceOrder(req.body, products, totalPrice).then((orderId) => {
    console.log(req.body)
    if (req.body['payment-method'] === 'COD') {
      res.json({ codSuccess: true })
    } else {
      userDb.generateRazorpay(orderId, totalPrice).then((response) => {
        console.log('me', response)
        res.json(response)
      })
    }
  })
  // console.log(req.body)
})
router.get('/new-address', (req, res) => {
  res.render('users/create-address')
})
router.get('/orders', async (req, res) => {
  let orders = await userDb.getUserOrders(req.session.user._id)
  // console.log(orders);
  res.render('users/oders', { user: req.session.user, orders })
})
router.get('/order-details/:id', async (req, res) => {
  let products = await userDb.getOrderProducts(req.params.id)
  let orders = await userDb.getUserOrdersWithProduct(
    req.session.user._id,
    req.params.id,
  )
  // console.log(products);
  console.log(orders)
  res.render('users/order-details', {
    user: req.session.user,
    products,
    orders,
  })
})
router.post('/verify-payment', (req, res) => {
  console.log(req.body)
  userDb
    .verifyPayment(req.body)
    .then(() => {
      userDb.changePaymentStatus(req.body['order[receipt]']).then(() => {
        console.log('payment successful')
        res.json({ status: true })
      })
    })
    .catch((err) => {
      console.log("error",err)
      res.json({ status: false }) 
    })
})

router.get('/logout', (req, res) => {
  req.session.loggedIn = false
  res.redirect('/')
})

module.exports = router
