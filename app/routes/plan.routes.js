// module.exports = (app) => {
const plan = require("../controllers/planController");

var router = require("express").Router();

/**
 *Create plan
 *
 * Used to create plan. If everything is okay, you'll get a 200 OK response.
 *
 * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
 *
 * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
 * @responseField Success : true
 * @responseField message: "plan created successfully."
 */
router.post("/add", plan.createPlan);

/**
 * plan Detail
 *
 * Used to get detail of plan using id. If everything is okay, you'll get a 200 OK response.
 *
 * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
 *
 * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
 * @responseField Success: true
 * @responseField data:detail of the plan
 */
router.get("/detail", plan.planDetail);

/**
 *Update plan
 *
 * Used to update plan. If everything is okay, you'll get a 200 OK response.
 *
 * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
 *
 * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
 * @responseField Success : true
 * @responseField message: "plan updated successfully."
 */
router.put("/update", plan.updatePlan);

/**
 * plan Listing
 *
 * Used to get  plan. If everything is okay, you'll get a 200 OK response.
 *
 * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
 *
 * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
 * @responseField Success : true
 * @responseField data: [{name:"dummy plan",price:'200' ,isDeleted:false,status:"active"}]
 */
router.get("/listing", plan.getAllPlans);

/**
 * Frontend Plan Listing
 *
 * Used to get  plan. If everything is okay, you'll get a 200 OK response.
 *
 * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
 *
 * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
 * @responseField Success : true
 * @responseField data: [{name:"dummy plan",price:'200' ,isDeleted:false,status:"active"}]
 */
// router.get('/frontend/plan/listing', plan.frontendPlanListing);

/**
 *Product FAQ AND BLOG plan Listing
 *
 * Used to get Product FAQ AND BLOG  plan. If everything is okay, you'll get a 200 OK response.
 *
 * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
 *
 * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
 * @responseField Success : true
 * @responseField data: [{name:"dummy reseller plan",catType:"Reseller",image:"",isDeleted:false,status:"active"}]
 */
// router.get('/plan/listing', plan.getAllplan);

/**
 *Activate/Deactivate plan
 *
 * Used to activate and deactivate a plan. If everything is okay, you'll get a 200 OK response.
 *
 * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
 *
 * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
 * @responseField Success : true
 * @responseField message:"Status changed successfully."
 */
router.put("/status/change", plan.changeStatus);

/**
 *Delete plan
 *
 * Used to delete a plan using id in query param. If everything is okay, you'll get a 200 OK response.
 *
 * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
 *
 * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
 * @responseField Success : true
 * @responseField message:"plan deleted successfully."
 */
router.delete("/delete", plan.deletePlan);

/**
     *Export plan
     *
     * Used to export Product FAQ AND BLOG  plan using filters. If everything is okay, you'll get a 200 OK response.
     *
     * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
     *
     * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
     * @responseField Success : true
  
     */
router.get("/export", plan.exportPlanData);

// router.get('/plan/dropdown', plan.getMainAndChildplan);

//   app.use('/api', router);
// };

module.exports = router;
