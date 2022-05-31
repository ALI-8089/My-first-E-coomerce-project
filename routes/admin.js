var express = require('express')
const admin = require('../db-setup/admin')
var router = express.Router()
const adminDb = require('../db-setup/admin')

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
router.post('/add-product', (req, res) => {
  // console.log(req.body);
  // console.log(req.files.image);
 let price = parseInt(req.body.price)
 req.body.price=price
  adminDb.addProduct(req.body, (id) => {
    console.log(id)
    let image = req.files.image
    image.mv('./public/product-image/' + id + '.jpg')
    res.redirect('/admin/add-product')
  })
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
  console.log(product)
  res.render('admin/edit-product', { product, admin: true })
})
router.post('/edit-product/:id',(req, res)=>{
   adminDb.updateProduct(req.params.id,req.body).then(()=>{
    res.redirect('/admin/all-products')
  }) 
}) 
   
module.exports = router 
