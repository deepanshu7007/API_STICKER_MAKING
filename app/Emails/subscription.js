const SmtpController = require('../controllers/SmtpController');
const subscriptionEmailToAdmin = (options) => {
    let email = options.email;
    let verificationCode = options.verificationCode;
    let firstName = options.firstName;
    userId = options.userId;
  
    if (!firstName) {
      firstName = email;
    }
    message = '';
  
    message += `
      <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Subscription Email</title>
  </head>
  <body>
      
  
          <div class="email_section" style=" height: 100%; 
            width: 100%;
          max-width: 900px;
          margin: 2rem auto;
          border: 1px solid #7561a2;
          border-radius: 20px;
          padding: 30px;">
          <div class="bg_image" style="position:relative;">
          <img src="${process.env.BACK_WEB_URL}/static/bg.png" style="width: 900px;height:100%;">
         
  
  
              <div class="about_mail" style="position: absolute;
              top: 135px;
              text-align: center;
              left: 50%;
              transform: translate(-49%, 11%);">
                  <h3 class="heading_mail" style="font-size: 51px;
                  color: #7561a2;margin:0px;"> Hello Admin</h3>
      
                  <p class="dashboard" style="margin-bottom: 0px;
                  margin-top: 12px;
                  font-size: 18px;">  We have  new subscription from ${options.firstName} having email ${options.email} for plan ${options.planName}.</p>
              </div>
      
              <div class="verify" style="position: absolute;
              bottom: 0;  left: 50%;
              transform: translate(-49%, 11%); text-align: center;">
 
      
                  <p class="email_noti" style="font-size: 19px;
                  color: #939393;
              "> Got Questions? Contact our Support Team </p>
              </div>
  
          </div>
  
         
  
          </div>
  
     
  </body>
  </html>`;
  
    SmtpController.sendEmail(process.env.ADMIN_EMAIL, 'Subscription Email', message);
  };


  const cancelSubscriptionEmailToAdmin = (options) => {
    let email = options.email;
    let verificationCode = options.verificationCode;
    let firstName = options.firstName;
    userId = options.userId;
  
    if (!firstName) {
      firstName = email;
    }
    message = '';
  
    message += `
      <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Subscription Email</title>
  </head>
  <body>
      
  
          <div class="email_section" style=" height: 100%; 
            width: 100%;
          max-width: 900px;
          margin: 2rem auto;
          border: 1px solid #7561a2;
          border-radius: 20px;
          padding: 30px;">
          <div class="bg_image" style="position:relative;">
          <img src="${process.env.BACK_WEB_URL}/static/bg.png" style="width: 900px;height:100%;">
         
  
  
              <div class="about_mail" style="position: absolute;
              top: 135px;
              text-align: center;
              left: 50%;
              transform: translate(-49%, 11%);">
                  <h3 class="heading_mail" style="font-size: 51px;
                  color: #7561a2;margin:0px;"> Hello Admin</h3>
      
                  <p class="dashboard" style="margin-bottom: 0px;
                  margin-top: 12px;
                  font-size: 18px;"> ${options.firstName} having email ${options.email} cancel his subscription.</p>
              </div>
      
              <div class="verify" style="position: absolute;
              bottom: 0;  left: 50%;
              transform: translate(-49%, 11%); text-align: center;">
 
      
                  <p class="email_noti" style="font-size: 19px;
                  color: #939393;
              "> Got Questions? Contact our Support Team </p>
              </div>
  
          </div>
  
         
  
          </div>
  
     
  </body>
  </html>`;
  
    SmtpController.sendEmail(process.env.ADMIN_EMAIL, 'Subscription Cancel', message);
  };


  const subscriptionEmailToUser = (options) => {
    let email = options.email;
    let verificationCode = options.verificationCode;
    let firstName = options.firstName;
    userId = options.userId;
  
    if (!firstName) {
      firstName = email;
    }
    message = '';
  
    message += `
      <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Subscription Email</title>
  </head>
  <body>
      
  
          <div class="email_section" style=" height: 100%; 
            width: 100%;
          max-width: 900px;
          margin: 2rem auto;
          border: 1px solid #7561a2;
          border-radius: 20px;
          padding: 30px;">
          <div class="bg_image" style="position:relative;">
          <img src="${process.env.BACK_WEB_URL}/static/bg.png" style="width: 900px;height:100%;">
         
  
  
              <div class="about_mail" style="position: absolute;
              top: 135px;
              text-align: center;
              left: 50%;
              transform: translate(-49%, 11%);">
                  <h3 class="heading_mail" style="font-size: 51px;
                  color: #7561a2;margin:0px;"> Hello ${options.firstName}</h3>
      
                  <p class="dashboard" style="margin-bottom: 0px;
                  margin-top: 12px;
                  font-size: 18px;">  Thanks for purchaing plan. Will add more on updated template.</p>
              </div>
      
              <div class="verify" style="position: absolute;
              bottom: 0;  left: 50%;
              transform: translate(-49%, 11%); text-align: center;">
 
      
                  <p class="email_noti" style="font-size: 19px;
                  color: #939393;
              "> Got Questions? Contact our Support Team </p>
              </div>
  
          </div>
  
         
  
          </div>
  
     
  </body>
  </html>`;
  
    SmtpController.sendEmail(email, 'Subscription Email', message);
  };


  module.exports = {
    subscriptionEmailToAdmin,
    subscriptionEmailToUser,
    cancelSubscriptionEmailToAdmin
  };