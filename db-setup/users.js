const collection = require('../config mongo/mongo-collections')
const db = require('../config mongo/mongo-connection')
const bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')
const Razorpay = require('razorpay')
// var instance = new Razorpay({
//   key_id: 'rzp_test_AOR6LcLadTlBtS',
//   key_secret: 'P7pl9FbDIpQUQSjlsQFZaxZQ',
// })

module.exports = {
  DoSignup: (data) => {
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collection.userCollection)
        .findOne({ email: data.email })
      if (user) {
        console.log('user already exist')
        resolve({status:true})
      } else {
        data.password = await bcrypt.hash(data.password, 10)
        db.get()
          .collection(collection.userCollection)
          .insertOne(data)
          .then((response) => {
            console.log(response)
            resolve({status:false})
          })
      }
    })
  },
  DoLogin: (data) => {
    console.log(data)
    return new Promise(async (resolve, reject) => {
      let response = {}
      let user = await db
        .get()
        .collection(collection.userCollection)
        .findOne({ email: data.email })
      if (user) {
        bcrypt.compare(data.password, user.password).then((status) => {
          if (status) {
            console.log('success')
            response.user = user
            response.status = true
            resolve(response)
          } else {
            console.log('login failed')
            resolve({ status: false })
          }
        })
      } else {
        console.log('login failed')
        resolve({ status: false })
      }
    })
  },
  getproducts: (data) => {
    console.log(data);
    return new Promise(async (resolve, reject) => {
      let product = await db
        .get()
        .collection(collection.productCollection)
        .find({type:data})
        .toArray()

      resolve(product)
    })
  },

  
  addToCart: (proId, userId) => {
    let proObj = {
      items: ObjectId(proId),
      quantity: 1,
    }
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collection.cartCollection)
        .findOne({ user: ObjectId(userId) })
      if (userCart) {
        // console.log(userCart)
        let proExist = userCart.product.findIndex(
          (product) => product.items == proId,
        )
        console.log(proExist)
        if (proExist != -1) {
          db.get()
            .collection(collection.cartCollection)
            .updateOne(
              { user: ObjectId(userId), 'product.items': ObjectId(proId) },
              {
                $inc: { 'product.$.quantity': 1 },
              },
            )
            .then(() => {
              resolve()
            })
        } else {
          db.get()
            .collection(collection.cartCollection)
            .updateOne(
              { user: ObjectId(userId) },
              {
                $push: { product: proObj },
              },
            )
            .then((response) => {
              resolve(response)
            })
        }
      } else {
        let cartObj = {
          user: ObjectId(userId),
          product: [proObj],
        }
        db.get()
          .collection(collection.cartCollection)
          .insertOne(cartObj)
          .then((response) => {
            resolve(response)
          })
      }
    })
  },
  getCartProduct: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db
        .get()
        .collection(collection.cartCollection)
        .aggregate([
          {
            $match: { user: ObjectId(userId) },
          },
          {
            $unwind: '$product',
          },
          {
            $project: {
              items: '$product.items',
              quantity: '$product.quantity',
            },
          },
          {
            $lookup: {
              from: collection.productCollection,
              localField: 'items',
              foreignField: '_id',
              as: 'products',
            },
          },
          {
            $project: {
              items: 1,
              quantity: 1,
              products: { $arrayElemAt: ['$products', 0] },
            },
          },
        ])
        .toArray()
      // console.log(cartItems[0].products)
      resolve(cartItems)
    })
  },
  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0
      let cart = await db
        .get()
        .collection(collection.cartCollection)
        .findOne({ user: ObjectId(userId) })
      if (cart) {
        count = cart.product.length
      }
      resolve(count)
    })
  },
  changeProductQuantity: (details) => {
    // console.log(details);
    details.count = parseInt(details.count)
    return new Promise((resolve, reject) => {
      if (details.count == -1 && details.quantity == 1) {
        db.get()
          .collection(collection.cartCollection)
          .updateOne(
            { _id: ObjectId(details.cart) },
            {
              $pull: { product: { items: ObjectId(details.product) } },
            },
          )
          .then((response) => {
            // console.log(response);
            resolve({ removeProduct: true })
          })
      } else {
        db.get()
          .collection(collection.cartCollection)
          .updateOne(
            {
              _id: ObjectId(details.cart),
              'product.items': ObjectId(details.product),
            },
            {
              $inc: { 'product.$.quantity': details.count },
            },
          )
          .then((response) => {
            // console.log(response);
            resolve({ status: true })
          })
      }
    })
  },

  deleteCartProduct: (details) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.cartCollection)
        .updateOne(
          { _id: ObjectId(details.cart) },
          {
            $pull: { product: { items: ObjectId(details.product) } },
          },
        )
        .then((response) => {
          // console.log(response);
          resolve({ removeProduct: true })
        })
    })
  },
  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let total = await db
        .get()
        .collection(collection.cartCollection)
        .aggregate([
          {
            $match: { user: ObjectId(userId) },
          },
          {
            $unwind: '$product',
          },
          {
            $project: {
              items: '$product.items',
              quantity: '$product.quantity',
            },
          },
          {
            $lookup: {
              from: collection.productCollection,
              localField: 'items',
              foreignField: '_id',
              as: 'products',
            },
          },
          {
            $project: {
              items: 1,
              quantity: 1,
              products: { $arrayElemAt: ['$products', 0] },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ['$quantity', '$products.price'] } },
            },
          },
        ])
        .toArray()
      console.log(total)
      resolve(total[0].total)
    })
  },
  palceOrder: (order, products, total) => {
    return new Promise((resolve, reject) => {
      // console.log(order, products, total)
      let status = order['payment-method'] === 'COD' ? 'placed' : 'pending'
      let oderObj = {
        deliveryDetails: {
          mobile: order.mobile,
          address: order.address,
          pincode: order.pincode,
        },
        userId: ObjectId(order.user),
        paymentMethod: order['payment-method'],
        products: products,
        status: status,
        total: total,
        date: new Date(),
      }
      db.get()
        .collection(collection.orderCollection)
        .insertOne(oderObj)
        .then((response) => {
          db.get()
            .collection(collection.cartCollection)
            .deleteOne({ user: ObjectId(order.user) })
          console.log('_id', response.insertedId)
          resolve(response.insertedId)
        })
    }) 
  },
  getCartProductList: (userId) => {
    // console.log(userId)
    return new Promise(async (resolve, reject) => {
      let cart = await db
        .get()
        .collection(collection.cartCollection)
        .findOne({ user: ObjectId(userId) })
      // console.log(cart)
      resolve(cart.product)
    })
  },
  getUserOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      console.log(userId)
      let orders = await db
        .get()
        .collection(collection.orderCollection)
        .find({ userId: ObjectId(userId) })
        .toArray()
      // console.log(orders)
      resolve(orders)
    })
  },
  getOrderProducts: (orderId) => {
    // console.log(orderId);
    return new Promise(async (resolve, reject) => { 
      let orderItems = await db 
        .get()
        .collection(collection.orderCollection) 
        .aggregate([ 
          {
            $match: { _id: ObjectId(orderId) },
          },
          {
            $unwind: '$products',
          },
          {
            $project: {
              items: '$products.items',
              quantity: '$products.quantity',
            },
          },
          {
            $lookup: {
              from: collection.productCollection,
              localField: 'items',
              foreignField: '_id',
              as: 'products',
            },
          },
          {
            $project: {
              items: 1,
              quantity: 1,
              products: { $arrayElemAt: ['$products', 0] },
            },
          },
        ])
        .toArray()
      // console.log(orderItems);

      resolve(orderItems[0])
    })
  },
  getUserOrdersWithProduct: (userId, proId) => {
    return new Promise(async (resolve, reject) => {
      console.log(userId, proId)
      let orders = await db
        .get()
        .collection(collection.orderCollection)
        .findOne({
          userId: ObjectId(userId),
          'products.$.items': ObjectId(proId),
        })

      console.log(orders)
      resolve(orders)
    })
  },
  generateRazorpay: (orderId, total) => {
    return new Promise((resolve, reject) => {
      var instance = new Razorpay({
        key_id: 'rzp_test_AOR6LcLadTlBtS',
        key_secret: 'P7pl9FbDIpQUQSjlsQFZaxZQ',
      })

      let order = instance.orders.create({
        amount: total * 100,
        currency: 'INR',
        receipt: '' + orderId,
      })
      // console.log("New order",order);
      resolve(order)
    })
  },
  verifyPayment: (details) => {
    console.log('hellodata', details)
    return new Promise((resolve, reject) => {
      const { createHmac } = require('crypto')
      let hmac = createHmac('sha256', 'P7pl9FbDIpQUQSjlsQFZaxZQ')

      hmac.update(
        details['payment[razorpay_order_id]'] +
          '|' +
          details['payment[razorpay_payment_id]'],
      )
      hmac = hmac.digest('hex')
      console.log(hmac)
      if (hmac == details['payment[razorpay_signature]']) {
       
        resolve()
      } else {
        reject()``
      } 
    })
  },
  changePaymentStatus: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.orderCollection)
        .update(
          { _id: ObjectId(orderId) },
          {
            $set: {
              status: 'placed',
            },
          },
        )
        .then(() => {
          resolve()
        })
    })
  },
}
