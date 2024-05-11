const SmtpController = require("../controllers/SmtpController");
const dotenv = require("dotenv");
dotenv.config();

const { STAGING_FRONTEND_URL,STAGING_ADMIN_URL,BACK_WEB_URL, FRONT_WEB_URL, ADMIN_WEB_URL } = process.env;

const forgotPasswordEmail = (options) => {
  let email = options.email;
  let verificationCode = options.verificationCode;
  let fullName = options.firstName;
  //   console.log(fullName)
  userId = options.userId;

  //   console.log(dotenv,"========================");

  if (!fullName) {
    fullName = email;
  }
  message = "";

  message += `
  <!DOCTYPE html>
  <html>
  
  <head>
      <title> Forgot Password</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link
          href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet">
  
      <style>
          @media (max-width:767px) {
              .w-100 {
                  width: 100%;
              }
  
              .fz-20 {
                  font-size: 25px !important;
              }
          }
      </style>
  
  </head>
  
  <body style="font-family: 'Poppins', sans-serif; background:#fff;">
      <table width="100%" cellpadding:"0" cellspacing="0">
          <tbody>
              <tr>
                  <td style="padding: 50px 20px;">
                      <table width="676px" cellpadding:"0" cellspacing="0" style="margin: 0 auto; background:#F2F5FF
                      ;"
                          class="w-100">
                          <tr>
                              <td style="height:40px;">
  
                              </td>
                          </tr>
                     
                          <tr>
                              <td style="text-align:center; padding-bottom: 10px; height: 50px;">
                                  <img src="${BACK_WEB_URL}/static/Talentx_logo.png"
                                  style="width: 120px; margin: 0 auto;" />
                              </td>
                          </tr>
                          <tr>
                              <td style="padding: 20px 60px;">
                                  <table width="100%;cellpadding:"0" cellspacing="0" ">
                                      <tr>
                                          <td style="border-bottom: 1px solid 
                              #E2E8F0; ">
  
                              </td>
                                      </tr>
                                  </table>
                              </td>
                          </tr>
                          <tr>
                              <td style="text-align:center; padding-bottom: 10px; ">
                                  <img src="${BACK_WEB_URL}/static/banner.png"
                                  style="width: 340px; margin: 0 auto;" />
                              </td>
                          </tr>
                          <tr>
                              <td style="padding: 20px 60px;">
                                  <table width="100%;cellpadding:"0" cellspacing="0" ">
                                      <tr>
                                          <td style="border-bottom: 1px solid 
                              #E2E8F0; ">
  
                              </td>
                                      </tr>
                                  </table>
                              </td>
                          </tr>
                          <tr>
                              <td style="text-align:center;">
                                  <p style="font-size:22px; max-width: 400px; margin:0 auto; font-weight: 600; padding: 0 20px; color: #384860; line-height: 24px;"
                                      class="fz-20">Hi ${fullName},
                                  </p>
                              </td>
                          </tr>
                          <tr>
                              <td style="padding: 15px 0 25px 0;">
                                  <p
                                      style="font-size:16px; max-width: 400px; margin:0 auto; text-align: center; color: #6D6D6D; line-height: 25px; padding: 0 20px;">
                                      We have received your request to reset your password.
                                  </p>
                              </td>
                          </tr>
                          

                          <tr>`;
  if (options.role == "company" || options.role == "individual") {
    // console.log('in company');
    message += `<a href="${FRONT_WEB_URL}/reset?id=${userId}&code=${verificationCode}" taget="_blank" style="background: #0B2B94
                                         ; display:block;color:#fff;padding:12px 10px; width: 220px; margin: 0 auto 0; box-shadow: none; border: 0; font-size: 15px; text-decoration: none; font-weight: 400; text-align: center;" > Reset Password</a>`;
  } else {
    message += `<a href="${ADMIN_WEB_URL}/reset?id=${userId}&code=${verificationCode}" taget="_blank" style="background: #0B2B94
                                         ; display:block;color:#fff;padding:12px 10px; width: 220px; margin: 0 auto 0; box-shadow: none; border: 0; font-size: 15px; text-decoration: none; font-weight: 400; text-align: center; " > Reset Password</a>`;
  }
  message += `</tr>
  
  
  
                          <tr>
                              <td style="height:60px;">
  
                              </td>
                          </tr>
                         
                       
              
                     
                      </table>
                  </td>
              </tr>
          </tbody>
      </table>
  </body>
  
  </html>`;

  SmtpController.sendEmail(email, "Reset Password", message);
};

