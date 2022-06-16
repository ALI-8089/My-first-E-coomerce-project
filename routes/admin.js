const express = require('express')
const router = express.Router()
const adminDb = require('../db-setup/admin')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { Db } = require('mongodb')
let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads')
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + '-' + Date.now() + path.extname(file.originalname),
    )
  },
})
const upload = multer({ storage: storage })
/* GET users listing. */
router.get('/', async function (req, res, next) {
  if (req.session.admin) {
    let revenue = await adminDb.revenue()
    let orders = await adminDb.orders()
    let user = await adminDb.users()

    let arrRevenue = await adminDb.getRevenue()
    res.render('admin/dashboard', {
      admin: true,
      revenue,
      orders,
      user,
      arrRevenue,
    })
  } else {
    res.redirect('/admin/login')
  }
})
router.get('/signup', (req, res) => {
  res.render('admin/sign-up', {
    admin: true,
    signupErr: req.session.admin_signupErr,
  })
  req.session.admin_signupErr = false
})
router.post('/signup', (req, res) => {
  adminDb.doSignup(req.body).then((response) => {
    if (response.status) {
      req.session.admin_signupErr = 'ADMIN IS ALREADY EXIST'
      res.redirect('/admin/signup')
    } else {
      res.redirect('/admin/login')
    }
  })
})
router.get('/login', (req, res) => {
  res.render('admin/login', { admin: true })
})
router.post('/login', (req, res) => {
  adminDb.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.admin = true
      res.redirect('/admin/dashboard')
    }
  })
})
router.get('/add-product', (req, res) => {
  if (req.session.admin) {
    res.render('admin/add-product', { admin: true })
  } else {
    res.redirect('/admin/')
  }
})
router.post('/add-product', upload.array('images', 3), async (req, res) => {
  let file = req.files
  let imgArray = await file.map((file) => {
    const img = fs.readFileSync(file.path)
    let encode_img = img.toString('base64')
    return encode_img
  })
  const finalImg = []
  await imgArray.map((src, index) => {
    const result = finalImg.push({
      filename: file[index].originalname,
      contentType: file[index].mimetype,
      image: src,
    })
    return result
  })

  adminDb.addProduct(finalImg, req.body)
  res.redirect('/admin/add-product')
})
router.get('/all-products', (req, res) => {
  if (req.session.admin) {
    adminDb.getAllProduct().then((products) => {
      res.render('admin/all-products', { products, admin: true })
    })
  } else {
    res.redirect('/admin/')
  }
})
router.get('/delete-product/:id', (req, res) => {
  if (req.session.admin) {
    let proId = req.params.id
    adminDb.deleteProduct(proId).then((response) => {
      res.redirect('/admin/all-products')
    })
  } else {
    res.redirect('/admin/')
  }
})
router.get('/edit-product/:id', async (req, res) => {
  if (req.session.admin) {
    let proId = req.params.id
    let product = await adminDb.getProductDetails(proId)

    res.render('admin/edit-product', { product, admin: true })
  } else {
    res.redirect('/admin/')
  }
})
router.post(
  '/edit-product/:id',
  upload.array('images', 3),
  async (req, res) => {
    let file = req.files
    let imgArray = await file.map((file) => {
      const img = fs.readFileSync(file.path)
      let encode_img = img.toString('base64')
      return encode_img
    })
    const finalImg = []
    await imgArray.map((src, index) => {
      const result = finalImg.push({
        filename: file[index].originalname,
        contentType: file[index].mimetype,
        image: src,
      })
      return result
    })
    adminDb.updateProduct(req.params.id, finalImg, req.body).then(() => {
      res.redirect('/admin/all-products')
    })
  },
)
router.get('/all-users', async (req, res) => {
  if (req.session.admin) {
    let users = await adminDb.getUsers()

    res.render('admin/all-users', { users, admin: true })
  } else {
    res.redirect('/admin/')
  }
})
router.get('/block-user/:id', (req, res) => {
  if (req.session.admin) {
    adminDb.blockUser(req.params.id).then(() => {
      req.session.blocked = true
      res.redirect('/admin/all-users')
    })
  } else {
    res.redirect('/admin/')
  }
})
router.get('/unblock-user/:id', (req, res) => {
  if (req.session.admin) {
    adminDb.unBlockUser(req.params.id).then(() => {
      res.redirect('/admin/all-users')
    })
  } else {
    res.redirect('/admin/')
  }
})
router.get('/user-orders/:id', async (req, res) => {
  if (req.session.admin) {
    let order = await adminDb.userOrders(req.params.id)
    let total = await adminDb.totalByTheUser(req.params.id)

    res.render('admin/user-orders', { order, total, admin: true })
  } else {
    res.redirect('/admin/')
  }
})
router.get('/all-orders', (req, res) => {
  if (req.session.admin) {
    adminDb.allOrders().then((allOrders) => {
      console.log(allOrders)
      res.render('admin/all-orders', { allOrders, admin: true })
    })
  } else {
    res.redirect('/admin/')
  }
})
router.get('/coupen', async (req, res) => {
  if (req.session.admin) {
    let coupen = await adminDb.getCoupen()

    res.render('admin/coupen', { coupen, admin: true })
  } else {
    res.redirect('/admin/')
  }
})
router.post('/coupen', (req, res) => {
  console.log(req.body)
  adminDb.coupen(req.body).then((response) => {
    res.redirect('/admin/coupen')
  })
})
router.post('/coupen-delete', (req, res) => {
  adminDb.coupenDelete(req.body).then((response) => {
    res.json(response)
  })
})
router.get('/dashboard', async (req, res) => {
  if (req.session.admin) {
    let revenue = await adminDb.revenue()
    let orders = await adminDb.orders()
    let user = await adminDb.users()

    let arrRevenue = await adminDb.getRevenue()
    res.render('admin/dashboard', {
      admin: true,
      revenue,
      orders,
      user,
      arrRevenue,
    })
  } else {
    res.redirect('/admin/')
  }
})
router.get('/logout', (req, res) => {
  req.session.admin = false
  res.redirect('/admin/')
})

module.exports = router
