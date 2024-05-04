// module.exports = (app) => {
    const faq = require('../controllers/faqController');
    var router = require('express').Router();
  

  
    router.post('/add', faq.add);
  
    router.get('/detail', faq.detail);
  
    router.put('/update', faq.update);
  
    router.get('/list', faq.list);
  
    router.delete('/delete/', faq.delete);
  
  
    router.put('/status', faq.changeStatus);
  
  //   app.use('/api', router);
  // };
  module.exports = router