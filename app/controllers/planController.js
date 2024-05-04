'use strict';

const db = require('../models');
const Plan = db.plan;
const constants = require('../utls/constants');
const excel = require('exceljs');
var mongoose = require('mongoose');
// const stripe = require('stripe')(process.env.SECREATKEY);

module.exports = {
  /**
   * Creating Plan With cat interval
   */

  createPlan: async (req, res) => {
    try {
      const data = req.body;
      if (!req.body.name) {
        return res.status(400).json({
          success: false,
          error: { code: 400, message: constants.onBoarding.PAYLOAD_MISSING },
        });
      }
     data.name =(data.name).toLowerCase()
      var query = {};
      query.isDeleted = false;
      query.name = data.name;
      const existed = await Plan.findOne(query);

      if (existed) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: constants.plan.ALREADY_EXIST,
          },
        });
      }
      var pricing = [];

      if (data.monthlyPrice) {
        for (let [key, value] of Object.entries(data.monthlyPrice)) {
          pricing.push({
            interval: 'month',
            interval_count: 1,
            currency: key.toLowerCase(),
            unit_amount: Number(value),
          });
        }
      }

      if (data.threeMonthPrice) {
        for (let [key, value] of Object.entries(data.threeMonthPrice)) {
          pricing.push({
            interval: 'month',
            interval_count: 3,
            currency: key.toLowerCase(),
            unit_amount: Number(value),
          });
        }
      }

      if (data.sixMonthPrice) {
        for (let [key, value] of Object.entries(data.sixMonthPrice)) {
          pricing.push({
            interval: 'month',
            interval_count: 6,
            currency: key.toLowerCase(),
            unit_amount: Number(value),
          });
        }
      }

      if (data.yearlyPrice) {
        for (let [key, value] of Object.entries(data.yearlyPrice)) {
          pricing.push({
            interval: 'month',
            interval_count: 12,
            currency: key.toLowerCase(),
            unit_amount: Number(value),
          });
        }
      }
      const product = await stripe.products.create({
        name: data.name,
      });
      data.stripe_product_id = product.id;
      for await (const itm of pricing) {
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: itm.unit_amount * 1000,
          currency: itm.currency,
          recurring: {
            interval: itm.interval,
            interval_count: itm.interval_count,
          },
        });
        itm.stripe_price_id = price.id;
      }
      data.pricing = pricing;
      const created = await Plan.create(data);
    
      return res.status(200).json({
        success: true,
        message: constants.plan.CREATED,
      });
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + err },
      });
    }
  },

  /**Getting Plan detail data using id */
  planDetail: async (req, res) => {
    try {
      const id = req.query.id;

      var plan = await Plan.findById(id)

      var featureDetails = [];

      // if (plan && plan.feature && plan.feature.length > 0) {
      //   for await (let id of plan.feature) {
      //     const get_features = await db.features.findOne({
      //       _id: id,
      //       isDeleted: false,
      //     });
      //     featureDetails.push(get_features);
      //   }
      // }

      var plan_doc;
      plan_doc = Object.assign({}, plan._doc);
      // plan_doc['featureDetails'] = featureDetails;

      return res.status(200).json({
        success: true,
        data: plan_doc,
      });
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + err },
      });
    }
  },

  updatePlan: async (req, res) => {
    try {
      const data = req.body
      if (!req.body.id) {
        return res.status(400).json({
          success: false,
          error: { code: 400, message: constants.onBoarding.PAYLOAD_MISSING },
        });
      }
      const plan = await Plan.findById(req.body.id)

      var pricing = [];

      for await (const itm of data.pricing) {
        if (itm.stripe_price_id) {
          let obj = plan.pricing.find(o => o.stripe_price_id == itm.stripe_price_id);
          if (Number(obj.unit_amount) != Number(itm.unit_amount)) {

            const price = await stripe.prices.create({
              product: req.body.stripe_product_id,
              unit_amount: itm.unit_amount * 1000,
              currency: itm.currency,
              recurring: {
                interval: itm.interval,
                interval_count: itm.interval_count,
              },
            });
            pricing.push({ "old": itm.stripe_price_id, "new": price.id })
            itm.stripe_price_id = price.id;

          }
        } else {
          const price = await stripe.prices.create({
            product: req.body.stripe_product_id,
            unit_amount: itm.unit_amount * 1000,
            currency: itm.currency,
            recurring: {
              interval: itm.interval,
              interval_count: itm.interval_count,
            },
          });
          itm.stripe_price_id = price.id;
        }


      }



      if (pricing && pricing.length > 0) {
        for await (let itm of pricing) {
          const subscribedUsers = db.users.find({ isDeleted: false, stripe_price_id: itm.old })

          if (subscribedUsers && subscribedUsers.length > 0) {
            for await (let usr of subscribedUsers) {
              try {
                const deleted = await stripe.subscriptions.cancel(
                  usr.subscriptionId
                );
                console.log(deleted, '-------cancelOldSubscription');
              } catch (err) {
                console.log(err);
              }
            }

            const subscription = await stripe.subscriptions.create({
              customer: usr.customer_id,
              items: [
                {
                  price: itm.new,
                },
              ],
            });
            let subscriptionData = {}
            let dt = new Date();
            dt.setMonth(dt.getMonth() + Number(data.planInterval));
            subscriptionData.subscription = subscription;
            subscriptionData.userId = usr.id;
            subscriptionData.validUpTo = dt;
            subscriptionData.createdAt = new Date();
            subscriptionData.updatedAt = new Date();
            subscriptionData.subscriptionId = subscription.id

            const createdSubscription = await db.subscriptions.create(subscriptionData);

            await db.users.updateOne(
              { _id: req.identity.id },
              { subscriptionId: subscription.id, stripe_price_id: itm.new }
            );
          }
        }
      }
      const updatedPlan = await Plan.updateOne({ _id: req.body.id }, req.body);

      return res.status(200).json({
        success: true,
        message: constants.plan.UPDATED,
        pricing: pricing
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + err },
      });
    }
  },

  getAllPlans: async (req, res) => {
    try {
      var search = req.query.search;
      var page = req.query.page;
      var sortBy = req.query.sortBy;
      let status = req.query.status;
      let interval = req.query.interval;
      let currencyId = req.query.currencyId;

      var count = req.query.count;

      var query = {};

      if (search) {
        query.$or = [
          {
            name: { $regex: search, $options: 'i' },
          },
          {
            categoryName: { $regex: search, $options: 'i' },
          },
          {
            interval: { $regex: search, $options: 'i' },
          },
          {
            currencyName: { $regex: search, $options: 'i' },
          },
          {
            price: { $regex: Number(search), $options: 'i' },
          },
        ];
      }
      if (interval) {
        query.interval = interval;
      }

      query.isDeleted = false;

      var sortquery = {};
      if (sortBy) {
        var order = sortBy.split(' ');
        var field = order[0];
        var sortinterval = order[1];
      }

      sortquery[field ? field : 'order'] = sortinterval
        ? sortinterval == 'asc'
          ? 1
          : -1
        : 1;
      if (status) {
        query.status = status;
      }

      if (currencyId) {
        query.currency = mongoose.Types.ObjectId(currencyId);
      }
      const pipeline = [
        {
          $lookup: {
            from: 'currencies',
            localField: 'currencyId',
            foreignField: '_id',
            as: 'currencyId',
          },
        },

        {
          $unwind: {
            path: '$currencyId',
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category',
          },
        },

        {
          $unwind: {
            path: '$category',
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $project: {
            id: '$_id',
            name: '$name',
            price: '$price',
            status: '$status',
            interval: '$interval',
            feature: '$feature',
            currencyId: '$currencyId',
            currency: '$currencyId._id',
            currencyName: '$currency.name',
            stripe_plan_id: '$stripe_plan_id',
            recommended: '$recommended',
            monthlyPrice: '$monthlyPrice',
            threeMonthPrice: '$threeMonthPrice',
            sixMonthPrice: '$sixMonthPrice',
            yearlyPrice: '$yearlyPrice',
            createdAt: '$createdAt',
            updatedAt: '$updatedAt',
            order: '$order',
            isDeleted: '$isDeleted',
            trial_period_days: '$trial_period_days',
          },
        },
        {
          $match: query,
        },
        {
          $sort: sortquery,
        },
      ];

      const total = await Plan.aggregate([...pipeline]);

      if (page && count) {
        var skipNo = (Number(page) - 1) * Number(count);

        pipeline.push(
          {
            $skip: Number(skipNo),
          },
          {
            $limit: Number(count),
          }
        );
      }

      const result = await Plan.aggregate([...pipeline]);

      for await (let itm of result){
        let subscriptionQuery = {}
        subscriptionQuery.isDeleted = false
        subscriptionQuery.planId = itm.id
        subscriptionQuery.validUpTo = {$gt:new Date()}
        subscriptionQuery.status = 'active'
        const activeSubscription = await db.subscriptions.find(subscriptionQuery)
        if(activeSubscription && activeSubscription.length > 0){
          itm.activeSubscription = true
        }else{
          itm.activeSubscription = false
        }
      }

      return res.status(200).json({
        success: true,
        data: result,
        total: total.length,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: { code: 500, message: '' + err },
      });
    }
  },

  changeStatus: async (req, res) => {
    try {
      const id = req.body.id;
      const status = req.body.status;

      const updatedStatus = await Plan.updateOne(
        { _id: id },
        { status: status }
      );

      return res.status(200).json({
        success: true,
        message: constants.plan.STATUS_CHANGED,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + err },
      });
    }
  },

  deletePlan: async (req, res) => {
    try {
      const id = req.query.id;
      const deletedUser = await Plan.updateOne(
        { _id: id },
        { isDeleted: true }
      );

      return res.status(200).json({
        success: true,
        message: constants.plan.DELETED,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + err },
      });
    }
  },

  /**Generate Excel sheet */
  exportPlanData: async (req, res) => {
    try {
      var search = req.query.search;
      var page = req.query.page;
      var sortBy = req.query.sortBy;
      let status = req.query.status;
      let interval = req.query.interval;
      let currencyId = req.query.currencyId;

      var count = req.query.count;

      var query = {};

      if (search) {
        query.$or = [
          {
            name: { $regex: search, $options: 'i' },
          },
        ];
      }
      if (interval) {
        query.interval = interval;
      }

      query.isDeleted = false;

      var sortquery = {};
      if (sortBy) {
        var order = sortBy.split(' ');
        var field = order[0];
        var sortinterval = order[1];
      }

      sortquery[field ? field : 'createdAt'] = sortinterval
        ? sortinterval == 'desc'
          ? -1
          : 1
        : -1;
      if (status) {
        query.status = status;
      }

      if (currencyId) {
        query.currency = mongoose.Types.ObjectId(currencyId);
      }
      const pipeline = [
        {
          $lookup: {
            from: 'currencies',
            localField: 'currencyId',
            foreignField: '_id',
            as: 'currencyId',
          },
        },

        {
          $unwind: {
            path: '$currencyId',
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $project: {
            id: '$_id',
            name: '$name',
            price: '$price',
            status: '$status',
            interval: '$interval',
            feature: '$feature',
            currencyId: '$currencyId',
            currency: '$currencyId._id',
            currency_name: '$currencyId.currency',
            stripe_plan_id: '$stripe_plan_id',
            recommended: '$recommended',
            createdAt: '$createdAt',
            isDeleted: '$isDeleted',
          },
        },
        {
          $match: query,
        },
        {
          $sort: sortquery,
        },
      ];

      const total = await Plan.aggregate([...pipeline]);

      if (page && count) {
        var skipNo = (Number(page) - 1) * Number(count);

        pipeline.push(
          {
            $skip: Number(skipNo),
          },
          {
            $limit: Number(count),
          }
        );
      }

      const result = await Plan.aggregate([...pipeline]);

      var PlanData = [];
      var counter = 1;
      for await (let obj of result) {
        if (obj.status == 'deactive') {
          obj.status = 'Inactive';
        }
        var features = '';
        if (obj.feature) {
          for (let [key, value] of Object.entries(obj.feature)) {
            if (value && value.length > 0) {
              for await (let feature of value) {
                features += feature.name + ' ,';
              }
            }
          }
        }
        PlanData.push({
          counter: counter || '-',
          name: obj.name || '-',
          price: obj.price || '-',
          interval: obj.interval || '-',
          currency_name: obj.currency_name || '-',
          status: obj.status || '-',
          stripe_plan_id: obj.stripe_plan_id || '-',
          recommended: obj.recommended || '-',
          feature: features,
          createdAt: new Date(obj.createdAt).toDateString(),
        });

        counter++;
      }
      var excelFileName = `PlanDetails`;
      let workbook = new excel.Workbook();
      let worksheet = workbook.addWorksheet(excelFileName);

      worksheet.columns = [
        { header: 'Serial No.', key: 'counter', width: 10 },
        { header: 'Name', key: 'name', width: 20 },
        { header: 'Price', key: 'price', width: 10 },
        { header: 'Recommended', key: 'recommended', width: 10 },
        // { header: 'Currency', key: 'currency_name', width: 20 },
        { header: 'Features', key: 'feature', width: 25 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Creation Date', key: 'createdAt', width: 17 },
      ];

      // Add Array Rows
      worksheet.addRows(PlanData);

      // Add autofilter on each column
      worksheet.autoFilter = 'A1:F1';

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=' + excelFileName + '.xlsx'
      );

      return workbook.xlsx.write(res).then(function () {
        res.status(200).end();
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: { code: 500, message: '' + err },
      });
    }
  },

  // frontendPlanListing: async (req, res) => {
  //   try {
  //     var search = req.query.search;
  //     var page = req.query.page;
  //     var sortBy = req.query.sortBy;
  //     let status = req.query.status;
  //     let interval = req.query.interval;
  //     let currencyId = req.query.currencyId;

  //     var count = req.query.count;

  //     var query = {};

  //     if (search) {
  //       query.$or = [
  //         {
  //           name: { $regex: search, $options: 'i' },
  //         },
  //         {
  //           categoryName: { $regex: search, $options: 'i' },
  //         },
  //         {
  //           interval: { $regex: search, $options: 'i' },
  //         },
  //         {
  //           currencyName: { $regex: search, $options: 'i' },
  //         },
  //         {
  //           price: { $regex: Number(search), $options: 'i' },
  //         },
  //       ];
  //     }
  //     if (interval) {
  //       query.interval = interval;
  //     }

  //     query.isDeleted = false;
  //     query.status = 'active';

  //     var sortquery = {};
  //     if (sortBy) {
  //       var order = sortBy.split(' ');
  //       var field = order[0];
  //       var sortinterval = order[1];
  //     }

  //     sortquery[field ? field : 'order'] = sortinterval
  //       ? sortinterval == 'asc'
  //         ? 1
  //         : -1
  //       : 1;
  //     if (status) {
  //       query.status = status;
  //     }

  //     if (currencyId) {
  //       query.currency = mongoose.Types.ObjectId(currencyId);
  //     }
  //     const pipeline = [
  //       // {
  //       //   $lookup: {
  //       //     from: 'currencies',
  //       //     localField: 'currencyId',
  //       //     foreignField: '_id',
  //       //     as: 'currencyId',
  //       //   },
  //       // },

  //       // {
  //       //   $unwind: {
  //       //     path: '$currencyId',
  //       //     preserveNullAndEmptyArrays: true,
  //       //   },
  //       // },

  //       // {
  //       //   $lookup: {
  //       //     from: 'categories',
  //       //     localField: 'category',
  //       //     foreignField: '_id',
  //       //     as: 'category',
  //       //   },
  //       // },

  //       // {
  //       //   $unwind: {
  //       //     path: '$category',
  //       //     preserveNullAndEmptyArrays: true,
  //       //   },
  //       // },

  //       {
  //         $project: {
  //           id: '$_id',
  //           name: '$name',
  //           price: '$price',
  //           status: '$status',
  //           interval: '$interval',
  //           feature: '$feature',
  //           currencyId: '$currencyId',
  //           currency: '$currencyId._id',
  //           currencyName: '$currency.name',
  //           stripe_plan_id: '$stripe_plan_id',
  //           category: '$category',
  //           categoryName: '$category.name',
  //           recommended: '$recommended',
  //           monthlyPrice: '$monthlyPrice',
  //           threeMonthPrice: '$threeMonthPrice',
  //           sixMonthPrice: '$sixMonthPrice',
  //           yearlyPrice: '$yearlyPrice',
  //           stripe_product_id: '$stripe_product_id',
  //           pricing: '$pricing',
  //           order: '$order',
  //           createdAt: '$createdAt',
  //           isDeleted: '$isDeleted',
  //           trial_period_days: '$trial_period_days',
  //         },
  //       },
  //       {
  //         $match: query,
  //       },
  //       {
  //         $sort: sortquery,
  //       },
  //     ];

  //     const total = await Plan.aggregate([...pipeline]);

  //     if (page && count) {
  //       var skipNo = (Number(page) - 1) * Number(count);

  //       pipeline.push(
  //         {
  //           $skip: Number(skipNo),
  //         },
  //         {
  //           $limit: Number(count),
  //         }
  //       );
  //     }

  //     const result = await Plan.aggregate([...pipeline]);

  //     // if (result && result.length > 0) {
  //     //   for await (const itm of result) {
  //     //     var features = [];
  //     //     if (itm.feature && itm.feature.length > 0) {
  //     //       for await (const feature of itm.feature) {
  //     //         let id = feature;
  //     //         const featureDetail = await db.features.findById(id);
  //     //         features.push(featureDetail);
  //     //       }
  //     //     }

  //     //     itm.features = features;
  //     //   }
  //     // }

  //     return res.status(200).json({
  //       success: true,
  //       data: result,
  //       total: total.length,
  //     });
  //   } catch (err) {
  //     return res.status(500).json({
  //       success: false,
  //       error: { code: 500, message: '' + err },
  //     });
  //   }
  // },

  // planDragDrop: async (req, res) => {
  //   try {
  //     const data = req.body.data;
  //     if (data && data.length > 0) {
  //       for await (const itm of data) {
  //         const updatedPlan = await db.plan.updateOne({ _id: itm.id }, itm);
  //       }

  //       return res.status(200).json({
  //         success: true,
  //         message: constants.plan.ORDER_UPDATED,
  //       });
  //     } else {
  //       return res.status(400).json({
  //         success: false,
  //         error: { code: 400, message: constants.onBoarding.PAYLOAD_MISSING },
  //       });
  //     }
  //   } catch (err) {
  //     return res.status(400).json({
  //       success: false,
  //       error: { code: 400, message: '' + err },
  //     });
  //   }
  // },
};
