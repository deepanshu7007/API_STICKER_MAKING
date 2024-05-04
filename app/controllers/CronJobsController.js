const cron = require("node-cron");
const Emails = require('../Emails/onBoarding');
const db = require('../models');
const moment = require('moment');
const helpers = require('../utls/helper');
const services = require('../services/index');
const axios = require('axios');
const request = require('request');
const wavierServices = require("../services")

// cron.schedule("0 10 * * *", async () => {
//   try {
//     console.log("-----------Cron----------");
//     contractQuery = {}
//     contractQuery.status = "Pending"
//     const contracts = await db.contracts.find(contractQuery).populate('reseller')
//     //   console.log(contracts.length,"contracts")
//     if (contracts && contracts.length > 0) {
//       for await (let contract of contracts) {
//         var Difference_In_Time = new Date().getTime() - new Date(contract.createdAt).getTime();

//         // To calculate the no. of days between two dates
//         var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
//         if (Difference_In_Days > 5) {
//           let daysAfterFiveDays = (Difference_In_Days - 5) / 3
//           if (daysAfterFiveDays < 1) {
//             let email_payload = {
//               email: contract.reseller.contactEmail ? contract.reseller.contactEmail : contract.reseller.email,
//               id: contract.id,
//               fullName: contract.name,
//               contract:contract

//             };
//             await Emails.contractReminderEmail(email_payload);
//           }

//         }
//       }
//     }
//   } catch (err) {
//     console.log(err)
//   }

//   // Soft Delete rezdy products after 14 days or set in delete_product_at
//   try {
//     let start_date = new Date(new Date().setUTCHours(0, 0, 0, 0));
//     let end_date = new Date(new Date().setUTCHours(23, 59, 59));
//     let query = {
//       delete_product_at: { $gte: start_date, $lte: end_date },
//       isDeleted: false
//     }

//     let get_products = await db.retrivableproducts.find(query).lean().exec();
//     if (get_products && get_products.length > 0) {
//       for await (let item of get_products) {
//         let update_product = await db.products.findByIdAndUpdate(item.product_id, { isDeleted: true });
//         let delete_ret_product = await db.retrivableproducts.findByIdAndUpdate(item._id, { isDeleted: true });
//         if (update_product) {
//           await services.product.remove_product_from_redis(update_product._id, update_product.addedBy);
//         }
//       }
//     }
//   } catch (error) {
//     console.log(error, '========error');
//   }


//   // Destroy rezdy products after 60 days or set in destroy_product_at
//   try {
//     let start_date = new Date(new Date().setUTCHours(0, 0, 0, 0));
//     let end_date = new Date(new Date().setUTCHours(23, 59, 59));
//     let query = {
//       destroy_product_at: { $gte: start_date, $lte: end_date },
//       isDeleted: false
//     }
//     let get_products = await db.retrivableproducts.find(query).lean().exec();
//     if (get_products && get_products.length > 0) {
//       for await (let item of get_products) {
//         let update_product = await db.products.findByIdAndRemove(item.product_id);
//         let delete_ret_product = await db.retrivableproducts.findByIdAndRemove(item._id);
//         if (update_product) {
//           await services.product.remove_product_from_redis(update_product._id, update_product.addedBy);
//           await services.product.remove_retrievable_product_from_redis(delete_ret_product, delete_ret_product.addedBy)
//         }
//       }
//     }
//   } catch (error) {
//     console.log(error, '========error');

//   }



//   // Soft Delete rezdy orders after 14 days or set in delete_order_at
//   try {
//     let start_date = new Date(new Date().setUTCHours(0, 0, 0, 0));
//     let end_date = new Date(new Date().setUTCHours(23, 59, 59));
//     let query = {
//       delete_order_at: { $gte: start_date, $lte: end_date },
//       isDeleted: false
//     }

//     let get_orders = await db.retrivableOrders.find(query).lean().exec();
//     if (get_orders && get_orders.length > 0) {
//       for await (let item of get_orders) {
//         let update_order = await db.orders.findByIdAndUpdate(item.order_id, { isDeleted: true });
//         let delete_ret_order = await db.retrivableOrders.findByIdAndUpdate(item._id, { isDeleted: true });
//         if (update_order) {
//           await services.order.remove_order_from_redis(update_order._id, update_order.supplier);
//         }
//       }
//     }
//   } catch (error) {
//     console.log(error, '========error');
//   }


//   // Destroy rezdy orders after 60 days or set in destroy_order_at
//   try {
//     let start_date = new Date(new Date().setUTCHours(0, 0, 0, 0));
//     let end_date = new Date(new Date().setUTCHours(23, 59, 59));
//     let query = {
//       destroy_order_at: { $gte: start_date, $lte: end_date },
//       isDeleted: false
//     }
//     let get_orders = await db.retrivableOrders.find(query).lean().exec();
//     if (get_orders && get_orders.length > 0) {
//       for await (let item of get_orders) {
//         let update_order = await db.orders.findByIdAndRemove(item.order_id);
//         let delete_ret_order = await db.retrivableOrders.findByIdAndRemove(item._id);
//         if (update_order) {
//           await services.order.remove_order_from_redis(update_order._id, update_order.supplier);
//           await services.order.remove_retrievable_orders_from_redis(delete_ret_order._id, delete_ret_order.supplier);
//         }
//       }
//     }
//   } catch (error) {
//     console.log(error, '========error');
//   }

// })







