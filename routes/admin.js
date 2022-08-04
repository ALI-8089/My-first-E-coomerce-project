const express = require('express')
const router = express.Router()
const adminDb = require('../db-setup/admin')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads')
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + '-' + Date.now() + path.extname(file.originalname)
    )
  }
})
const upload = multer({ storage })
/* GET users listing. */
router.get('/', async function (req, res, next) {
  try {
    if (req.session.admin) {
      const revenue = await adminDb.revenue()
      const orders = await adminDb.orders()
      const user = await adminDb.users()

      const arrRevenue = await adminDb.getRevenue()
      res.render('admin/dashboard', {
        admin: true,
        revenue,
        orders,
        user,
        arrRevenue
      })
    } else {
      res.redirect('/admin/login')
    }
  } catch (err) {
    console.log('err', err)
  }
})
router.get('/login', (req, res) => {
  try {
    res.render('admin/login', { admin: true })
  } catch (err) {
    console.log('err', err)
  }
})
router.post('/login', (req, res) => {
  try {
    adminDb.doLogin(req.body).then((response) => {
      if (response.status) {
        req.session.admin = true
        res.redirect('/admin/dashboard')
      }
    })
  } catch (err) {
    console.log(err)
  }
})
router.get('/add-product', (req, res) => {
  try {
    if (req.session.admin) {
      res.render('admin/add-product', { admin: true })
    } else {
      res.redirect('/admin/')
    }
  } catch (err) {
    console.log('err', err)
  }
})
router.post('/add-product', upload.array('images', 3), async (req, res) => {
  try {
    const file = req.files
    const imgArray = await file.map((file) => {
      const img = fs.readFileSync(file.path)
      const encodeImg = img.toString('base64')
      return encodeImg
    })
    const finalImg = []
    await imgArray.map((src, index) => {
      const result = finalImg.push({
        filename: file[index].originalname,
        contentType: file[index].mimetype,
        image: src
      })
      return result
    })

    adminDb.addProduct(finalImg, req.body)
    res.redirect('/admin/add-product')
  } catch (err) {
    console.log('err', err)
  }
})
router.get('/all-products', (req, res) => {
  try {
    if (req.session.admin) {
      adminDb.getAllProduct().then((products) => {
        res.render('admin/all-products', { products, admin: true })
      })
    } else {
      res.redirect('/admin/')
    }
  } catch (err) {
    console.log(err)
  }
})
router.get('/delete-product/:id', (req, res) => {
  try {
    if (req.session.admin) {
      const proId = req.params.id
      adminDb.deleteProduct(proId).then((response) => {
        res.redirect('/admin/all-products')
      })
    } else {
      res.redirect('/admin/')
    }
  } catch (err) {
    console.log(err)
  }
})
router.get('/edit-product/:id', async (req, res) => {
  try {
    if (req.session.admin) {
      const proId = req.params.id
      const product = await adminDb.getProductDetails(proId)

      res.render('admin/edit-product', { product, admin: true })
    } else {
      res.redirect('/admin/')
    }
  } catch (err) {
    console.log('err', err)
  }
})
router.post(
  '/edit-product/:id',
  upload.array('images', 3),
  async (req, res) => {
    try {
      const file = req.files
      const imgArray = await file.map((file) => {
        const img = fs.readFileSync(file.path)
        const encodeImg = img.toString('base64')
        return encodeImg
      })
      const finalImg = []
      await imgArray.map((src, index) => {
        const result = finalImg.push({
          filename: file[index].originalname,
          contentType: file[index].mimetype,
          image: src
        })
        return result
      })
      adminDb.updateProduct(req.params.id, finalImg, req.body).then(() => {
        res.redirect('/admin/all-products')
      })
    } catch (err) {
      console.log(err)
    }
  }
)
router.get('/all-users', async (req, res) => {
  try {
    if (req.session.admin) {
      const users = await adminDb.getUsers()

      res.render('admin/all-users', { users, admin: true })
    } else {
      res.redirect('/admin/')
    }
  } catch (err) {
    console.log(err)
  }
})
router.get('/block-user/:id', (req, res) => {
  try {
    if (req.session.admin) {
      adminDb.blockUser(req.params.id).then(() => {
        req.session.blocked = true
        res.redirect('/admin/all-users')
      })
    } else {
      res.redirect('/admin/')
    }
  } catch (err) {
    console.log('err', err)
  }
})
router.get('/unblock-user/:id', (req, res) => {
  try {
    if (req.session.admin) {
      adminDb.unBlockUser(req.params.id).then(() => {
        res.redirect('/admin/all-users')
      })
    } else {
      res.redirect('/admin/')
    }
  } catch (err) {
    console.log('err', err)
  }
})
router.get('/user-orders/:id', async (req, res) => {
  try {
    if (req.session.admin) {
      const order = await adminDb.userOrders(req.params.id)
      const total = await adminDb.totalByTheUser(req.params.id)

      res.render('admin/user-orders', { order, total, admin: true })
    } else {
      res.redirect('/admin/')
    }
  } catch (err) {
    console.log('err', err)
  }
})
router.get('/all-orders', (req, res) => {
  try {
    if (req.session.admin) {
      adminDb.allOrders().then((allOrders) => {
        console.log(allOrders)
        res.render('admin/all-orders', { allOrders, admin: true })
      })
    } else {
      res.redirect('/admin/')
    }
  } catch (err) {
    console.log('err', err)
  }
})
router.get('/coupen', async (req, res) => {
  try {
    if (req.session.admin) {
      const coupen = await adminDb.getCoupen()

      res.render('admin/coupen', { coupen, admin: true })
    } else {
      res.redirect('/admin/')
    }
  } catch (err) {
    console.log('err', err)
  }
})
router.post('/coupen', (req, res) => {
  try {
    adminDb.coupen(req.body).then((response) => {
      res.redirect('/admin/coupen')
    })
  } catch (err) {
    console.log('err', err)
  }
})
router.post('/coupen-delete', (req, res) => {
  try {
    adminDb.coupenDelete(req.body).then((response) => {
      res.json(response)
    })
  } catch (err) {
    console.log('err', err)
  }
})
router.get('/dashboard', async (req, res) => {
  try {
    if (req.session.admin) {
      const revenue = await adminDb.revenue()
      const orders = await adminDb.orders()
      const user = await adminDb.users()

      const arrRevenue = await adminDb.getRevenue()
      res.render('admin/dashboard', {
        admin: true,
        revenue,
        orders,
        user,
        arrRevenue
      })
    } else {
      res.redirect('/admin/')
    }
  } catch (err) {
    console.log('err', err)
  }
})
router.get('/logout', (req, res) => {
  try {
    req.session.admin = false
    res.redirect('/admin/')
  } catch (err) {
    console.log('err', err)
  }
})

module.exports = router
