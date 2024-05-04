// module.exports = (app) => {
  const cards = require('../controllers/stripeController');

  var router = require('express').Router();

  /**
   *Add Card
   *
   * Used to add card. If everything is okay, you'll get a 200 OK response.
   *
   * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
   *
   * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
   * @responseField Success : true
   * @responseField message: "Card added successfully."
   */
  router.post('/add', cards.addCard);

  /**
   * Cards's Listing
   *
   * Used to get  Cardss. If everything is okay, you'll get a 200 OK response.
   *
   * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
   *
   * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
   * @responseField Success : true
   */
  router.get('/listing', cards.getCards);

  /**
   *Primary Card
   *
   * Used to set primary card for payments. If everything is okay, you'll get a 200 OK response.
   *
   * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
   *
   * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
   * @responseField Success : true
   * @responseField message:"Primary card set successfully."
   */
  router.put('/primary', cards.setPrimaryCard);

  /**
   *Delete Card
   *
   * Used to delete a card in using card_id in params . If everything is okay, you'll get a 200 OK response.
   *
   * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
   *
   * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
   * @responseField Success : true
   * @responseField message:"Card deleted successfully."
   */
  router.delete('/delete', cards.deleteCard);

//   app.use('/api', router);
// };


module.exports = router