var express = require('express')
var router = express.Router()
const userDb = require('../db-setup/users')
/* GET home page. */
router.get('/', async function (req, res, next) {
  let home = [
    {
      image: '/images/home/home mtb.jpg',
      button: 'MOUNTAIN BIKE',
      link: '/mountain-bike',
    },
    {
      image: '/images/home/home hybrid.jpg',
      button: 'HYBRID BIKE',
      link: '/hybrid-bike',
    },
    {
      image: '/images/home/home road.jpg',
      button: 'ROAD BIKE',
      link: '/road-bike',
    },
    {
      image: '/images/home/home gravel.jpg',
      button: 'GRAVEL BIKE',
      link: '/gravel-bike',
    },
  ]

  let user = req.session.user
  let cartCount = null
  if (req.session.loggedIn) {
    cartCount = await userDb.getCartCount(req.session.user._id)
    res.render('users/home', { user, home, cartCount, admin: false })
  } else {
    res.render('users/home', { home, admin: false })
  }
})

router.get('/login', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/')
  } else {
    res.render('users/signIn', {
      welcome: req.session.welcome,
      loginErr: req.session.loginErr,
      blockedErr: req.session.blockedErr,
      admin: false,
    })
    req.session.loginErr = false
    req.session.blockedErr = false
    req.session.welcome = false
  }
})
router.post('/login', (req, res) => {
  console.log(req.body)
  userDb.DoLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true
      req.session.user = response.user

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
    if (respones.status) {
      req.session.signupErr = 'USER IS ALREADY EXIST'
      res.redirect('/signup')
    } else {
      req.session.welcome = 'Welcome to CycMaster! Please Login..'
      res.redirect('/login')
    }
  })
})
router.post('/search', async (req, res) => {
  if (req.session.loggedIn) {
    let user = req.session.user
    let cartCount = await userDb.getCartCount(req.session.user._id)
    let search = await userDb.search(req.body)
    res.render('users/search', { search, cartCount, user, admin: false })
  } else {
    let search = await userDb.search(req.body)
    res.render('users/search', { search, admin: false })
  }
})

