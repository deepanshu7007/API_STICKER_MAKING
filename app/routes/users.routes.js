const user = require("../controllers/users.controller");

var router = require("express").Router();
//console.log(user, "=======");
/**
 * User Signup
 *
 * Used to register in the application. If everything is okay, you'll get a 200 OK response.
 *
 * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
 *
 * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
 * @responseField success: true
 * @responseField message: "Please check your email and verify your account."
 */

router.post("/register", user.registerUser);
//router.post("/register", user.registerUser);

//router.post('/register', user.registerUser);

router.post("/admin/login", user.adminLogin);

/**
 * User Login
 *
 * Used to login in the application. If everything is okay, you'll get a 200 OK response.
 *
 * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
 *
 * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
 * @responseField success: true
 * @responseField message: "User Loging successfully."
 */
router.post("/login", user.userLogin);

/**
 * Auto Login
 *
 * Used to login in the application. If everything is okay, you'll get a 200 OK response.
 *
 * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
 *
 * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
 * @responseField success: true
 * @responseField message: "User Loging successfully."
 */
router.post("/auto/login", user.autoLogin);
/**
 * User Detail
 *
 * Used to get detail of user using id. If everything is okay, you'll get a 200 OK response.
 *
 * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
 *
 * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
 * @responseField success: true
 * @responseField data:  {"fullName":"devmerff","email":"devmarff@xyz.com","address":"","image":"","status":"active"}
 */

 router.get("/user/profile", user.profileData);

/**
 *Update Profile
 *
 * Used to update user profile data. If everything is okay, you'll get a 200 OK response.
 *
 * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
 *
 * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
 * @responseField Success : true
 * @responseField message: "User updated successfully."
 */
router.put("/profile", user.updateProfile);

/**
 *Users's Listing
 *
 * If everything is okay, you'll get a 200 OK response.
 *
 * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
 *
 * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
 * @responseField Success : true
 *
 */
router.get("/listing", user.getAllUsers);
// router.get("/admin/users", user.getAdminUsers);

router.get("/verify", user.verifyUser);

/**
 * Change Password
 *
 * Used to change the password using current password. If everything is okay, you'll get a 200 OK response.
 *
 * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
 *
 * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
 * @responseField success: true
 * @responseField message: "Password changed successfully."
 */
router.put("/change/password", user.changePassword);

/**
 * Forgot Password
 *
 * Used to send verification code on email in case if user forgot password and try to reset the password. If everything is okay, you'll get a 200 OK response.
 *
 * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
 *
 * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
 * @responseField success: true
 * @responseField message: "Please check your email for verification code."
 */
router.post("/admin/forgot/password", user.forgotPasswordAdmin);

/**
 * Forgot Password User
 *
 * Used to send verification code on email in case if user forgot password and try to reset the password. If everything is okay, you'll get a 200 OK response.
 *
 * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
 *
 * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
 * @responseField success: true
 * @responseField message: "Please check your email for verification code."
 */
router.post("/forgot/password", user.forgotPasswordUser);

/**
 * Reset Password
 *
 * Reset the account password using verification code recived on email. If everything is okay, you'll get a 200 OK response.
 *
 * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
 *
 * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
 * @responseField success: true
 * @responseField message: "Password reset successfully."
 */
router.put("/reset/password", user.resetPassword);

/**
 * Creating Users
 *
 * Used to add user in the application from admin pannel. If everything is okay, you'll get a 200 OK response.
 *
 * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
 *
 * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
 * @responseField success: true
 * @responseField message: "User added successfully."
 */
router.post("/add", user.addUser);

/**
 *Activate/Deactivate User
 *
 * Used to activate and deactivate a user. If everything is okay, you'll get a 200 OK response.
 *
 * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
 *
 * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
 * @responseField Success : true
 * @responseField message:"Status changed successfully."
 */
router.put("/status/change", user.changeStatus);

/**
 *Delete User
 *
 * Used to delete a user using id in query param. If everything is okay, you'll get a 200 OK response.
 *
 * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
 *
 * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
 * @responseField Success : true
 * @responseField message:"User deleted successfully."
 */
router.delete("/delete", user.deleteUser);

/**
   *Export Users Data
   *
   * Used to export All users Data in Excel sheet. If everything is okay, you'll get a 200 OK response.
   *
   * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
   *
   * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
   * @responseField Success : true

   */
router.get("/export/user", user.exportUserData);

/**
   *Check availablity of email
   *
   * If everything is okay, you'll get a 200 OK response.
   *
   * Otherwise, the request will fail with a 400 error, and a response listing the failed services.
   *
   * @response 400 scenario="Service is unhealthy" {success:false,error:{code:400,message:"Server is down currently . Please try after some time."}}
   * @responseField Success : true

   */
router.get("/check/email", user.checkEmail);

/**
 * Resend verification email to user 
 * after registration/log in
 */

router.get("/resend/verification/email",user.resendVerifcationEmail)

router.post("/invite",user.inviteUser)

/**
 * social login api 
 * google log in 
 */

router.post("/google/signup/login",user.logInSignUpSocialMedia)

// app.use('/api', router);

module.exports = router;