const add_user_email = (options) => {
  let email = options.email;

  let fullName = options.fullName;
  //   console.log("hello")
  //   console.log(fullName)
  let password = options.password;
  //   console.log(`${BACK_WEB_URL}/assets/static/Talentx_logo.png`);

  if (!fullName) {
    fullName = email;
  }
  message = "";
  message += `
  <!DOCTYPE html>
  <html>
  
  <head>
      <title> TalentX</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link
          href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet">
  
      <style>
          @media (max-width:767px) {
              .w-100 {
                  width: 100%;
              }
  
              .fz-20 {
                  font-size: 25px !important;
              }
          }
      </style>
  
  </head>
  
  <body style="font-family: 'Poppins', sans-serif; background:#fff;">
      <table width="100%" cellpadding:"0" cellspacing="0">
          <tbody>
              <tr>
                  <td style="padding: 50px 20px;">
                      <table width="676px" cellpadding:"0" cellspacing="0" style="margin: 0 auto; background:#F2F5FF
                      ;"
                          class="w-100">
                          <tr>
                              <td style="height:40px;">
  
                              </td>
                          </tr>
                     
                          <tr>
                              <td style="text-align:center; padding-bottom: 10px; height: 50px;">
                                  <img src="${BACK_WEB_URL}/static/Talentx_logo.png"
                                  style="width: 120px; margin: 0 auto;" />
                              </td>
                          </tr>
                          <tr>
                              <td style="padding: 20px 60px;">
                                  <table width="100%;cellpadding:"0" cellspacing="0" ">
                                      <tr>
                                          <td style="border-bottom: 1px solid 
                              #E2E8F0; ">
  
                              </td>
                                      </tr>
                                  </table>
                              </td>
                          </tr>
                          <tr>
                              <td style="text-align:center; padding-bottom: 10px; ">
                                  <img src="${BACK_WEB_URL}/static/banner.png"
                                  style="width: 340px; margin: 0 auto;" />
                              </td>
                          </tr>
                          <tr>
                              <td style="padding: 20px 60px;">
                                  <table width="100%;cellpadding:"0" cellspacing="0" ">
                                      <tr>
                                          <td style="border-bottom: 1px solid 
                              #E2E8F0; ">
  
                              </td>
                                      </tr>
                                  </table>
                              </td>
                          </tr>
                          <tr>
                              <td style="text-align:center;">
                                  <p style="font-size:22px; max-width: 400px; margin:0 auto; font-weight: 600; padding: 0 20px; color: #384860; line-height: 24px;"
                                      class="fz-20">Hi ${options.fullName},
                                  </p>
                              </td>
                          </tr>
                          <tr>
                              <td style="padding: 15px 0 25px 0;">
                                  <p
                                      style="font-size:16px; max-width: 400px; margin:0 auto; text-align: center; color: #6D6D6D; line-height: 25px; padding: 0 20px;">
                                       <span style="font-weight: 600;"> Email </span>
                                       ${email}
                                  </p>
                                  <p
                                      style="font-size:16px; max-width: 400px; margin:0 auto; text-align: center; color: #6D6D6D; line-height: 25px; padding: 0 20px;">
                                       <span style="font-weight: 600;"> Password </span>
                                       ${password}.
                                  </p>
                                  <p>
                                    

                                  </p>
                              </td>
                          </tr>
                          <tr>
                              <td>
                                  <a href="${STAGING_ADMIN_URL}/sign-in"
                                      style="background: #3F559E
                              ; display:block;color:#fff;padding:12px 10px; width: 220px; margin: 0 auto 0; box-shadow: none; border: 0; font-size: 15px; text-decoration: none; font-weight: 400; text-align: center;">Click here to log in</a>
                              
                              </td>
                          </tr>
  
  
  
                          <tr>
                              <td style="height:60px;">
                              <p> You are going to Love it here.</p>
                              </td>
                          </tr>
                         
                       
              
                     
                      </table>
                  </td>
              </tr>
          </tbody>
      </table>
  </body>
  
  </html>`;

  SmtpController.sendEmail(email, "Registration", message);
};

