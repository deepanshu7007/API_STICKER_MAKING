// module.exports = (app) => {
const user = require("../controllers/AuthController");

var router = require("express").Router();

/**
 * Authentication
 *
 * Used to get authentication token. If everything is okay, you'll get a 200 OK response.
 *
 * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
 *
 * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
 * @responseField success: true
 * @responseField accesstoken:  "fhsdajkflksdjf33r34u.jgkdhkhgdhlgkdlsu834y3rhdrwe9u3r.4u3oufjoeijwjfi43uanvklnkng"
 */
router.post("/user/authentication", user.getAccessToken);

//   app.use('/api', router);
// };

module.exports = router;
