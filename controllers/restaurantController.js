const VenderRepository = require('../modules/venderRepository')
const venderRepository = new VenderRepository()
const VenderService = require('../service/venderService')
const venderService = new VenderService()
const RestaurantService = require('../service/restaurantService')
const restaurantService = new RestaurantService()

const {
  vender_input_data,
  vender_enum,
  vender_items,
  vender_rawData
} = require('../models')

const { BadRequest, BluePlanetError } = require('../utils/errors')
const errorCodes = require('../utils/errorCodes')

const keywordMinNum = 40

const venderUrl = {
  keyword: '/all_kw',
  purpose: '/purpose',
  type: '/type',
  dish: '/dish'
}

const restaurantController = {
  getKeyword: async (req, res, next) => {
    try {
      // ./keywords?restaurant_id={restaurant_id}
      const { restaurant_id } = req.query

      const restaurant = await vender_input_data.findOne({ raw: true, where: { restaurant_id } })
      // 餐廳不存在 vender DB
      if (!restaurant) {
        throw new BadRequest(errorCodes.exception_3.errorCode, errorCodes.exception_3.message)
      }
      // 餐廳資料已存在 vender DB
      if (restaurant.keyword) {
        return res.status(200).json({
          status: 'success',
          result: JSON.parse(restaurant.keyword)
        })
      } else {
        // 餐廳資料不存在 -> call 藍星球 API
        const response = await getVenderData(venderUrl.keyword, restaurant.restaurant_name)
        // 沒有回傳資料
        if (!response) {
          throw new BluePlanetError(errorCodes.exception_4.errorCode, errorCodes.exception_4.message)
        }

        // 存入 raw data table
        await vender_restaurant_keyword_rawData.create({
          vender_id,
          restaurant_id,
          posted_data: JSON.stringify({ data: restaurant.restaurant_name }),
          keyword_data: JSON.stringify({ data: response })
        })

        // update vender_input_data
        await vender_input_data.update({
          keyword: JSON.stringify(response.result)
        }, { where: { restaurant_id } })

        const responseData = {
          status: 'success',
          result: response.result
        }
        // keyword number under keywordMinNum
        if (response.result.length < keywordMinNum) {
          responseData.errorCode = errorCodes.exception_6.errorCode
          responseData.message = errorCodes.exception_6.message
        }

        return res.status(200).json(responseData)
      }
    } catch (error) {
      next(error)
    }
  },
  getPurpose: async (req, res, next) => {
    try {
      const { restaurant_id } = req.query
      // 要改成從 data1 拉資料
      const restaurant = await vender_input_data.findOne({ raw: true, where: { restaurant_id } })
      // 跟藍星球要資料
      const { response, status } = await venderService.getVenderData(venderUrl.purpose, restaurant.restaurant_name)
      if (!response.result.length) {
        return console.log('blue planet no value')
      }
      // 抓取舊資料
      const originalRecords = await venderRepository.getOriginalRecords(restaurant_id, 'purpose')

      /* 新舊資料比對 */
      // 新資料 -> response data 配對 keyId
      const newRecords = await restaurantService.matchKeyId(response.result)

      // newRecords 與 originalRecords 比較 -> get inputData
      const inputData = await restaurantService.getInputData(originalRecords, newRecords)

      // originalRecords 與 newRecords 比較 -> get removeData
      const removeData = await restaurantService.getRemoveData(originalRecords, newRecords)

      // 新增 raw data
      await venderRepository.insertRawData(restaurant_id, restaurant.restaurant_name, response, venderUrl.purpose, status)

      // 新增及刪除 vender_items
      await venderRepository.insertNewRecords(inputData, restaurant_id, restaurant.restaurant_name, 'purpose')
      await venderRepository.removeOldRecords(removeData, restaurant_id, 'purpose')

      // return data
      return res.status(200).json({
        status: 'success',
        response: {
          restaurant_id,
          restaurant_name: restaurant.restaurant_name,
          result: response.result
        }
      })
    } catch (error) {
      // 紀錄log
      console.log(error)
    }
  },
  getType: async (req, res, next) => {
    try {
      const { restaurant_id } = req.query

      const restaurant = await vender_input_data.findOne({ raw: true, where: { restaurant_id } })
      // 跟藍星球要資料
      const { response, status } = await venderService.getVenderData(venderUrl.type, restaurant.restaurant_name)
      if (!response.result.length) {
        return console.log('blue planet no value')
      }
      console.log('response', response)
      // 抓取舊資料
      const originalRecords = await venderRepository.getOriginalRecords(restaurant_id, 'type')
      console.log('originalRecords', originalRecords)
      /* 新舊資料比對 */
      // 新資料 -> response data 配對 keyId
      const newRecords = await restaurantService.matchKeyId(response.result)
      console.log('newRecords', newRecords)

      // newRecords 與 originalRecords 比較 -> get inputData
      const inputData = await restaurantService.getInputData(originalRecords, newRecords)
      console.log('inputData', inputData)

      // originalRecords 與 newRecords 比較 -> get removeData
      const removeData = await restaurantService.getRemoveData(originalRecords, newRecords)
      console.log('removeData', removeData)

      // 新增 raw data
      await venderRepository.insertRawData(restaurant_id, restaurant.restaurant_name, response, venderUrl.type, status)

      // 新增及刪除 vender_items
      await venderRepository.insertNewRecords(inputData, restaurant_id, restaurant.restaurant_name, 'type')
      await venderRepository.removeOldRecords(removeData, restaurant_id, 'type')

      // return data
      return res.status(200).json({
        status: 'success',
        response: {
          restaurant_id,
          restaurant_name: restaurant.restaurant_name,
          result: response.result
        }
      })
    } catch (error) {
      next(error)
    }
  },
  getDish: async (req, res, next) => {
    try {
      const { restaurant_id } = req.query
      const restaurant = await vender_input_data.findOne({ raw: true, where: { restaurant_id } })
      // 跟藍星球要資料
      const { response, status } = await venderService.getVenderData(venderUrl.dish, restaurant.restaurant_name)
      if (!response.result.length) {
        return console.log('blue planet no value')
      }
      console.log('response', response)
      // 抓取舊資料
      const originalRecords = await venderRepository.getOriginalRecords(restaurant_id, 'dish')
      console.log('originalRecords', originalRecords)
      /* 新舊資料比對 */
      // 新資料 -> response data 配對 keyId
      const newRecords = await restaurantService.matchKeyId(response.result)
      console.log('newRecords', newRecords)

      // newRecords 與 originalRecords 比較 -> get inputData
      const inputData = await restaurantService.getInputData(originalRecords, newRecords)
      console.log('inputData', inputData)

      // originalRecords 與 newRecords 比較 -> get removeData
      const removeData = await restaurantService.getRemoveData(originalRecords, newRecords)
      console.log('removeData', removeData)

      // 新增 raw data
      await venderRepository.insertRawData(restaurant_id, restaurant.restaurant_name, response, venderUrl.dish, status)

      // 新增及刪除 vender_items
      await venderRepository.insertNewRecords(inputData, restaurant_id, restaurant.restaurant_name, 'dish')
      await venderRepository.removeOldRecords(removeData, restaurant_id, 'dish')

      // return data
      return res.status(200).json({
        status: 'success',
        response: {
          restaurant_id,
          restaurant_name: restaurant.restaurant_name,
          result: response.result
        }
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = restaurantController
