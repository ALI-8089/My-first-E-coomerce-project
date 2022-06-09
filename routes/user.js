var express = require('express')

var router = express.Router()
const userDb = require('../db-setup/users')
/* GET home page. */
router.get('/', async function (req, res, next) {
  let user = req.session.user

  let cartCount = null
  if (req.session.loggedIn) {
    console.log(req.session.user.delivaryAddress)
    cartCount = await userDb.getCartCount(req.session.user._id)
    res.render('users/home', { user, cartCount, admin: false })
  } else {
    res.render('users/home', { admin: false })
  }
})

router.get('/login', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/')
  } else {
    res.render('users/signIn', {
      loginErr: req.session.loginErr,
      blockedErr: req.session.blockedErr,
      admin: false,
    })
    req.session.loginErr = false
    req.session.blockedErr = false
  }
})
router.post('/login', (req, res) => {
  console.log(req.body)
  userDb.DoLogin(req.body).then((response) => {
    console.log(response)
    if (response.status) {
      req.session.loggedIn = true
      req.session.user = response.user
      console.log('session user', req.session.user)
      if (req.session.user.blocked === true) {
        req.session.loggedIn = false
        req.session.blockedErr = 'You are blocked by CycMaster'
        res.redirect('/login')
      } else {
        res.redirect('/')
      }
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
    res.render('users/signUp', {
      signupErr: req.session.signupErr,
      admin: false,
    })
    req.session.signupErr = false
  }
})
router.post('/signup', (req, res) => {
  userDb.DoSignup(req.body).then((respones) => {
    console.log(respones)
    if (respones.status) {
      req.session.signupErr = 'USER IS ALREADY EXIST'
      res.redirect('/signup')
    } else {
      res.redirect('/login')
    }
  })
})
router.get('/search', (req, res) => {
  search = req.session.search

  res.render('users/search', { search, admin: false })
})
router.post('/search', (req, res) => {
  console.log(req.body)
  userDb.search(req.body).then((result) => {
    req.session.search = result
    res.redirect('/search')
  })
})
router.get('/mountain-bike', async (req, res) => {
  let user = req.session.user
  let mtb = 'mtb'
  if (req.session.loggedIn) {
let   loggedIn=true
    let cartCount = await userDb.getCartCount(req.session.user._id)
    userDb.getproducts(mtb).then((products) => {
      res.render('users/mtb', { products, cartCount, user, admin: false ,loggedIn})
    })
  } else {
    userDb.getproducts(mtb).then((products) => {
      res.render('users/mtb', { products, admin: false })
    })
  }
})
router.get('/hybrid-bike', async (req, res) => {
  let hybrid = 'hybrid'
  let user = req.session.user
  if (req.session.loggedIn) {
    let cartCount = await userDb.getCartCount(req.session.user._id)
    userDb.getproducts(hybrid).then((hybrid) => {
      res.render('users/hybrid', { hybrid, cartCount, user, admin: false })
    })
  } else {
    userDb.getproducts(hybrid).then((hybrid) => {
      res.render('users/hybrid', { hybrid, admin: false })
    })
  }
})

router.get('/road-bike', async (req, res) => {
  let road = 'road'
  let user = req.session.user
  if (req.session.loggedIn) {
    let cartCount = await userDb.getCartCount(req.session.user._id)
    userDb.getproducts(road).then((road) => {
      res.render('users/road', { road, cartCount, user, admin: false })
    })
  } else {
    userDb.getproducts(road).then((road) => {
      res.render('users/road', { road, admin: false })
    })
  }
})

router.get('/gravel-bike', async (req, res) => {
  let gravel = 'gravel'
  let user = req.session.user
  if (req.session.loggedIn) {
    let cartCount = await userDb.getCartCount(req.session.user._id)
    userDb.getproducts(gravel).then((gravel) => {
      res.render('users/gravel', { gravel, cartCount, user, admin: false })
    })
  } else {
    userDb.getproducts(gravel).then((gravel) => {
      res.render('users/gravel', { gravel, admin: false })
    })
  }
})
router.get('/product-spec/:id', async (req, res) => {
  const proId = req.params.id
  if (req.session.loggedIn) {
    let user = req.session.user
    let cartCount = await userDb.getCartCount(req.session.user._id)
    userDb.getOneProduct(proId).then((product) => {
      res.render('users/product-spec', {
        product,
        cartCount,
        user,
        admin: false,
      })
    })
  } else {
    userDb.getOneProduct(proId).then((product) => {
      res.render('users/product-spec', { product, admin: false })
    })
  }
})

router.get('/add-to-cart/:id', (req, res) => {
  

  if (req.session.loggedIn) {
    userDb.addToCart(req.params.id, req.session.user._id).then(() => {
      res.json({ login: true })
    })
  } else {
    res.json({login: false})
  }
})
router.get('/cart', async (req, res) => {
  if (req.session.loggedIn) {
    let products = await userDb.getCartProduct(req.session.user._id)
    let cartCount = await userDb.getCartCount(req.session.user._id)
    let totalValue = 0
    let cart = 1
    if (products.length > 0) {
      totalValue = await userDb.getTotalAmount(req.session.user._id)
      res.render('users/cart', {
        products,
        cartCount,
        totalValue,
        user: req.session.user,
        cart,
      })
    } else {
      res.redirect('/empty-cart')
    }
  } else {
    res.redirect('/guest-empty-cart')
  }
})
router.get('/guest-empty-cart', (req, res) => {
  let cart = 1
  res.render('users/guestempty-cart', { cart, admin: false })
})
router.get('/empty-cart', (req, res) => {
  let cart = 1
  res.render('users/empty-cart', { cart, admin: false })
})
router.post('/change-product-quantity', (req, res) => {
  userDb.changeProductQuantity(req.body).then(async (response) => {
    if (response.removeProduct) {
      res.json(response)
    } else {
      response.total = await userDb.getTotalAmount(req.body.user)
      res.json(response)
    }
  })
})
router.post('/delete-cart-product', (req, res) => {
  userDb.deleteCartProduct(req.body).then((response) => {
    res.json(response)
  })
})
router.get('/place-order', async (req, res) => {
  let totalValue = await userDb.getTotalAmount(req.session.user._id)
  let delAddress = await userDb.getProfile(req.session.user._id)
  
  let cart = 1
  
  res.render('users/address-gateway', { totalValue, delAddress, cart })
})
router.post('/place-order', async (req, res) => {
  let products = await userDb.getCartProductList(req.session.user._id)
  let totalPrice = await userDb.getTotalAmount(req.session.user._id)
  console.log(totalPrice)
  userDb
    .palceOrder(req.body, products, totalPrice, req.session.user._id)
    .then((orderId) => {
      console.log(req.body)
      if (req.body['payment-method'] === 'COD') {
        res.json({ codSuccess: true })
      } else {
        userDb.generateRazorpay(orderId, totalPrice).then((response) => {
          console.log('1', response)
          res.json(response)
        })
      }
    })
  // console.log(req.body)
})
router.get('/new-address', (req, res) => {
  let cart = 1
  res.render('users/create-address', { admin: false, cart })
})
router.post('/create-address', (req, res) => {
  let userId = req.session.user._id
  userDb.createAddress(userId, req.body).then(() => {
    res.redirect('/place-order')
  })
})
router.get('/orders', async (req, res) => {
  if(req.session.loggedIn){
    let orders = await userDb.getUserOrders(req.session.user._id)
    let cartCount = await userDb.getCartCount(req.session.user._id)

  res.render('users/oders', { user: req.session.user, orders ,cartCount})
  }else{
    res.redirect('/login')
  }
  
})
router.get('/order-details/:id', async (req, res) => {
  console.log('hgi', req.params.id)
  if (req.session.loggedIn) {
    let products = await userDb.getOrderProducts(
      req.params.id,
      req.session.user._id,
    )
    let cartCount = await userDb.getCartCount(req.session.user._id)
    user = req.session.user.delivaryAddress
    total = products[0].total

    res.render('users/order-details', { products, user, total,cartCount })
  }
})
router.post('/verify-payment', (req, res) => {
  userDb
    .verifyPayment(req.body)
    .then(() => {
      userDb.changePaymentStatus(req.body['order[receipt]']).then(() => {
        console.log('payment successful')
        res.json({ status: true })
      })
    })
    .catch((err) => {
      console.log('error')
      res.redirect('/order')
      res.json({ status: false })
    })
})
router.get('/profile', (req, res) => {
  if (req.session.loggedIn) {
    let userId = req.session.user._id
    console.log(userId)
    userDb.getProfile(userId).then((profile) => {
      let gen = profile.gender
      if (gen === 'Male') {
        res.render('users/profile', { profile, gen })
      } else {
        res.render('users/profile', { profile })
      }
    })
  } else {
    res.redirect('/login')
  }
})
router.get('/edit-profile/:id', (req, res) => {
  userDb.getProfile(req.params.id).then((profile) => {
    res.render('users/edit-profile', { profile })
  })
})
router.post('/edit-profile/:id', (req, res) => {
  userDb.editProfile(req.params.id, req.body).then((userDetails) => {
    console.log(userDetails)
    res.redirect('/profile')
  })
})

router.get('/logout', (req, res) => {
  req.session.loggedIn = false
  res.redirect('/')
})

module.exports = router
