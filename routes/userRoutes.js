const { Router } = require('express');
const userController = require('../controllers/userController');

const router = Router();

router.post('/update-users', userController.updateAllUsers);

module.exports = router;
