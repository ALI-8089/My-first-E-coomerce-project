const express = require('express')
const router = express.Router()
const userDb = require('../db-setup/users')
/* GET home page. */
router.get('/', async function (req, res, next) {
  try {
    const home = [
      {
        image: '/images/home/home mtb.jpg',
        button: 'MOUNTAIN BIKE',
        link: '/mountain-bike'
      },
      {
        image: '/images/home/home hybrid.jpg',
        button: 'HYBRID BIKE',
        link: '/hybrid-bike'
      },
      {
        image: '/images/home/home road.jpg',
        button: 'ROAD BIKE',
        link: '/road-bike'
      },
      {
        image: '/images/home/home gravel.jpg',
        button: 'GRAVEL BIKE',
        link: '/gravel-bike'
      }
    ]

    const user = req.session.user
    let cartCount = null
    if (req.session.loggedIn) {
      cartCount = await userDb.getCartCount(req.session.user._id)
      res.render('users/home', { user, home, cartCount, admin: false })
    } else {
      res.render('users/home', { home, admin: false })
    }
  } catch (err) {
    console.log('err', err)
  }
})

router.get('/login', (req, res) => {
  try {
    if (req.session.loggedIn) {
      res.redirect('/')
    } else {
      res.render('users/signIn', {
        welcome: req.session.welcome,
        loginErr: req.session.loginErr,
        blockedErr: req.session.blockedErr,
        admin: false
      })
      req.session.loginErr = false
      req.session.blockedErr = false
      req.session.welcome = false
    }
  } catch (err) {
    console.log('err', err)
  }
})
router.post('/login', (req, res) => {
  try {
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
  } catch (err) {
    console.log('err', err)
  }
})

router.get('/signup', (req, res) => {
  try {
    if (req.session.loggedIn) {
      res.redirect('/')
    } else {
      res.render('users/signUp', {
        signupErr: req.session.signupErr,
        admin: false
      })
      req.session.signupErr = false
    }
  } catch (err) {
    console.log('err', err)
  }
})
router.post('/signup', (req, res) => {
  try {
    userDb.DoSignup(req.body).then((respones) => {
      if (respones.status) {
        req.session.signupErr = 'USER IS ALREADY EXIST'
        res.redirect('/signup')
      } else {
        req.session.welcome = 'Welcome to CycMaster! Please Login..'
        res.redirect('/login')
      }
    })
  } catch (err) {
    console.log('err', err)
  }
})
router.post('/search', async (req, res) => {
  try {
    if (req.session.loggedIn) {
      const user = req.session.user
      const cartCount = await userDb.getCartCount(req.session.user._id)
      const search = await userDb.search(req.body)
      res.render('users/search', { search, cartCount, user, admin: false })
    } else {
      const search = await userDb.search(req.body)
      res.render('users/search', { search, admin: false })
    }
  } catch (err) {
    console.log('err', err)
  }
})

router.get('/mountain-bike', async (req, res) => {
  try {
    const user = req.session.user
    const mtb = 'mtb'
    if (req.session.loggedIn) {
      const loggedIn = true
      const cartCount = await userDb.getCartCount(req.session.user._id)
      userDb.getproducts(mtb).then((products) => {
        res.render('users/mtb', {
          products,
          cartCount,
          user,
          admin: false,
          loggedIn
        })
      })
    } else {
      userDb.getproducts(mtb).then((products) => {
        res.render('users/mtb', { products, admin: false })
      })
    }
  } catch (err) {
    console.log('err', err)
  }
})
router.get('/hybrid-bike', async (req, res) => {
  try {
    const hybrid = 'hybrid'
    const user = req.session.user
    if (req.session.loggedIn) {
      const cartCount = await userDb.getCartCount(req.session.user._id)
      userDb.getproducts(hybrid).then((hybrid) => {
        res.render('users/hybrid', { hybrid, cartCount, user, admin: false })
      })
    } else {
      userDb.getproducts(hybrid).then((hybrid) => {
        res.render('users/hybrid', { hybrid, admin: false })
      })
    }
  } catch (err) {
    console.log('err', err)
  }
})

router.get('/road-bike', async (req, res) => {
  try {
    const road = 'road'
    const user = req.session.user
    if (req.session.loggedIn) {
      const cartCount = await userDb.getCartCount(req.session.user._id)
      userDb.getproducts(road).then((road) => {
        res.render('users/road', { road, cartCount, user, admin: false })
      })
    } else {
      userDb.getproducts(road).then((road) => {
        res.render('users/road', { road, admin: false })
      })
    }
  } catch (err) {
    console.log('err', err)
  }
})

