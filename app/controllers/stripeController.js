const db = require('../models');
const Cards = db.cards;
const constants = require('../utls/constants');
// const excel = require('exceljs');
var mongoose = require('mongoose');
// const stripe = require('stripe')(process.env.SECREATKEY);

module.exports = {
  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   * @description used to save the card on stripe
   * @createdBy Amit Kumar
   */

  addCard: async (req, res) => {
    let userId = req.body.userId
    if(userId){
      let user  = await db.users.findById(userId)
      req.identity = user
    }
    stripe.tokens.create(
      {
        card: {
          number: req.body.card_number,
          exp_month: req.body.exp_month,
          exp_year: req.body.exp_year,
          cvc: req.body.cvc,
          name: req.identity.fullName,
        },
      },
      async (err, token) => {
        if (err) {
          return res.status(404).json({
            success: false,
            error: { code: 404, message: err.message },
          });
        } else {
          /**If user is alreadyregistered on stripe  */
          if (
            req.identity.customer_id != undefined &&
            req.identity.customer_id != ''
          ) {
            var cardNumber = String(req.body.card_number);
            last4 = cardNumber.slice(cardNumber.length - 4);

            const cards = await Cards.find({
              userId: req.identity.id,
              last4: last4,
              isDeleted:false
            });
            /**User cant add same card multiple time */
            if (cards && cards.length > 0) {
              return res.status(400).json({
                success: false,
                error: {
                  code: 400,
                  message: constants.messages.CARD_EXIST,
                },
              });
            }

            stripe.customers.createSource(
              req.identity.customer_id,
              {
                source: token.id,
              },
              async (err, customer) => {
                if (err) {
                  return res.status(404).json({
                    success: false,
                    error: { code: 404, message: err.raw.message },
                  });
                }
                try {
                  /**Making last added card default on stripe */
                  // const updatedcustomer = await stripe.customers.update(
                  //   req.identity.customer_id,
                  //   {
                  //     default_source: customer.id,
                  //   }
                  // );
                } catch (err) {
                  return res.status(400).json({
                    success: false,
                    error: { code: 404, message: '' + err },
                  });
                }

                addedCard = {
                  userId: req.identity.id,
                  card_id: customer.id,
                  last4: customer.last4,
                  exp_month: customer.exp_month,
                  exp_year: customer.exp_year,
                  brand: customer.brand,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  // isDefault: true,
                };
                const existedUserCards = await Cards.find({
                  userId: req.identity.id,
                });
                if (existedUserCards && existedUserCards.length == 0) {
                  addedCard.isDefault = true;
                }
                /**adding added card into user and making it default */
                // updateExistingCards = await Cards.update({userId:req.identity.id},{isDefault:false})
                var createdCard = await Cards.create(addedCard);
                return res.status(200).json({
                  success: true,
                  message: constants.messages.CARD_ADDED,
                });
              }
            );
          } else {
            /**If user is not registered on stripe */
            stripe.customers.create(
              {
                description: req.identity.email,
                email: req.identity.email,
                name: req.identity.fullName,
                address: {
                  line1: req.identity.street
                    ? req.identity.street
                    : '52 N Main ST',
                  city: req.identity.city ? req.identity.city : 'Johnstown',
                  state: 'OH',
                  postal_code: req.body.zip_code ? req.body.zip_code : '43210',
                  country: req.body.country,
                },

                source: token.id, // obtained with Stripe.js
              },
              (err, customer) => {
                if (err) {
                  return res.status(404).json({
                    success: false,
                    error: { code: 404, message: err.raw.message },
                  });
                }

                var query = {
                  userId: req.identity.id,
                  card_id: customer.default_source,
                  last4: token.card.last4,
                  exp_month: token.card.exp_month,
                  exp_year: token.card.exp_year,
                  brand: token.card.brand,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  isDefault: true,
                };

                db.users
                  .updateOne(
                    { _id: req.identity.id },
                    {
                      customer_id: customer.id,
                    }
                  )
                  .then(async (data) => {
                    // updateExistingCards = await Cards.update({userId:req.identity.id},{isDefault:false})
                    var createdCard = await Cards.create(query);
                    return res.status(200).json({
                      success: true,
                      message: constants.messages.CARD_ADDED,
                    });
                  });
              }
            );
          }
        }
      }
    );
  },

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   * @description used to delete existing card
  
   * @createdBy Amit Kumar
   */
  deleteCard: async (req, res) => {
    let {userId, card_id} = req.query
    if(userId){
      let user  = await db.users.findById(userId)
      req.identity = user
    }
    var customer_id = req.identity.customer_id;

    if (!card_id || card_id == undefined) {
      return res.status(404).json({
        success: false,
        error: { code: 404, message: constants.onBoarding.PAYLOAD_MISSING },
      });
    }
    const id = req.identity.id;
    try {
      stripe.customers.deleteSource(
        customer_id,
        card_id,
        async (err, confirmation) => {
          if (err) {
            return res.status(400).json({
              success: false,
              code: 400,
              message: '' + err.raw.message,
            });
          } else {
            var card = await Cards.findOne({ userId: id, card_id: card_id });
            if (card.isDefault == true) {
              const cards = await Cards.find({ userId: id, isDefault: false });
              if (cards && cards.length > 0) {
                updatedCard = await Cards.update(
                  { _id: cards[0].id },
                  { isDefault: true }
                );
              }
            }
            const removedCard = await Cards.update(
              {
                userId: id,
                card_id: card_id,
              },
              { isDeleted: true }
            );

            return res.status(200).json({
              success: true,
              message: constants.messages.CARD_DELETED,
            });
          }
        }
      );
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: '' + err,
        },
      });
    }
  },

  getCards: async (req, res) => {
    let {userId} = req.query
    if(!userId){
      userId = req.identity.id
    }
  

    try {
      const cards = await Cards.find({ userId: userId, isDeleted: false }).sort({isDefault:-1})

      if (cards && cards.length > 0) {
        for await (const data of cards) {
          var date = new Date();
          var currentMonth = date.getUTCMonth() + 1;
          var currentYear = date.getUTCFullYear();
          if (Number(data.exp_year) < Number(currentYear)) {
            data.isExpired = true;
          } else if (
            Number(data.exp_month) < Number(currentMonth) &&
            Number(data.exp_year) <= Number(currentYear)
          ) {
            data.isExpired = true;
          } else {
            data.isExpired = false;
          }
        }
      }

      return res.status(200).json({
        success: true,
        data: cards,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + err },
      });
    }
  },

  setPrimaryCard: async (req, res) => {
    let userId = req.body.userId
    if(userId){
      let user  = await db.users.findById(userId)
      req.identity = user
    }
    
    const customer_id = req.identity.customer_id;
    const card_id = req.body.card_id;
    if (!card_id || card_id == undefined) {
      return res.status(404).json({
        success: false,
        error: { code: 404, message: constants.messages.PAYLOAD_MISSING },
      });
    }

    try {
      const updatedcustomer = await stripe.customers.update(customer_id, {
        default_source: card_id,
      });
      markingOthersDefaultFalse = await Cards.update(
        { userId: req.identity.id },
        { isDefault: false }
      );
      const defaultCard = await Cards.update(
        { userId: req.identity.id, card_id: card_id },
        { isDefault: true }
      );
      return res.status(200).json({
        success: true,
        code: 200,
        message: constants.messages.DEFAULT_CARD,
      });
    } catch (err) {
      return res
        .status(400)
        .json({ success: false, error: { code: 404, message: '' + err } });
    }
  },
};
