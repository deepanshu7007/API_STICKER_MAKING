const dbConfig = require('../config/db.config.js');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.users = require('./users.model.js')(mongoose);
db.department = require('./department.model.js')(mongoose);

db.features = require('./features.model.js')(mongoose);
db.plan = require('./plan.model.js')(mongoose);
db.subscriptions = require('./subscription.model.js')(mongoose);
db.cards = require('./cards.model.js')(mongoose);
db.usertransactions = require('./usertransactions.model.js')(mongoose)
db.faqs = require("./faq.model.js")(mongoose)
db.items = require("./items.model.js")(mongoose);
// db.userslogins = require('./userslogins.model.js')(mongoose)

module.exports = db;
