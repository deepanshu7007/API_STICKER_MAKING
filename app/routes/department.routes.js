// module.exports = (app) => {
    const department = require('../controllers/departmentController');
    var router = require('express').Router();
  

  
    router.post('/add', department.addDepartment);
  
    router.get('/detail', department.depatment_detail);
  
    router.put('/update', department.update_department);
  
    router.get('/list', department.getAllDepartment);
  
    router.delete('/delete', department.delete_depatment);
  
  
  
  //   app.use('/api', router);
  // };
  module.exports = router