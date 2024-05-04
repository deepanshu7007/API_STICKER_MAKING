// module.exports = (app) => {
const feature = require("../controllers/FeaturesController");

var router = require("express").Router();

/**
 *Create Feature
 *
 * Used to create feature. If everything is okay, you'll get a 200 OK response.
 *
 * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
 *
 * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
 * @responseField Success : true
 * @responseField message: "Feature created successfully."
 */
router.post("/add", feature.createFeature);

/**
     * Feature Detail
     *
     * Used to get detail of feature using id. If everything is okay, you'll get a 200 OK response.
     *
     * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
     *
     * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
     * @responseField Success: true
  
     */
router.get("/detail", feature.featureDetail);

/**
 *Update Feature
 *
 * Used to update feature. If everything is okay, you'll get a 200 OK response.
 *
 * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
 *
 * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
 * @responseField Success : true
 * @responseField message: "Feature updated successfully."
 */
router.put("/update", feature.updateFeature);

/**
     *Feature Listing
     *
     *  If everything is okay, you'll get a 200 OK response.
     *
     * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
     *
     * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
     * @responseField Success : true
  
     */
router.get("/listing", feature.getAllFeatures);

/**
     *Grouped Feature Listing
     *
     *  If everything is okay, you'll get a 200 OK response.
     *
     * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
     *
     * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
     * @responseField Success : true
  
     */
//   router.get('/grouped/features', feature.planFeatureCategoryWise);

/**
 *Activate/Deactivate Feature
 *
 * Used to activate and deactivate a feature. If everything is okay, you'll get a 200 OK response.
 *
 * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
 *
 * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
 * @responseField Success : true
 * @responseField message:"Status changed successfully."
 */
router.put("/status/change", feature.changeStatus);

/**
 *Delete Feature
 *
 * Used to delete a feature using id in query param. If everything is okay, you'll get a 200 OK response.
 *
 * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
 *
 * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
 * @responseField Success : true
 * @responseField message:"Feature deleted successfully."
 */
router.delete("/delete", feature.deleteFeature);

/**
     *Export features
     *
     * Used to export Product FAQ AND BLOG  features using filters. If everything is okay, you'll get a 200 OK response.
     *
     * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
     *
     * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
     * @responseField Success : true
  
     */
//   router.get('/export/features', feature.exportFeaturesData);

/**
 * Feature  Drag & Drop
 *
 * Used to update feature. If everything is okay, you'll get a 200 OK response.
 *
 * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
 *
 * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
 * @responseField Success : true
 * @responseField message: "Feature order updated successfully."
 */
//   router.put('/feature/drag/drop', feature.featureDragDrop);

//   app.use('/api', router);
// };

module.exports = router;
