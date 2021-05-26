const apiHelper = require('../../utils/helper')
const token = process.env.token
const qs = require('qs')
const vender_id = 1

const {
  vender_input_data,
  vender_cuisine_dish_rawData,
  vender_cuisine_type_rawData,
  vender_restaurant_keyword_rawData,
  vender_restaurant_review_rawData,
  vender_suitable_purpose_rawData,
  venders
} = require('../../models')

const { BadRequest, NotFound, InputInvalid } = require('../../utils/errors')
const dayjs = require('dayjs')
const time = dayjs().format("YYYY-MM-DD", { timeZone: "zh-tw" })

const restaurantController = {
  getKeyword: async (req, res, next) => {
    try {
      // ./keywords?restaurant_id={restaurant_id}
      const { restaurant_id } = req.query
      if (!restaurant_id) {
        throw new BadRequest('Missing keyword for request.')
      }
      const restaurant = await vender_input_data.findOne({ raw: true, where: { restaurant_id } })
      console.log('restaurant', restaurant)
      if (restaurant.keyword) {
        return res.status(200).json({
          status: 'success',
          result: restaurant.keyword
        })
      } else {
        const response = await venderAction.getVenderKeyword(restaurant.restaurant_name)
        console.log('response', response.data)
        // 存入 raw data table
        await vender_restaurant_keyword_rawData.create({
          vender_id,
          restaurant_id,
          posted_data: JSON.stringify({ keyword: restaurant.restaurant_name }),
          keyword_data: JSON.stringify({ data: response.data })
        })
        console.log('done for raw data')
        // update vender_input_data
        await vender_input_data.update({
          keyword: JSON.stringify(response.data.result)
        }, { where: { restaurant_id } })

        return res.status(200).json({
          status: 'success',
          result: response.data.result
        })
      }
    } catch (error) {
      next(error)
    }
  },
  getPurpose: async (req, res, next) => {
    try {
      // ./purpose?restaurant_id={restaurantId}
      const { restaurant_id } = req.query
      if (!restaurant_id) {
        throw new BadRequest('Missing keyword for request.')
      }
      const restaurant = await vender_input_data.findOne({ raw: true, where: { restaurant_id } })
      console.log('restaurant', restaurant)
      if (restaurant.purpose) {
        return res.status(200).json({
          status: 'success',
          result: restaurant.keyword
        })
      } else {
        const response = await venderAction.getVenderPurpose(restaurant.restaurant_name)
        console.log('response', response.data)
        // 存入 raw data table
        await vender_suitable_purpose_rawData.create({
          vender_id,
          restaurant_id,
          posted_data: JSON.stringify({ purpose: restaurant.restaurant_name }),
          suitable_purpose_data: JSON.stringify({ data: response.data })
        })
        console.log('done for raw data')
        // update vender_input_data
        await vender_input_data.update({
          purpose: JSON.stringify(response.data.result)
        }, { where: { restaurant_id } })

        return res.status(200).json({
          status: 'success',
          result: response.data.result
        })
      }
    } catch (error) {
      next(error)
    }
  },
  getType: async (req, res, next) => {
    try {
      // ./type?restaurant_id={restaurantId}
      const { restaurant_id } = req.query
      if (!restaurant_id) {
        throw new BadRequest('Missing keyword for request.')
      }
      const restaurant = await vender_input_data.findOne({ raw: true, where: { restaurant_id } })
      console.log('restaurant', restaurant)
      if (restaurant.type) {
        return res.status(200).json({
          status: 'success',
          result: restaurant.keyword
        })
      } else {
        const response = await venderAction.getVenderType(restaurant.restaurant_name)
        console.log('response', response.data)
        // 存入 raw data table
        await vender_cuisine_type_rawData.create({
          vender_id,
          restaurant_id,
          posted_data: JSON.stringify({ purpose: restaurant.restaurant_name }),
          cuisine_type_data: JSON.stringify({ data: response.data })
        })
        console.log('done for raw data')
        // update vender_input_data
        await vender_input_data.update({
          type: JSON.stringify(response.data.result)
        }, { where: { restaurant_id } })

        return res.status(200).json({
          status: 'success',
          result: response.data.result
        })
      }
    } catch (error) {
      next(error)
    }
  },
  getDish: async (req, res) => {
    try {
    } catch (error) {
      console.log(error);
    }
  },
};

const venderAction = {
  getVenderKeyword: (kw) => {
    return new Promise((resolve, reject) => {
      resolve(apiHelper.post('/all_kw', qs.stringify({ token, kw })))
    })
  },
  getVenderPurpose: (kw) => {
    return new Promise((resolve, reject) => {
      resolve(apiHelper.post('/purpose', qs.stringify({ token, kw })))
    })
  },
  getVenderType: (kw) => {
    return new Promise((resolve, reject) => {
      resolve(apiHelper.post('/type', qs.stringify({ token, kw })))
    })
  },
  getVenderDish: async (kw) => {
    try {

    } catch (error) {

    }
  }
}

module.exports = restaurantController
