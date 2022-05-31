var db = require('../config mongo/mongo-connection')
const collection = require('../config mongo/mongo-collections')
const { ObjectId } = require('mongodb')
module.exports = {
  addProduct: (product, callback) => {
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
      .then((data) => {
        //   console.log(data);
        callback(data.insertedId)
      })
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
  updateProduct: (proId, proDetails) => {
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
              price: proDetails.price,
              year: proDetails.year,
              discription: proDetails.discription,
              model: proDetails.model,
              color: proDetails.color,
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
        ).then((resosponse) => {
          resolve()
        })
    })
  },
}
