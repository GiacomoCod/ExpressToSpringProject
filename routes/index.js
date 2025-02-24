const express = require('express');
const router = express.Router();
const axios = require('axios');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' }); // Pagina iniziale (se serve)
});

// Route per INVIARE dati a Spring Boot (lascia questa route così com'era)
router.get('/sendData', async (req, res) => {
  const dataToSend = {
    field1: "Valore da Node.js",
    field2: 123,
  };

  const springBootServerUrl = 'http://localhost:8081/receiveData'; // URL di Spring Boot per *ricevere*

  try {
    const response = await axios.post(springBootServerUrl, dataToSend, {
      headers: { 'Content-Type': 'application/json' }
    });

    // Passa i dati alla vista 'index'
    res.render('index', { title: 'Risposta da Spring Boot', responseData: response.data });

  } catch (error) {
    console.error('Errore:', error.message);
    if (error.response) {
      console.error("Dettagli errore:", error.response.status, error.response.data);
      res.status(error.response.status).render('error', { message: "Errore dal server", error: error.response });
    } else {
      res.status(500).render('error', { message: 'Errore di rete', error: { status: 500, stack: error.stack } });
    }
  }
});

// NUOVA ROUTE per OTTENERE la città da Spring Boot
router.get('/getCitta', async (req, res) => {
  const nome = req.query.nome;  // Prendi il nome dalla query string
  const cognome = req.query.cognome; // Prendi il cognome dalla query string
  const springBootServerUrl = 'http://localhost:8080/getCitta'; // URL di Spring Boot per *ottenere*

  // Controlla se nome e cognome sono stati forniti
  if (!nome || !cognome) {
    return res.status(400).render('error', {
      message: 'Nome e cognome sono richiesti',
      error: { status: 400 }
    });
  }

  try {
    const response = await axios.get(springBootServerUrl, {
      params: { nome, cognome }, // Passa nome e cognome come parametri
      headers: { 'Accept': 'application/json' } // Buona pratica
    });

    // Passa i dati alla vista 'index'
    res.render('index', {
      title: 'Risultato',
      citta: response.data, // response.data contiene la città (stringa)
      nome,
      cognome
    });

  } catch (error) {
    console.error('Errore nella richiesta a Spring Boot:', error.message);

    if (error.response) {
      // Errore dal server Spring Boot (es. 404, 500)
      console.error("Dettagli errore:", error.response.status, error.response.data);
      res.status(error.response.status).render('error', {
        message: `Errore da Spring Boot: ${error.response.status}`,
        error: error.response
      });

    } else if (error.request) {
      // Errore di rete (il server Spring Boot potrebbe non essere in esecuzione)
      res.status(500).render('error', {
        message: 'Errore di rete: Impossibile raggiungere il server Spring Boot.',
        error: { status: 500, stack: error.stack }
      });
    } else {
      // Errore generico (probabilmente un errore di programmazione)
      res.status(500).render('error', {
        message: 'Errore durante la richiesta',
        error: { status: 500, stack: error.stack }
      });
    }
  }
});

module.exports = router;