const invite_user_email = (options) => {
  let email = options.email;

  let fullName = options.fullName;
  let password = options.password;

  if (!fullName) {
    firstName = email;
  }
  message = "";
  message += `
  <!DOCTYPE html>
  <html>
  
  <head>
      <title> TalentX</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link
          href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet">
  
      <style>
          @media (max-width:767px) {
              .w-100 {
                  width: 100%;
              }
  
              .fz-20 {
                  font-size: 25px !important;
              }
          }
      </style>
  
  </head>
  
  <body style="font-family: 'Poppins', sans-serif; background:#fff;">
      <table width="100%" cellpadding:"0" cellspacing="0">
          <tbody>
              <tr>
                  <td style="padding: 50px 20px;">
                      <table width="676px" cellpadding:"0" cellspacing="0" style="margin: 0 auto; background:#F2F5FF
                      ;"
                          class="w-100">
                          <tr>
                              <td style="height:40px;">
  
                              </td>
                          </tr>
                     
                          <tr>
                              <td style="text-align:center; padding-bottom: 10px; height: 50px;">
                                  <img src="${BACK_WEB_URL}/static/Talentx_logo.png"
                                  style="width: 120px; margin: 0 auto;" />
                              </td>
                          </tr>
                          <tr>
                              <td style="padding: 20px 60px;">
                                  <table width="100%;cellpadding:"0" cellspacing="0" ">
                                      <tr>
                                          <td style="border-bottom: 1px solid 
                              #E2E8F0; ">
  
                              </td>
                                      </tr>
                                  </table>
                              </td>
                          </tr>
                          <tr>
                              <td style="text-align:center; padding-bottom: 10px; ">
                                  <img src="${BACK_WEB_URL}/static/banner.png"
                                  style="width: 340px; margin: 0 auto;" />
                              </td>
                          </tr>
                          <tr>
                              <td style="padding: 20px 60px;">
                                  <table width="100%;cellpadding:"0" cellspacing="0" ">
                                      <tr>
                                          <td style="border-bottom: 1px solid
                              #E2E8F0; ">
  
                              </td>
                                      </tr>
                                  </table>
                              </td>
                          </tr>
                          <tr>
                              <td style="text-align:center;">
                                  <p style="font-size:22px; max-width: 400px; margin:0 auto; font-weight: 600; padding: 0 20px; color: #384860; line-height: 24px;"
                                      class="fz-20">Hi ${options.fullName},
                                  </p>
                              </td>
                          </tr>
                          <tr>
                              <td style="padding: 15px 0 25px 0;">
                                  <p
                                      style="font-size:16px; max-width: 400px; margin:0 auto; text-align: center; color: #6D6D6D; line-height: 25px; padding: 0 20px;">
                                       <span style="font-weight: 600;"> Email </span>
                                       ${email}
                                  </p>
                                  <p
                                      style="font-size:16px; max-width: 400px; margin:0 auto; text-align: center; color: #6D6D6D; line-height: 25px; padding: 0 20px;">
                                       <span style="font-weight: 600;"> Password </span>
                                       ${password}.
                                  </p>
                                  <p>
                                    

                                  </p>
                              </td>
                          </tr>

                          <tr>
                              <td>`
                              if(options.role == 'company'){
                                message += `    <a href="${STAGING_FRONTEND_URL}/organization?id=${options.id}""
                                style="background: #3F559E
                        ; display:block;color:#fff;padding:12px 10px; width: 220px; margin: 0 auto 0; box-shadow: none; border: 0; font-size: 15px; text-decoration: none; font-weight: 400; text-align: center;">Click here to log in</a>`
                              }else{
                                message += `    <a href="${STAGING_FRONTEND_URL}/sign-in""
                                style="background: #3F559E
                        ; display:block;color:#fff;padding:12px 10px; width: 220px; margin: 0 auto 0; box-shadow: none; border: 0; font-size: 15px; text-decoration: none; font-weight: 400; text-align: center;">Click here to log in</a>`
                              }
                              
                              message +=`</td>
                              
                          </tr>
  
  
  
                          <tr>
                              <td style="height:60px;">
                                <p> You are going to Love it here.</p>
                              </td>
                          </tr>
                         
                       
              
                     
                      </table>
                  </td>
              </tr>
          </tbody>
      </table>
  </body>
  
  </html>`;

  SmtpController.sendEmail(email, "Invitation", message);
};