router.get('/mountain-bike', async (req, res) => {
  let user = req.session.user
  let mtb = 'mtb'
  if (req.session.loggedIn) {
    let loggedIn = true
    let cartCount = await userDb.getCartCount(req.session.user._id)
    userDb.getproducts(mtb).then((products) => {
      res.render('users/mtb', {
        products,
        cartCount,
        user,
        admin: false,
        loggedIn,
      })
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
    res.json({ login: false })
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
  let Address = await userDb.getProfile(req.session.user._id)
  let cartCount = await userDb.getCartCount(req.session.user._id)
  let cart = 1
  user = req.session.user
  let coupen = await userDb.getCoupen()
  Address = Address.delivaryAddress

  res.render('users/address-gateway', {
    totalValue,
    Address,
    cart,
    coupen,
    cartCount,
    user,
  })
})
router.post('/place-order', async (req, res) => {
  let products = await userDb.getCartProductList(req.session.user._id)

  if (req.session.couponApplied) {
    userDb
      .palceOrder(
        req.body,
        products,
        req.session.coupenPrice,
        req.session.user._id,
        'Applied',
      )
      .then((orderId) => {
        console.log(req.body)
        if (req.body['payment-method'] === 'COD') {
          req.session.couponApplied = false
          res.json({ codSuccess: true })
        } else {
          userDb
            .generateRazorpay(orderId, req.session.coupenPrice)
            .then((response) => {
              req.session.couponApplied = false
              res.json(response)
            })
        }
      })
  } else {
    let totalValue = await userDb.getTotalAmount(req.session.user._id)

    userDb
      .palceOrder(
        req.body,
        products,
        totalValue,
        req.session.user._id,
        'Not Applied',
      )
      .then((orderId) => {
        if (req.body['payment-method'] === 'COD') {
          res.json({ codSuccess: true })
        } else {
          userDb.generateRazorpay(orderId, totalValue).then((response) => {
            res.json(response)
          })
        }
      })
  }
})
router.get('/create-address', (req, res) => {
  let cart = 1
  res.render('users/create-address', { admin: false, cart })
})
router.post('/create-address', (req, res) => {
  let userId = req.session.user._id
  userDb.createAddress(userId, req.body).then(() => {
    res.redirect('/place-order')
  })
})
router.get('/edit-address/:id', async (req, res) => {
  let cart = 1
  req.session.index = req.params.index
  let address = await userDb.findAddress(req.session.user._id, req.params.id)
  res.render('users/edit-address', { admin: false, cart, address })
})
router.post('/edit-address/:id', (req, res) => {
  console.log('......................', req.body)
  let userId = req.session.user._id
  let Id = req.params.id
  userDb.editAddress(userId, Id, req.body).then(() => {
    res.redirect('/place-order')
  })
})
router.get('/edit-pro-address/:id', async (req, res) => {
  let cart = 1
  req.session.index = req.params.index
  let address = await userDb.findAddress(req.session.user._id, req.params.id)
  res.render('users/edit-pro-address', { admin: false, cart, address })
})
router.post('/edit-pro-address/:id', (req, res) => {
  let userId = req.session.user._id
  let Id = req.params.id
  userDb.editAddress(userId, Id, req.body).then(() => {
    res.redirect('/profile')
  })
})
router.post('/coupen', (req, res) => {
  let total = parseInt(req.body.total)

  discount = req.body.discount
  let coupenPrice = total - (total * discount) / 100
  req.session.coupenPrice = coupenPrice
  req.session.couponApplied = true

  res.json({ coupenPrice })
})
router.get('/orders', async (req, res) => {
  if (req.session.loggedIn) {
    let orders = await userDb.getUserOrders(req.session.user._id)
    let cartCount = await userDb.getCartCount(req.session.user._id)

    res.render('users/oders', { user: req.session.user, orders, cartCount })
  } else {
    res.redirect('/login')
  }
})
router.get('/order-details/:id', async (req, res) => {
  if (req.session.loggedIn) {
    let products = await userDb.getOrderProducts(req.params.id)

    let cartCount = await userDb.getCartCount(req.session.user._id)

    let method = products[0].paymentMethod
    let coupen = products[0].coupen
    let Address = products[0].user[0].delivaryAddress[products[0].AddIndex]

    if (coupen === 'Applied') {
      res.render('users/order-details', {
        Address,
        coupen,
        method,
        products,
        cartCount,
      })
    } else {
      res.render('users/order-details', {
        Address,
        method,
        products,
      })
    }
  }
})
router.post('/verify-payment', (req, res) => {
  userDb
    .verifyPayment(req.body)
    .then(() => {
      userDb.changePaymentStatus(req.body['order[receipt]']).then(() => {
        res.json({ status: true })
      })
    })
    .catch((err) => {
      res.redirect('/order')
      res.json({ status: false })
    })
})
router.get('/profile', async (req, res) => {
  if (req.session.loggedIn) {
    let userId = req.session.user._id
    let user = req.session.user
    let cartCount = await userDb.getCartCount(req.session.user._id)
    console.log(cartCount)
    userDb.getProfile(userId).then((profile) => {
      let gen = profile.gender

      if (gen === 'Male') {
        res.render('users/profile', { cartCount, profile, gen, user })
      } else {
        res.render('users/profile', { cartCount, user, profile })
      }
    })
  } else {
    res.redirect('/login')
  }
})
router.get('/create-pro-address', (req, res) => {
  let cart = 1
  res.render('users/create-pro-address', { admin: false, cart })
})
router.post('/create-pro-address', (req, res) => {
  let userId = req.session.user._id
  userDb.createAddress(userId, req.body).then(() => {
    res.redirect('/profile')
  })
})

router.get('/delete-address/:id', (req, res) => {
  userDb.deleteAddress(req.params.id, req.session.user._id).then(() => {
    res.redirect('/profile')
  })
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
