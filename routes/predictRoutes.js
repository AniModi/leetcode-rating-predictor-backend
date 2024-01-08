const { Router } = require('express');
const predictController = require('../controllers/predictController');

const router = Router();

router.post('/predict-contest', predictController.predictRating);

module.exports = router;