const userVerifyLink = async (options) => {
  let email = options.email;
  message = "";

  message += `
  <!DOCTYPE html>
  <html>
  
  <head>
      <title> TalentX</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link
          href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet">
  
      <style>
          @media (max-width:767px) {
              .w-100 {
                  width: 100%;
              }
  
              .fz-20 {
                  font-size: 25px !important;
              }
          }
      </style>
  
  </head>
  
  <body style="font-family: 'Poppins', sans-serif; background:#fff;">
      <table width="100%" cellpadding:"0" cellspacing="0">
          <tbody>
              <tr>
                  <td style="padding: 50px 20px;">
                      <table width="676px" cellpadding:"0" cellspacing="0" style="margin: 0 auto; background:#F2F5FF
                      ;"
                          class="w-100">
                          <tr>
                              <td style="height:40px;">
  
                              </td>
                          </tr>
                     
                          <tr>
                              <td style="text-align:center; padding-bottom: 10px; height: 50px;">
                                  <img src="${BACK_WEB_URL}/static/Talentx_logo.png"
                                  style="width: 120px; margin: 0 auto;" />
                              </td>
                          </tr>
                          <tr>
                              <td style="padding: 20px 60px;">
                                  <table width="100%;cellpadding:"0" cellspacing="0" ">
                                      <tr>
                                          <td style="border-bottom: 1px solid 
                              #E2E8F0; ">
  
                              </td>
                                      </tr>
                                  </table>
                              </td>
                          </tr>
                          <tr>
                              <td style="text-align:center; padding-bottom: 10px; ">
                                  <img src="${BACK_WEB_URL}/static/banner.png"
                                  style="width: 340px; margin: 0 auto;" />
                              </td>
                          </tr>
                          <tr>
                              <td style="padding: 20px 60px;">
                                  <table width="100%;cellpadding:"0" cellspacing="0" ">
                                      <tr>
                                          <td style="border-bottom: 1px solid 
                              #E2E8F0; ">
  
                              </td>
                                      </tr>
                                  </table>
                              </td>
                          </tr>
                          <tr>
                              <td style="text-align:center;">
                                  <p style="font-size:22px; max-width: 400px; margin:0 auto; font-weight: 600; padding: 0 20px; color: #384860; line-height: 24px;"
                                      class="fz-20">Hi ${options.fullName},
                                  </p>
                              </td>
                          </tr>
                          <tr>
                              <td style="padding: 15px 0 25px 0;">
                                  <p
                                      style="font-size:16px; max-width: 400px; margin:0 auto; text-align: center; color: #6D6D6D; line-height: 25px; padding: 0 20px;">
                                      Thank you for joining <span style="font-weight: 600;"> Psyclick </span> You are Going to love it here 
                                  </p>
                              </td>
                          </tr>
                          <tr>
                              <td>`

                              
                                message += `<a href="${STAGING_FRONTEND_URL}/organization?id=${options.id}&role=${options.role}"
                                style="background: #3F559E
                        ; display:block;color:#fff;padding:12px 10px; width: 220px; margin: 0 auto 0; box-shadow: none; border: 0; font-size: 15px; text-decoration: none; font-weight: 400; text-align: center;">Verify your email address</a>
                       `
                              
                             message +=`</td>
                          </tr>
  
  
  
                          <tr>
                              <td style="height:60px;">
  
                              </td>
                          </tr>
                         
                       
              
                     
                      </table>
                  </td>
              </tr>
          </tbody>
      </table>
  </body>
  
  </html>`;
  await SmtpController.sendEmail(email, "Email Verification", message);
};

