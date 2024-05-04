const db = require('../models');
const Subscriptions = db.subscriptions;
const constants = require('../utls/constants');
const excel = require('exceljs');
var mongoose = require('mongoose');
const stripe = require('stripe')(process.env.SECREATKEY);
const Emails = require('../Emails/subscription');
const moment = require('moment');

module.exports = {
  /**
   * Purchsae subscription
   */

  purchaseSubscription: async (req, res) => {
    try {
      const data = req.body;
      if (
        !req.body.planId ||
        !req.body.planType ||
        !req.body.planInterval ||
        !req.body.stripe_price_id
      ) {
        return res.status(400).json({
          success: false,
          error: { code: 400, message: constants.onBoarding.PAYLOAD_MISSING },
        });
      }
      let {subscription_currency} = req.body;
      let userId = req.body.userId
      if(!req.body.userId){
        userId = req.identity._id
      }
      const plan = await db.plan.findById(req.body.planId)

      let get_user = await db.users.findById(userId);
      if (!get_user.trial_ended && plan.trial_period_days > 0 && !get_user.free_plan_purchase) {      // If user first time purchasing a plan then giving free trial
        let validUpTo = new Date(moment().add(plan.trial_period_days, "days"));
        data.userId = get_user.id;
        data.validUpTo = validUpTo
        data.createdAt = new Date();
        data.updatedAt = new Date();
        data.stripe_price_id = data.stripe_price_id
        data.on_trial = true;
        data.amount = 0
        data.type = "new"
        const createdSubscription = await db.subscriptions.create(data);
        await Emails.subscriptionEmailToAdmin({ email: get_user.email, firstName: get_user.fullName, planName: plan.name })

        await Emails.subscriptionEmailToUser({ email: get_user.email, firstName: get_user.fullName, planName: plan.name })
        let invoiceData = {}
        invoiceData.userId = get_user.id;
        invoiceData.description = "Plan Purchase",
        invoiceData.planId = req.body.planId
        invoiceData.paidAmount = 0
        invoiceData.currency = req.body.subscription_currency
        invoiceData.invoiceNumber = `Invoice-` +await db.invoices.count({}) 
  
        await db.invoices.create(invoiceData)
        await db.users.updateOne(
          { _id: get_user.id },
          { stripe_price_id: data.stripe_price_id, on_trial: true, validUpTo: validUpTo, subscription_currency : subscription_currency, free_plan_purchase : true,planId:req.body.planId , subscriptionId:createdSubscription.id }
        );
        return res.status(200).json({
          success: true,
          message: constants.messages.PLAN_PURCHASED,
        });
      }

      if (get_user.stripe_subscriptionId && get_user.stripe_subscriptionId != '') {
        try {
          const deleted = await stripe.subscriptions.cancel(
            get_user.stripe_subscriptionId
          );
        } catch (err) {
          console.log(err);
        }
      }

      if(!get_user.customer_id){
        return res.status(400).json({
          success:false,
          error:{code:400,message:"No cards added for payment."}
        })
      }

      const subscription = await stripe.subscriptions.create({
        customer: get_user.customer_id,
        items: [
          {
            price: data.stripe_price_id,
          },
        ],
      });
      let dt = new Date();
      dt.setMonth(dt.getMonth() + Number(data.planInterval));
      data.subscription = subscription;
      data.userId = get_user.id;
      data.validUpTo = dt;
      data.createdAt = new Date();
      data.updatedAt = new Date();
      data.stripe_subscriptionId = subscription.id
      data.stripe_price_id = data.stripe_price_id
      data.type = "new"
      data.amount = subscription.plan.amount / 100

      const createdSubscription = await db.subscriptions.create(data);

      let userTransactionData = { addedBy: get_user.id, type: "Plan purchased", amount: subscription.plan.amount / 100, status: "successfull" }

      const createdTransaction = await db.usertransactions.create(userTransactionData)

      await Emails.subscriptionEmailToAdmin({ email: get_user.email, firstName: get_user.fullName, planName: plan.name })

      await Emails.subscriptionEmailToUser({ email: get_user.email, firstName: get_user.fullName, planName: plan.name })

      let invoiceData = {}
      invoiceData.userId = get_user.id;
      invoiceData.description = "Plan Purchase",
      invoiceData.planId = req.body.planId
      invoiceData.paidAmount = subscription.plan.amount / 100
      invoiceData.currency = req.body.subscription_currency
      invoiceData.invoiceNumber = `Invoice-` +await db.invoices.count({}) 

      await db.invoices.create(invoiceData)

      await db.users.updateOne(
        { _id: get_user.id },
        { stripe_subscriptionId: subscription.id, stripe_price_id: data.stripe_price_id, trial_ended: true, on_trial: false, subscription_currency : subscription_currency ,planId:req.body.planId,subscriptionId:createdSubscription.id,stripe_subscriptionId:subscription.id}
      );

      return res.status(200).json({
        success: true,
        message: constants.messages.PLAN_PURCHASED,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + err },
      });
    }
  },

  getPurchasedPlans: async (req, res) => {
    try {
      var search = req.query.search;
      var page = req.query.page;
      var sortBy = req.query.sortBy;
      var userId = req.query.userId;
      var count = req.query.count;

      var query = {};

      if (search) {
        query.$or = [
          {
            name: { $regex: search, $options: 'i' },
          },
        ];
      }

      var sortquery = {};
      if (sortBy) {
        var order = sortBy.split(' ');
        var field = order[0];
        var sortType = order[1];
      }

      sortquery[field ? field : 'createdAt'] = sortType
        ? sortType == 'desc'
          ? -1
          : 1
        : -1;

      if (userId) {
        query.userId = mongoose.Types.ObjectId(userId);
      }

      const pipeline = [
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userDetail',
          },
        },

        {
          $unwind: {
            path: '$userDetail',
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $lookup: {
            from: 'plans',
            localField: 'planId',
            foreignField: '_id',
            as: 'planDetail',
          },
        },

        {
          $unwind: {
            path: '$planDetail',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            id: '$_id',
            planType: '$planType',
            planInterval: '$planInterval',
            validUpTo: '$validUpTo',
            userDetail: '$userDetail',
            userId: '$userId',
            planDetail: '$planDetail',
            createdAt: '$createdAt',
            updatedAt: '$updatedAt',
            isDeleted: '$isDeleted',
            stripe_price_id: '$stripe_price_id',
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

      const total = await Subscriptions.aggregate([...pipeline]);

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

      const result = await Subscriptions.aggregate([...pipeline]);
      if (result && result.length > 0) {
        result[0].isActive = true;
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

  getMyPlan: async (req, res) => {
    try {
      let userId = req.query.id
      if (!userId) {
        userId = req.identity.id;
      } else {
        const userDetail = await db.users.findById(userId)
        req.identity = userDetail
      }


      const plans = await Subscriptions.find({ userId: userId })
        .sort({ createdAt: -1 })
        .populate('planId');

      if (plans && plans.length > 0) {
        var data = {};
        data = JSON.parse(JSON.stringify(plans[0]));
        data.isActive = false;
        if (req.identity.subscriptionId && req.identity.subscriptionId != '') {
          data.isActive = true;
        } else if (req.identity.on_trial) {
          data.isActive = true;
        } else {
          data.isActive = false;
          data.on_trial = false;
        }

        return res.json({
          success: true,
          data: data,
        });
      } else {
        return res.json({
          success: true,
          data: {},
        });
      }
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + err },
      });
    }
  },

  cancelSubscription: async (req, res) => {
    let id = req.query.userId

    if (id) {
      const userDetail = await db.users.findById(id)
      req.identity = userDetail
    }

    if (req.identity.stripe_subscriptionId && req.identity.stripe_subscriptionId != '') {
      try {
        const deleted = await stripe.subscriptions.cancel(
          req.identity.stripe_subscriptionId
        );
        console.log(deleted, '-------cancelOldSubscription');
      } catch (err) {
        console.log(err);
      }
      const updatedUser = await db.users.updateOne(
        { _id: req.identity.id },
        { subscriptionId: null, trial_ended: true, on_trial: false, extended_days : 0 ,stripe_subscriptionId:""}
      );
        const subscriptions = await db.subscriptions.find({subscriptionId:req.identity.subscriptionId}).sort({createdAt:-1}).limit(1)
        if(subscriptions && subscriptions.length > 0){
          let deactiveSubstion = await db.subscriptions.updateMany({_id:subscriptions[0].id},{status:"deactive"})
        }
      await Emails.cancelSubscriptionEmailToAdmin({ email: process.env.ADMIN_EMAIL, firstName: req.identity.fullName })
      return res.status(200).json({
        success: true,
        message: constants.messages.SUBSCRIPTION_CANCELED,
      });
    } else if (req.identity.on_trial) {

      console.log("---here")
      const updatedUser = await db.users.updateOne(
        { _id: req.identity.id },
        { subscriptionId: null, trial_ended: true, on_trial: false, extended_days : 0 }
      );

      await Emails.cancelSubscriptionEmailToAdmin({ email: process.env.ADMIN_EMAIL, firstName: req.identity.fullName })
      return res.status(200).json({
        success: true,
        message: constants.messages.SUBSCRIPTION_CANCELED,
      });
    } else {
      return res.status(400).json({
        success: true,
        message: constants.messages.NOT_SUBSCRIBED,
      });
    }
  },


  webhook: async (request, res) => {
    try {
      const event = request.body;
      // Handle the event
      switch (event.type) {
        case 'customer.subscription.created':
          var event_object = event.data.object;
          break;

        case 'customer.subscription.updated':
          var event_object = event.data.object;
          if (event_object.status == "active") {
            const existedSubscription = await db.subscriptions.find({ subscriptionId: event_object.id })

            if(existedSubscription && existedSubscription.length > 0){
              let oldSubscription =  existedSubscription[0]
              delete oldSubscription._id
              delete oldSubscription.id
              delete oldSubscription.createdAt
              delete oldSubscription.updatedAt
              oldSubscription.status = "active"
              oldSubscription.type = "recurring"
              oldSubscription.validUpTo = new Date(event_object.current_period_end * 1000)
            }
            // let update_subscription = await db.subscriptions.updateOne({ subscriptionId: event_object.id }, {
            //   validUpTo: new Date(event_object.current_period_end * 1000),
            //   updatedAt: new Date()
            // });

            if(existedSubscription && existedSubscription.length > 0){

            let invoiceData = {}
            invoiceData.userId = existedSubscription[0].userId;
            invoiceData.description = "Plan subscription charged.",
            invoiceData.planId = existedSubscription[0].planId
            invoiceData.paidAmount = existedSubscription[0].amount
            invoiceData.invoiceNumber = `Invoice-` +await db.invoices.count({}) 
            await db.invoices.create(invoiceData)
            }


            // const user = await db.users.findById(existedSubscription[0]._id)

          }
          break;

        case 'invoice.payment_succeeded':
          var event_object = event.data.object;

          break;

        case 'customer.subscription.trial_will_end':
          var event_object = event.data.object;
          if (event_object.id) {

          }
          break;

        case 'customer.subscription.deleted':
          var event_object = event.data.object;
          if (event_object.status == "canceled") {
          }
          break;

        case 'invoice.upcoming':
          var event_object = event.data.object;


          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      // Return a response to acknowledge receipt of the event
      return res.status(200).json({ received: true });

    } catch (error) {
      console.log(error, '=============error');
    }
  },


  userTransactions: async (req, res) => {
    try {
      var search = req.query.search;
      var page = req.query.page;
      var sortBy = req.query.sortBy;
      let status = req.query.status;
      let isDeleted = req.query.isDeleted

      var count = req.query.count;


      var query = {};

      if (search) {
        query.$or = [
          {
            userName: { $regex: search, $options: 'i' },
          },
        ];
      }

      if (isDeleted == 'true') {
        query.isDeleted = true
      } else if (isDeleted == 'false') {
        query.isDeleted = false
      } else {
        query.isDeleted = false;
      }


      var sortquery = {};
      if (sortBy) {
        var order = sortBy.split(' ');
        var field = order[0];
        var sortType = order[1];
      }

      query.addedBy = mongoose.Types.ObjectId(req.identity.id);


      sortquery[field ? field : 'createdAt'] = sortType
        ? sortType == 'desc'
          ? -1
          : 1
        : -1;
      if (status) {
        query.status = status;
      }

      const pipeline = [
        {
          $lookup: {
            from: 'users',
            localField: 'addedBy',
            foreignField: '_id',
            as: 'addedByDetail',
          },
        },

        {
          $unwind: {
            path: '$addedByDetail',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            id: '$_id',
            amount: '$amount',
            type: "$type",
            status: '$status',
            createdAt: '$createdAt',
            updatedAt: '$updatedAt',
            isDeleted: '$isDeleted',
            addedBy: '$addedBy',
            addedByDetail: '$addedByDetail',
            userName: "$addedByDetail.fullName"
          },
        },
        {
          $match: query,
        },
        {
          $sort: sortquery,
        },
      ];

      const total = await db.usertransactions.aggregate([...pipeline]);

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

      const result = await db.usertransactions.aggregate([...pipeline]);

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

  extendTrialPeriod: async (req, res) => {
    try {
      const { user_id, extend_days } = req.body;
      if (!user_id) {
        return res.status(400).json({
          success: false,
          error: { code: 400, message: constants.messages.USER_ID_REQUIRED },
        });
      }

      if (!extend_days || extend_days < 1) {
        return res.status(400).json({
          success: false,
          error: { code: 400, message: constants.messages.EXTENDED_DAYS_REQUIRED },
        });
      }

      let get_user = await db.users.findById(user_id).select('_id validUpTo trial_ended trial_ended extended_days');
      if (!get_user) {
        return res.status(400).json({
          success: false,
          error: { code: 400, message: constants.messages.INVALID_USER_ID },
        });
      }

      let validUpTo = new Date(moment(get_user.validUpTo).add(extend_days, "days"));
      let extended_days = get_user.extended_days + extend_days;
      let update_user = await db.users.findByIdAndUpdate(user_id,
        { on_trial: true, validUpTo: validUpTo, trial_ended: false, extended_days: extended_days }
      );

      let update_subscription = await db.subscriptions.findOneAndUpdate({ userId: user_id }, { validUpTo: validUpTo })
      return res.status(200).json({
        success: true,
        message: constants.messages.TRIAL_EXTENDED,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + err },
      });
    }
  },


  getInvoices: async (req, res)=>{
    try{
      try {
      

        let {search ,page, count ,sortBy ,status ,userId} = req.query  
  
        var query = {};
  
        if (search) {
          query.$or = [
            {
              userName: { $regex: search, $options: 'i' },
            },
          ];
        }  
  
  
        var sortquery = {};
        if (sortBy) {
          var order = sortBy.split(' ');
          var field = order[0];
          var sortType = order[1];
        }
        if(userId){
          query.userId = mongoose.Types.ObjectId(userId);
        }
      
  
  
        sortquery[field ? field : 'createdAt'] = sortType
          ? sortType == 'desc'
            ? -1
            : 1
          : -1;
        if (status) {
          query.status = status;
        }
  
        const pipeline = [
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'userIdDetail',
            },
          },
  
          {
            $unwind: {
              path: '$userIdDetail',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'plans',
              localField: 'planId',
              foreignField: '_id',
              as: 'planDetail',
            },
          },
  
          {
            $unwind: {
              path: '$planDetail',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'currencies',
              let: { isoCode: {$toUpper:'$currency'}, isDeleted: false },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$isoCode', '$$isoCode'] },
                        { $eq: ['$isDeleted', '$$isDeleted'] },
                      ],
                    },
                  },
                },
              ],
              as: 'currency_detail',
            },
          },
          {
            $unwind: {
              path: '$currency_detail',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              id: '$_id',
              invoiceNumber: '$invoiceNumber',
              description:"$description",
              paidAmount:"$paidAmount",
              currency:"$currency",
              userId: "$userId",
              planId:"$planId",
              currency_detail:"$currency_detail",
              planDetail:"$planDetail",
              status: '$status',
              createdAt: '$createdAt',
              updatedAt: '$updatedAt',
              isDeleted: '$isDeleted',
              addedBy: '$addedBy',
              userIdDetail: '$userIdDetail',
              userName: "$userIdDetail.fullName"
            },
          },
          {
            $match: query,
          },
          {
            $sort: sortquery,
          },
        ];
  
        const total = await db.invoices.aggregate([...pipeline]);
  
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
  
        const result = await db.invoices.aggregate([...pipeline]);
  
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
    }catch(err){
      return res.status(500).json({
        success:false,
        error:{code:500,message:""+err}
      })
    }
  },

  invoiceDetail: async (req, res)=>{
    try{
      const {id} = req.query

      const data = await db.invoices.findById(id).populate('userId').populate('planId')

      return res.status(200).json({
        success:true,
        data:data
      })
    }catch(err){
      return res.status(500).json({
        success:false,
        error:{code:500,message:""+err}
      })
    }
  }

};
