var db = require('../config mongo/mongo-connection')
const collection = require('../config mongo/mongo-collections')
const { ObjectId } = require('mongodb')
const bcrypt = require('bcrypt')
const async = require('hbs/lib/async')
module.exports = {
  doSignup: (data) => {
    return new Promise(async (resolve, reject) => {
      {
        let admin = await db
          .get()
          .collection(collection.adminCollection)
          .findOne({ email: data.email })
        if (admin) {
          resolve({ status: true })
        } else {
          data.password = await bcrypt.hash(data.password, 10)
          let nData = {
            email: data.email,
            password: data.password,
          }
          db.get()
            .collection(collection.adminCollection)
            .insertOne(nData)
            .then((response) => {
              resolve({ status: false })
            })
        }
      }
    })
  },
  doLogin: (data) => {
    return new Promise(async (resolve, reject) => {
      let response = {}
      let admin = await db
        .get()
        .collection(collection.adminCollection)
        .findOne({ email: data.email })
      if (admin) {
        bcrypt.compare(data.password, admin.password).then((status) => {
          if (status) {
            response.status = true
            resolve({ status: true })
          } else {
            resolve({ status: false })
          }
        })
      } else {
        resolve({ status: false })
      }
    })
  },
  addProduct: (image, product) => {
    // console.log(product)
    let basicDetails = {
      name: product.name,
      brand: product.brand,
      price: parseInt(product.price),
      type: product.type,
      year: product.year,
      discription: product.discription,
      model: product.model,
      color: product.color,
      image: image,
      spec: [
        {
          frame: product.frame,
          shock: product.shock,
          Mfork: product.Mfork,
          Wfront: product.Wfront,
          Wrear: product.Wrear,
          Srear: product.Srear,
          rim: product.rim,
        },
      ],
    }
    db.get()
      .collection(collection.productCollection)
      .insertOne(basicDetails)
      .then((data) => {})
  },
  getAllProduct: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collection.productCollection)
        .find()
        .toArray()

      resolve(products)
    })
  },
  deleteProduct: (proId) => {
    console.log(proId)
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.productCollection)
        .deleteOne({ _id: ObjectId(proId) })
        .then((response) => {
          resolve(response)
        })
    })
  },
  getProductDetails: (proId) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.productCollection)
        .findOne({ _id: ObjectId(proId) })
        .then((product) => {
          resolve(product)
        })
    })
  },
  updateProduct: (proId, image, proDetails) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.productCollection)
        .updateOne(
          { _id: ObjectId(proId) },
          {
            $set: {
              name: proDetails.name,
              brand: proDetails.brand,
              type: proDetails.type,
              price: parseInt(proDetails.price),
              year: proDetails.year,
              discription: proDetails.discription,
              model: proDetails.model,
              color: proDetails.color,
              image: image,
              spec: [
                {
                  frame: proDetails.frame,
                  shock: proDetails.shock,
                  Mfork: proDetails.Mfork,
                  Wfront: proDetails.Wfront,
                  Wrear: proDetails.Wrear,
                  Srear: proDetails.Srear,
                  rim: proDetails.rim,
                },
              ],
            },
          },
        )
        .then((resosponse) => {
          resolve()
        })
    })
  },
  getUsers: () => {
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collection.userCollection)
        .find()
        .toArray()

      resolve(user)
    })
  },
  blockUser: (userId) => {
    console.log(userId)
    return new Promise(async (resolve, reject) => {
      let block = await db
        .get()
        .collection(collection.userCollection)
        .updateOne(
          { _id: ObjectId(userId) },
          {
            $set: { blocked: true },
          },
        )
      resolve(block)
    })
  },
  unBlockUser: (userId) => {
    console.log(userId)
    return new Promise(async (resolve, reject) => {
      let unblocblock = await db
        .get()
        .collection(collection.userCollection)
        .updateOne(
          { _id: ObjectId(userId) },
          {
            $set: { blocked: false },
          },
        )
      resolve()
    })
  },
  userOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      console.log(userId)
      let orders = await db
        .get()
        .collection(collection.orderCollection)
        .aggregate([
          {
            $match: { userId: ObjectId(userId) },
          },

          {
            $project: {
              status: 1,
              total: 1,
              date: 1,
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
        ])
        .toArray()

      resolve(orders)
    })
  },
  totalByTheUser: (userId) => {
    return new Promise(async (resolve, reject) => {
      let total = await db
        .get()
        .collection(collection.orderCollection)
        .aggregate([
          {
            $match: { userId: ObjectId(userId) },
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$total' },
            },
          },
          {
            $project: { total: 1, _id: 0 },
          },
        ])
        .toArray()

      resolve(total[0].total)
    })
  },
  allOrders: () => {
    return new Promise(async (resolve, reject) => {
      let allOrders = await db
        .get()
        .collection(collection.orderCollection)
        .aggregate([
          {
            $project: {
              status: 1,
              total: 1,
              date: 1,
              items: '$products.items',
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
        ])
        .toArray()

      resolve(allOrders)
    })
  },
  coupen: (data) => {
    let coupenObj = {
      type: 'coupen',
      name: data.name.toUpperCase(),
      discount: parseInt(data.discount),
    }
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.adminCollection)
        .insertOne(coupenObj)
        .then(() => {
          resolve()
        })
    })
  },
  getCoupen: () => {
    return new Promise(async (resolve, reject) => {
      let coupen = await db
        .get()
        .collection(collection.adminCollection)
        .find({ type: 'coupen' })
        .toArray()

      resolve(coupen)
    })
  },
  coupenDelete: (coupenId) => {
    console.log(coupenId)
    return new Promise(async (resolve, reject) => {
      let coupenDelete = await db
        .get()
        .collection(collection.adminCollection)
        .deleteOne({ _id: ObjectId(coupenId.coupenId) })
      resolve(coupenDelete)
    })
  },
  revenue: () => {
    return new Promise(async (resolve, reject) => {
      let revenue = await db
        .get()
        .collection(collection.orderCollection)
        .aggregate([
          {
            $match: { status: 'placed' },
          },
          {
            $group: {
              _id: null,
              revenue: { $sum: '$total' },
            },
          },
        ])
        .toArray()

      resolve(revenue)
    })
  },
  orders: () => {
    return new Promise(async (resolve, reject) => {
      let orders = await db.get().collection(collection.orderCollection).count()

      resolve(orders)
    })
  },
  users: () => {
    return new Promise(async (resolve, reject) => {
      let users = await db.get().collection(collection.userCollection).count()

      resolve(users)
    })
  },

  getRevenue: () => {
    return new Promise(async (resolve, reject) => {
      let revenue = await db
        .get()
        .collection(collection.orderCollection)
        .aggregate([
          {
            $match: { status: 'placed' },
          },
          {
            $project: {
              date: 1,
              total: 1,
              _id: 0,
            },
          },
        ])
        .toArray()

      let arrRevenue = []
      let months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
      for (i in months) {
        let oneRevenue = 0
        for (j of revenue) {
          console.log('dddd', j.date)
          let oneMonth = new Date(parseInt(j.date)).getHours()
          if (oneMonth === months[i]) {
            oneRevenue = oneRevenue + j.total
          }
        }
        arrRevenue.push(oneRevenue)
      }
      resolve(arrRevenue)
    })
  },
}