const updatePasswordEmail = (options) => {
  let email = options.email;
  let verificationCode = options.verificationCode;
  let fullName = options.fullName;
  userId = options.userId;

  if (!fullName) {
    fullName = email;
  }
  message = "";

  message += `
  <!DOCTYPE html>
  <html>
  
  <head>
      <title> TalentX</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link
          href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet">
  
      <style>
          @media (max-width:767px) {
              .w-100 {
                  width: 100%;
              }
  
              .fz-20 {
                  font-size: 25px !important;
              }
          }
      </style>
  
  </head>
  
  <body style="font-family: 'Poppins', sans-serif; background:#fff;">
      <table width="100%" cellpadding:"0" cellspacing="0">
          <tbody>
              <tr>
                  <td style="padding: 50px 20px;">
                      <table width="676px" cellpadding:"0" cellspacing="0" style="margin: 0 auto; background:#F2F5FF
                      ;"
                          class="w-100">
                          <tr>
                              <td style="height:40px;">
  
                              </td>
                          </tr>
                     
                          <tr>
                              <td style="text-align:center; padding-bottom: 10px; height: 50px;">
                                  <img src="${BACK_WEB_URL}/static/Talentx_logo.png"
                                  style="width: 120px; margin: 0 auto;" />
                              </td>
                          </tr>
                          <tr>
                              <td style="padding: 20px 60px;">
                                  <table width="100%;cellpadding:"0" cellspacing="0" ">
                                      <tr>
                                          <td style="border-bottom: 1px solid 
                              #E2E8F0; ">
  
                              </td>
                                      </tr>
                                  </table>
                              </td>
                          </tr>
                          <tr>
                              <td style="text-align:center; padding-bottom: 10px; ">
                                  <img src="${BACK_WEB_URL}/static/banner.png"
                                  style="width: 340px; margin: 0 auto;" />
                              </td>
                          </tr>
                          <tr>
                              <td style="padding: 20px 60px;">
                                  <table width="100%;cellpadding:"0" cellspacing="0" ">
                                      <tr>
                                          <td style="border-bottom: 1px solid 
                              #E2E8F0; ">
  
                              </td>
                                      </tr>
                                  </table>
                              </td>
                          </tr>
                          <tr>
                              <td style="text-align:center;">
                                  <p style="font-size:22px; max-width: 400px; margin:0 auto; font-weight: 600; padding: 0 20px; color: #384860; line-height: 24px;"
                                      class="fz-20">Hi ${options.fullName},
                                  </p>
                              </td>
                          </tr>
                          <tr>
                              <td style="padding: 15px 0 25px 0;">
                                  <p
                                      style="font-size:16px; max-width: 400px; margin:0 auto; text-align: center; color: #6D6D6D; line-height: 25px; padding: 0 20px;">
                                      Your updated password is <b> ${options.password}</b>
                                  </p>
                              </td>
                          </tr>
                          <tr>
                              <td>
                                  <a href="#"
                                      style="background: #3F559E
                              ; display:block;color:#fff;padding:12px 10px; width: 220px; margin: 0 auto 0; box-shadow: none; border: 0; font-size: 15px; text-decoration: none; font-weight: 400; text-align: center;">Verify your email address</a>
                              </td>
                          </tr>
  
  
  
                          <tr>
                              <td style="height:60px;">
  
                              </td>
                          </tr>
                         
                       
              
                     
                      </table>
                  </td>
              </tr>
          </tbody>
      </table>
  </body>
  
  </html>`;

  SmtpController.sendEmail(email, "Password Update", message);
};

module.exports = {
  forgotPasswordEmail,
  add_user_email,
  userVerifyLink,
  updatePasswordEmail,
  invite_user_email,
};
