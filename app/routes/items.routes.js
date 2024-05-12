// module.exports = (app) => {
    const item = require("../controllers/ItemController");

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
    router.post("/add", item.createItem);
    router.get("/view", item.itemDetail);
    router.get("/getall", item.getAllItems);
    router.put("/update", item.updateItem);
    router.delete("/delete", item.deleteItem);
    
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
    // router.get("/detail", plan.planDetail);
    module.exports = router;