router.get('/gravel-bike', async (req, res) => {
  try {
    const gravel = 'gravel'
    const user = req.session.user
    if (req.session.loggedIn) {
      const cartCount = await userDb.getCartCount(req.session.user._id)
      userDb.getproducts(gravel).then((gravel) => {
        res.render('users/gravel', { gravel, cartCount, user, admin: false })
      })
    } else {
      userDb.getproducts(gravel).then((gravel) => {
        res.render('users/gravel', { gravel, admin: false })
      })
    }
  } catch (err) {
    console.log('err', err)
  }
})
router.get('/product-spec/:id', async (req, res) => {
  try {
    const proId = req.params.id
    if (req.session.loggedIn) {
      const user = req.session.user
      const cartCount = await userDb.getCartCount(req.session.user._id)
      userDb.getOneProduct(proId).then((product) => {
        res.render('users/product-spec', {
          product,
          cartCount,
          user,
          admin: false
        })
      })
    } else {
      userDb.getOneProduct(proId).then((product) => {
        res.render('users/product-spec', { product, admin: false })
      })
    }
  } catch (err) {
    console.log('err', err)
  }
})

router.get('/add-to-cart/:id', (req, res) => {
  try {
    if (req.session.loggedIn) {
      userDb.addToCart(req.params.id, req.session.user._id).then(() => {
        res.json({ login: true })
      })
    } else {
      res.json({ login: false })
    }
  } catch (err) {
    console.log('err', err)
  }
})
router.get('/cart', async (req, res) => {
  try {
    if (req.session.loggedIn) {
      const products = await userDb.getCartProduct(req.session.user._id)
      const cartCount = await userDb.getCartCount(req.session.user._id)
      let totalValue = 0
      const cart = 1
      if (products.length > 0) {
        totalValue = await userDb.getTotalAmount(req.session.user._id)
        res.render('users/cart', {
          products,
          cartCount,
          totalValue,
          user: req.session.user,
          cart
        })
      } else {
        res.redirect('/empty-cart')
      }
    } else {
      res.redirect('/guest-empty-cart')
    }
  } catch (err) {
    console.log('err', err)
  }
})
router.get('/guest-empty-cart', (req, res) => {
  try {
    const cart = 1
    res.render('users/guestempty-cart', { cart, admin: false })
  } catch (err) {
    console.log('err', err)
  }
})
router.get('/empty-cart', (req, res) => {
  try {
    const cart = 1
    res.render('users/empty-cart', { cart, admin: false })
  } catch (err) {
    console.log('err', err)
  }
})
router.post('/change-product-quantity', (req, res) => {
  try {
    userDb.changeProductQuantity(req.body).then(async (response) => {
      if (response.removeProduct) {
        res.json(response)
      } else {
        response.total = await userDb.getTotalAmount(req.body.user)
        res.json(response)
      }
    })
  } catch (err) {
    console.log('err', err)
  }
})
router.post('/delete-cart-product', (req, res) => {
  try {
    userDb.deleteCartProduct(req.body).then((response) => {
      res.json(response)
    })
  } catch (err) {
    console.log('err', err)
  }
})
router.get('/place-order', async (req, res) => {
  try {
    const totalValue = await userDb.getTotalAmount(req.session.user._id)
    let Address = await userDb.getProfile(req.session.user._id)
    const cartCount = await userDb.getCartCount(req.session.user._id)
    const cart = 1
    const user = req.session.user
    const coupen = await userDb.getCoupen()
    Address = Address.delivaryAddress

    res.render('users/address-gateway', {
      totalValue,
      Address,
      cart,
      coupen,
      cartCount,
      user
    })
  } catch (err) {
    console.log('err', err)
  }
})
router.post('/place-order', async (req, res) => {
  try {
    const products = await userDb.getCartProductList(req.session.user._id)

    if (req.session.couponApplied) {
      userDb
        .palceOrder(
          req.body,
          products,
          req.session.coupenPrice,
          req.session.user._id,
          'Applied'
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
      const totalValue = await userDb.getTotalAmount(req.session.user._id)

      userDb
        .palceOrder(
          req.body,
          products,
          totalValue,
          req.session.user._id,
          'Not Applied'
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
  } catch (err) {
    console.log('err', err)
  }
})
router.get('/create-address', (req, res) => {
  try {
    const cart = 1
    res.render('users/create-address', { admin: false, cart })
  } catch (err) {
    console.log('err', err)
  }
})
router.post('/create-address', (req, res) => {
  try {
    const userId = req.session.user._id
    userDb.createAddress(userId, req.body).then(() => {
      res.redirect('/place-order')
    })
  } catch (err) {
    console.log('err', err)
  }
})
router.get('/edit-address/:id', async (req, res) => {
  try {
    const cart = 1
    req.session.index = req.params.index
    const address = await userDb.findAddress(
      req.session.user._id,
      req.params.id
    )
    res.render('users/edit-address', { admin: false, cart, address })
  } catch (err) {
    console.log('err', err)
  }
})
router.post('/edit-address/:id', (req, res) => {
  try {
    const userId = req.session.user._id
    const Id = req.params.id
    userDb.editAddress(userId, Id, req.body).then(() => {
      res.redirect('/place-order')
    })
  } catch (err) {
    console.log('err', err)
  }
})
router.get('/edit-pro-address/:id', async (req, res) => {
  try {
    const cart = 1
    req.session.index = req.params.index
    const address = await userDb.findAddress(
      req.session.user._id,
      req.params.id
    )
    res.render('users/edit-pro-address', { admin: false, cart, address })
  } catch (err) {
    console.log('err', err)
  }
})
router.post('/edit-pro-address/:id', (req, res) => {
  try {
    const userId = req.session.user._id
    const Id = req.params.id
    userDb.editAddress(userId, Id, req.body).then(() => {
      res.redirect('/profile')
    })
  } catch (err) {
    console.log('err', err)
  }
})
router.post('/coupen', (req, res) => {
  try {
    const total = parseInt(req.body.total)
    const discount = req.body.discount
    const coupenPrice = total - (total * discount) / 100
    req.session.coupenPrice = coupenPrice
    req.session.couponApplied = true

    res.json({ coupenPrice })
  } catch (err) {
    console.log('err', err)
  }
})
router.get('/orders', async (req, res) => {
  try {
    if (req.session.loggedIn) {
      const orders = await userDb.getUserOrders(req.session.user._id)
      const cartCount = await userDb.getCartCount(req.session.user._id)

      res.render('users/oders', { user: req.session.user, orders, cartCount })
    } else {
      res.redirect('/login')
    }
  } catch (err) {
    console.log('err', err)
  }
})
router.get('/order-details/:id', async (req, res) => {
  try {
    if (req.session.loggedIn) {
      const products = await userDb.getOrderProducts(req.params.id)
      console.log(products)
      const cartCount = await userDb.getCartCount(req.session.user._id)

      const method = products[0].paymentMethod
      const coupen = products[0].coupen
      const Address = products[0].user[0].delivaryAddress[0]

      if (coupen === 'Applied') {
        res.render('users/order-details', {
          Address,
          coupen,
          method,
          products,
          cartCount,
          admin: false
        })
      } else {
        res.render('users/order-details', {
          Address,
          method,
          products,
          admin: false
        })
      }
    }
  } catch (err) {
    console.log('err', err)
  }
})
router.post('/verify-payment', (req, res) => {
  try {
    userDb
      .verifyPayment(req.body)
      .then(() => {
        userDb.changePaymentStatus(req.body['order[receipt]']).then(() => {
          res.json({ status: true })
        })
      })
      .catch(() => {
        res.redirect('/order')
        res.json({ status: false })
      })
  } catch (err) {
    console.log('err', err)
  }
})
router.get('/profile', async (req, res) => {
  try {
    if (req.session.loggedIn) {
      const userId = req.session.user._id
      const user = req.session.user
      const cartCount = await userDb.getCartCount(req.session.user._id)
      console.log(cartCount)
      userDb.getProfile(userId).then((profile) => {
        const gen = profile.gender

        if (gen === 'Male') {
          res.render('users/profile', { cartCount, profile, gen, user })
        } else {
          res.render('users/profile', { cartCount, user, profile })
        }
      })
    } else {
      res.redirect('/login')
    }
  } catch (err) {
    console.log('err', err)
  }
})
router.get('/create-pro-address', (req, res) => {
  try {
    const cart = 1
    res.render('users/create-pro-address', { admin: false, cart })
  } catch (err) {
    console.log('err', err)
  }
})
router.post('/create-pro-address', (req, res) => {
  try {
    const userId = req.session.user._id
    userDb.createAddress(userId, req.body).then(() => {
      res.redirect('/profile')
    })
  } catch (err) {
    console.log('err', err)
  }
})

router.get('/delete-address/:id', (req, res) => {
  try {
    userDb.deleteAddress(req.params.id, req.session.user._id).then(() => {
      res.redirect('/profile')
    })
  } catch (err) {
    console.log('err', err)
  }
})
router.get('/edit-profile/:id', (req, res) => {
  try {
    userDb.getProfile(req.params.id).then((profile) => {
      res.render('users/edit-profile', { profile })
    })
  } catch (err) {
    console.log('err', err)
  }
})
router.post('/edit-profile/:id', (req, res) => {
  try {
    userDb.editProfile(req.params.id, req.body).then((userDetails) => {
      console.log(userDetails)
      res.redirect('/profile')
    })
  } catch (err) {
    console.log('err', err)
  }
})

router.get('/logout', (req, res) => {
  try {
    req.session.loggedIn = false
    res.redirect('/')
  } catch (err) {
    console.log('err', err)
  }
})

module.exports = router
