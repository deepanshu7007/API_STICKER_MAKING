// const countryCodeInfo = require("country-code-info")
const crypto = require('crypto');
// const { log } = require("grunt");


exports.generatePassword = async () => {
    let length = 4,
        charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        retVal = '';

    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }

    lowercase = 'abcdefghijklmnopqrstuvwxyz';
    lowercaseCharacterLength = 2;
    for (let i = 0, n = lowercase.length; i < lowercaseCharacterLength; ++i) {
        retVal += lowercase.charAt(Math.floor(Math.random() * n));
    }

    specialCharacter = '@%$#&-!';
    specialCharacterLength = 1;

    for (
        let i = 0, n = specialCharacter.length;
        i < specialCharacterLength;
        ++i
    ) {
        retVal += specialCharacter.charAt(Math.floor(Math.random() * n));
    }
    numeric = '0123456789';
    numericLength = 2;
    for (let i = 0, n = numeric.length; i < numericLength; ++i) {
        retVal += numeric.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

exports.generateOTP = async () => {
    let length = 6,
        charset = '1234567890',
        retVal = '';

    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

exports.generateVeificationCode = async () => {
    let length = 9,
        charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
        retVal = '';

    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

// exports.get_country_code_with_dial_code = async (dialCode) => {
//     let info = countryCodeInfo.findCountry({ 'dial': dialCode }, true);
//     return info;
// }

exports.convert_to_interernationl_number_system = (number) => {
    return Math.abs(Number(number)) >= 1.0e+9

        ? (Math.abs(Number(number)) / 1.0e+9).toFixed(2) + "B"
        // Six Zeroes for Millions 
        : Math.abs(Number(number)) >= 1.0e+6

            ? (Math.abs(Number(number)) / 1.0e+6).toFixed(2) + "M"
            // Three Zeroes for Thousands
            : Math.abs(Number(number)) >= 1.0e+3

                ? (Math.abs(Number(number)) / 1.0e+3).toFixed(2) + "K"

                : Math.abs(Number(number));
}

exports.convert_interernationl_to_number_system = (string) => {
    string = string ? string.toString().replace(/\s/g, '') : ""
    string = string ? string.toUpperCase() : "";
    let number = 0;

    if (string) {
        if (/([0-9]+)K/.test(string)) {
            number = string.split('K')[0];
            number = Number(number) * 1000;
        } else if (/([0-9]+)M/.test(string)) {
            number = string.split('M')[0];
            number = Number(number) * 1000000;
        } else if (/([0-9]+)B/.test(string)) {
            number = string.split('B')[0];
            number = Number(number) * 1000000000;
        } else if (/([0-9]+)T/.test(string)) {
            number = string.split('T')[0];
            number = Number(number) * 1000000000000;
        }else{
            number = Number(string);
        }
    }

    number = number > 0 ? number : 0;
    return number;
}

exports.create_cipher = (string) => {
    const secret = 'abcdefg';
    const hash = crypto.createHmac('sha256', secret)
        .update('Welcome to JavaTpoint')
        .digest('hex');
    console.log(hash);
}
exports.remove_special_characters_from_search = async(string) => {
    string = string.replace(/[^a-zA-Z0-9_@. ]/g, "");
    return string
}

exports.adminPoints = async() => {
    const data = await Loyalitypoints.find()
    // console.log(data,'i m h ere');
    return data[0]
}
