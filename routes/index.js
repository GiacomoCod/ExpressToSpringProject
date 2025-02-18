const express = require('express');
const router = express.Router();
const axios = require('axios');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' }); // Pagina iniziale, se necessario
});

router.get('/sendData', async (req, res) => {
  const dataToSend = {
    field1: "Valore da Node.js",
    field2: 123,
  };

  const springBootServerUrl = 'http://localhost:8081/receiveData';

  try {
    const response = await axios.post(springBootServerUrl, dataToSend, {
      headers: { 'Content-Type': 'application/json' }
    });

    // Usa res.render() per passare i dati alla vista index.ejs
    res.render('index', { title: 'Risposta da Spring Boot', responseData: response.data });

  } catch (error) {
    console.error('Errore:', error.message);
    if (error.response) {
      console.error("Dettagli errore:", error.response.status, error.response.data);
      res.status(error.response.status).render('error', {message: "Errore dal server", error: error.response}); // Usa la vista 'error'
    } else {
      res.status(500).render('error', {message: 'Errore di rete', error: {status: 500, stack: error.stack}}); // Usa la vista 'error'
    }
  }
});

module.exports = router;

//ciao
