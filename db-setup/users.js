/* eslint-disable no-undef */
/* eslint-disable no-async-promise-executor */
const collection = require('../config mongo/mongo-collections')
const db = require('../config mongo/mongo-connection')
const bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')
require('dotenv').config()
const Razorpay = require('razorpay')

module.exports = {
  DoSignup: (data) => {
    return new Promise(async (resolve, reject) => {
      const user = await db
        .get()
        .collection(collection.userCollection)
        .findOne({ email: data.email })
      if (user) {
        console.log('user already exist')
        resolve({ status: true })
      } else {
        data.password = await bcrypt.hash(data.password, 10)
        const nData = {
          fname: data.fname.toUpperCase(),
          lname: data.lname,
          email: data.email,
          password: data.password
        }
        db.get()
          .collection(collection.userCollection)
          .insertOne(nData)
          .then((response) => {
            console.log(response)
            resolve({ status: false })
          })
      }
    })
  },
  DoLogin: (data) => {
    console.log(data)
    return new Promise(async (resolve, reject) => {
      const response = {}
      const user = await db
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
  search: (key) => {
    return new Promise(async (resolve, reject) => {
      const products = await db
        .get()
        .collection(collection.productCollection)
        .find({
          $or: [
            { name: { $regex: key.search, $options: 'i' } },
            { brand: { $regex: key.search, $options: 'i' } },
            { type: { $regex: key.search, $options: 'i' } }
          ]
        })
        .toArray()
      console.log(products)
      resolve(products)
    })
  },
  getproducts: (data) => {
    return new Promise(async (resolve, reject) => {
      const product = await db
        .get()
        .collection(collection.productCollection)
        .find({ type: data })
        .toArray()

      resolve(product)
    })
  },
  getOneProduct: (proId) => {
    console.log(proId)
    return new Promise(async (resolve, reject) => {
      const product = await db
        .get()
        .collection(collection.productCollection)
        .findOne({ _id: ObjectId(proId) })
      resolve(product)
    })
  },

  addToCart: (proId, userId) => {
    const d = new Date()
    const time =
      ('0' + d.getDate()).slice(-2) +
      '-' +
      ('0' + (d.getMonth() + 1)).slice(-2) +
      '-' +
      d.getFullYear() +
      ' ' +
      ('0' + d.getHours()).slice(-2) +
      ':' +
      ('0' + d.getMinutes()).slice(-2)
    const proObj = {
      items: ObjectId(proId),
      quantity: 1,
      date: time
    }
    return new Promise(async (resolve, reject) => {
      const userCart = await db
        .get()
        .collection(collection.cartCollection)
        .findOne({ user: ObjectId(userId) })
      if (userCart) {
        // console.log(userCart)
        const proExist = userCart.product.findIndex(
          (product) => product.items === proId
        )

        if (proExist !== -1) {
          db.get()
            .collection(collection.cartCollection)
            .updateOne(
              { user: ObjectId(userId), 'product.items': ObjectId(proId) },
              {
                $inc: { 'product.$.quantity': 1 }
              }
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
                $push: { product: proObj }
              }
            )
            .then((response) => {
              resolve(response)
            })
        }
      } else {
        const cartObj = {
          user: ObjectId(userId),
          product: [proObj]
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
      const cartItems = await db
        .get()
        .collection(collection.cartCollection)
        .aggregate([
          {
            $match: { user: ObjectId(userId) }
          },
          {
            $unwind: '$product'
          },

          {
            $project: {
              items: '$product.items',
              quantity: '$product.quantity',
              date: '$product.date'
            }
          },
          {
            $lookup: {
              from: collection.productCollection,
              localField: 'items',
              foreignField: '_id',
              as: 'products'
            }
          },
          {
            $project: {
              date: 1,
              items: 1,
              quantity: 1,
              products: { $arrayElemAt: ['$products', 0] }
            }
          },
          { $sort: { date: -1 } }
        ])
        .toArray()
      resolve(cartItems)
    })
  },
  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0
      const cart = await db
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
    details.count = parseInt(details.count)
    return new Promise((resolve, reject) => {
      if (details.count === -1 && details.quantity === 1) {
        db.get()
          .collection(collection.cartCollection)
          .updateOne(
            { _id: ObjectId(details.cart) },
            {
              $pull: { product: { items: ObjectId(details.product) } }
            }
          )
          .then((response) => {
            resolve({ removeProduct: true })
          })
      } else {
        db.get()
          .collection(collection.cartCollection)
          .updateOne(
            {
              _id: ObjectId(details.cart),
              'product.items': ObjectId(details.product)
            },
            {
              $inc: { 'product.$.quantity': details.count }
            }
          )
          .then((response) => {
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
            $pull: { product: { items: ObjectId(details.product) } }
          }
        )
        .then((response) => {
          resolve({ removeProduct: true })
        })
    })
  },
  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      const total = await db
        .get()
        .collection(collection.cartCollection)
        .aggregate([
          {
            $match: { user: ObjectId(userId) }
          },
          {
            $unwind: '$product'
          },
          {
            $project: {
              items: '$product.items',
              quantity: '$product.quantity'
            }
          },
          {
            $lookup: {
              from: collection.productCollection,
              localField: 'items',
              foreignField: '_id',
              as: 'products'
            }
          },
          {
            $project: {
              items: 1,
              quantity: 1,
              products: { $arrayElemAt: ['$products', 0] }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ['$quantity', '$products.price'] } }
            }
          }
        ])
        .toArray()

      resolve(total[0].total)
    })
  },
  palceOrder: (order, products, total, userId, Applied) => {
    console.log(order)
    const d = new Date()
    const time =
      ('0' + d.getDate()).slice(-2) +
      '-' +
      ('0' + (d.getMonth() + 1)).slice(-2) +
      '-' +
      d.getFullYear() +
      ' ' +
      ('0' + d.getHours()).slice(-2) +
      ':' +
      ('0' + d.getMinutes()).slice(-2)

    return new Promise((resolve, reject) => {
      const status = order['payment-method'] === 'COD' ? 'placed' : 'cancelled'
      const oderObj = {
        AddIndex: parseInt(order.Address),
        userId: ObjectId(userId),
        paymentMethod: order['payment-method'],
        products,
        status,
        total,
        date: time,
        coupen: Applied
      }
      db.get()
        .collection(collection.orderCollection)
        .insertOne(oderObj)
        .then((response) => {
          db.get()
            .collection(collection.cartCollection)
            .deleteOne({ user: ObjectId(userId) })
          resolve(response.insertedId)
        })
    })
  },
  getCartProductList: (userId) => {
    return new Promise(async (resolve, reject) => {
      const cart = await db
        .get()
        .collection(collection.cartCollection)
        .findOne({ user: ObjectId(userId) })
      resolve(cart.product)
    })
  },
  getUserOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      console.log(userId)
      const orders = await db
        .get()
        .collection(collection.orderCollection)
        .aggregate([
          {
            $match: { userId: ObjectId(userId) }
          },

          {
            $project: {
              status: 1,
              total: 1,
              date: 1,
              items: '$products.items',
              quantity: '$products.quantity'
            }
          },
          {
            $lookup: {
              from: collection.productCollection,
              localField: 'items',
              foreignField: '_id',
              as: 'products'
            }
          },

          { $sort: { date: -1 } }
        ])
        .toArray()

      resolve(orders)
    })
  },
  getOrderProducts: (orderId) => {
    // console.log(orderId);
    return new Promise(async (resolve, reject) => {
      const orderItems = await db
        .get()
        .collection(collection.orderCollection)
        .aggregate([
          {
            $match: { _id: ObjectId(orderId) }
          },
          {
            $unwind: '$products'
          },
          {
            $project: {
              AddIndex: 1,
              userId: 1,
              coupen: 1,
              paymentMethod: 1,
              status: 1,
              total: 1,
              date: 1,
              items: '$products.items',
              quantity: '$products.quantity'
            }
          },
          {
            $lookup: {
              from: collection.productCollection,
              localField: 'items',
              foreignField: '_id',
              as: 'product'
            }
          },
          {
            $lookup: {
              from: collection.userCollection,
              localField: 'userId',
              foreignField: '_id',
              as: 'user'
            }
          }
        ])
        .toArray()

      resolve(orderItems)
    })
  },
  getUserOrdersWithProduct: (userId, proId) => {
    return new Promise(async (resolve, reject) => {
      console.log(userId, proId)
      const orders = await db
        .get()
        .collection(collection.orderCollection)
        .findOne({
          userId: ObjectId(userId),
          'products.$.items': ObjectId(proId)
        })

      console.log(orders)
      resolve(orders)
    })
  },
  generateRazorpay: (orderId, total) => {
    return new Promise((resolve, reject) => {
      const instance = new Razorpay({
        key_id: process.env.KEY_ID,
        key_secret: process.env.KEY_SECRET
      })

      const order = instance.orders.create({
        amount: total * 100,
        currency: 'INR',
        receipt: '' + orderId
      })

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
          details['payment[razorpay_payment_id]']
      )
      hmac = hmac.digest('hex')
      console.log(hmac)
      if (hmac === details['payment[razorpay_signature]']) {
        resolve()
      } else {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject()
      }
    })
  },
  changePaymentStatus: (orderId) => {
    console.log('50', orderId)
    if (orderId) {
      return new Promise((resolve, reject) => {
        db.get()
          .collection(collection.orderCollection)
          .update(
            { _id: ObjectId(orderId) },
            {
              $set: {
                status: 'placed'
              }
            }
          )
          .then(() => {
            resolve()
          })
      })
    } else {
      console.log('reject')
      reject()
    }
  },
  getProfile: (userId) => {
    console.log('db', userId)
    return new Promise(async (resolve, reject) => {
      const profile = await db
        .get()
        .collection(collection.userCollection)
        .findOne({ _id: ObjectId(userId) })

      resolve(profile)
    })
  },
  editProfile: (userId, profile) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.userCollection)
        .updateOne(
          { _id: ObjectId(userId) },
          {
            $set: {
              fname: profile.fname,
              lname: profile.lname,
              email: profile.email,
              gender: profile.gender
            }
          }
        )
        .then(() => {
          resolve()
        })
    })
  },
  createAddress: (userId, data) => {
    deliveryAddress = {
      _id: ObjectId(),
      fname: data.fname,
      lname: data.lname,
      mobile: data.mobile,
      pincode: data.pincode,
      address: data.address,
      locality: data.locality,
      city: data.city,
      state: data.state,
      addressType: data.addressType
    }

    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.userCollection)
        .updateOne(
          { _id: ObjectId(userId) },
          {
            $push: { delivaryAddress: deliveryAddress }
          }
        )
        .then((comfirm) => {
          console.log(comfirm)
          resolve()
        })
    })
  },
  findAddress: (userId, Id) => {
    return new Promise(async (resolve, reject) => {
      const address = await db
        .get()
        .collection(collection.userCollection)
        .aggregate([
          {
            $unwind: '$delivaryAddress'
          },
          {
            $match: { 'delivaryAddress._id': ObjectId(Id) }
          },
          {
            $project: {
              delivaryAddress: 1,
              _id: 0
            }
          }
        ])
        .toArray()

      resolve(address[0].delivaryAddress)
    })
  },
  editAddress: (userId, Id, address) => {
    const Newaddress = {
      _id: ObjectId(),
      fname: address.fname,
      lname: address.lname,
      mobile: address.mobile,
      pincode: address.pincode,
      address: address.address,
      locality: address.locality,
      city: address.city,
      state: address.state,
      addressType: address.addressType
    }
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.userCollection)
        .updateOne(
          { _id: ObjectId(userId), 'delivaryAddress._id': ObjectId(Id) },
          {
            $set: { 'delivaryAddress.$': Newaddress }
          }
        )
        .then((response) => {
          resolve()
        })
    })
  },
  deleteAddress: (Id, userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.userCollection)
        .updateOne(
          { _id: ObjectId(userId) },

          {
            $pull: { delivaryAddress: { _id: ObjectId(Id) } }
          }
        )
        .then((response) => {
          resolve()
        })
    })
  },
  getCoupen: () => {
    return new Promise(async (resolve, reject) => {
      const coupens = await db
        .get()

        .collection(collection.adminCollection)
        .findOne({ type: 'coupen' })
      console.log(coupens)
      resolve(coupens)
    })
  }
}
