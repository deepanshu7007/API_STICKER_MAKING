// module.exports = (app) => {
  const subscriptions = require('../controllers/SubscriptionController');

  var router = require('express').Router();

  /**
   *Purchase Plan
   *
   * Used to purchase plan. If everything is okay, you'll get a 200 OK response.
   *
   * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
   *
   * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
   * @responseField Success : true
   * @responseField message: "Plan purchased successfully."
   */
  router.post('/purchase/plan', subscriptions.purchaseSubscription);

  /**
   * Active Plan
   *
   * Used to get detail of subscriptions  If everything is okay, you'll get a 200 OK response.
   *
   * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
   *
   * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
   * @responseField Success: true
   * @responseField data:detail of the subscriptions
   */
  router.get('/my/plan', subscriptions.getMyPlan);


  // router.post('/webhook',subscriptions.webhook)

  /**
   * Purchased Plans
   *
   * Used to get list of subscriptions  If everything is okay, you'll get a 200 OK response.
   *
   * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
   *
   * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
   * @responseField Success: true
   * @responseField data:list of the subscriptions
   */
  router.get('/listing', subscriptions.getPurchasedPlans);

  /**
   *Cancel subscriptions
   *
   * Used to cancel a subscriptions. If everything is okay, you'll get a 200 OK response.
   *
   * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
   *
   * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
   * @responseField Success : true
   * @responseField message:"Subscriptions cancelled successfully."
   */
  router.delete('/cancel', subscriptions.cancelSubscription);


  /**
   *Stripe webhook
   *
   * Used to update a subscriptions. If everything is okay, you'll get a 200 OK response.
   *
   * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
   *
   * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
   * @responseField Success : true
   * @responseField message:"Webhook recived successfully."
   */
  router.post('/webhook', subscriptions.webhook)



  router.get('/user/transactions' , subscriptions.userTransactions)


  // router.put('/extend-trial', subscriptions.extendTrialPeriod)

  // router.get ('/invoices/list', subscriptions.getInvoices)

  // router.get('/invoice/detail', subscriptions.invoiceDetail)


//   app.use('/api', router);
// };

module.exports = router
