const express = require('express')
const router = express.Router()
const adminDb = require('../db-setup/admin')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const async = require('hbs/lib/async')


// const upload = multer({ dest: 'uploads/' })
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
router.get('/', function (req, res, next) {
  res.render('admin/login', { admin: true })
})
router.post('/login', (req, res) => {
  if (
    req.body.email === 'captian.8089@gmail.com' &&
    req.body.password === '1212'
  ) {
    res.redirect('/admin/all-products')
  }
})
router.get('/add-product', (req, res) => {
  res.render('admin/add-product', { admin: true })
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
  adminDb.getAllProduct().then((products) => {
    res.render('admin/all-products', { products, admin: true })
  })
})
router.get('/delete-product/:id', (req, res) => {
  let proId = req.params.id
  adminDb.deleteProduct(proId).then((response) => {
    res.redirect('/admin/all-products')
  })
})
router.get('/edit-product/:id', async (req, res) => {
  let proId = req.params.id
  let product = await adminDb.getProductDetails(proId)

  res.render('admin/edit-product', { product, admin: true })
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
  let users = await adminDb.getUsers()

  res.render('admin/all-users', { users, admin: true })
})
router.get('/block-user/:id', (req, res) => {
  adminDb.blockUser(req.params.id).then(() => {
    req.session.blocked = true
    res.redirect('/admin/all-users')
  })
})
router.get('/unblock-user/:id', (req, res) => {
  adminDb.unBlockUser(req.params.id).then(() => {
    res.redirect('/admin/all-users')
  })
})
router.get('/user-orders/:id',async(req, res) => {
 let order =await adminDb.userOrders(req.params.id)
 let total = await adminDb.totalByTheUser(req.params.id)
 console.log(order);
  res.render('admin/user-orders',{order,total})
})
router.get('/all-orders',(req, res) => {
  adminDb.allOrders().then((allOrders) => {
    console.log(allOrders);
    res.render('admin/all-orders',{allOrders, admin:true})
  })
})

module.exports = router
 