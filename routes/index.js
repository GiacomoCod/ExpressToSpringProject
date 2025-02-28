// routes/index.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

// ... (altre route) ...
router.get('/', function (req, res, next) {
  res.render('index', { title: 'IMDB di Giemma' });
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
    // Invia una risposta di successo al client Node.js
    res.status(200).send("Dati inviati con successo a Spring Boot");

  } catch (error) {
    console.error('Errore:', error.message);
    if (error.response) {
      console.error("Dettagli errore:", error.response.status, error.response.data);
      // Invia una risposta di errore al client Node.js
      res.status(error.response.status).send("Errore dal server Spring Boot");
    } else {
      // Invia una risposta di errore al client Node.js
      res.status(500).send("Errore di rete o del server Node.js");
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

// Route per ottenere informazioni sul film (tramite AJAX)
router.get('/getMovieInfo', async (req, res) => {
  const movieName = req.query.movieName;
  const springBootServerUrl = 'http://localhost:8080/movie';

  if (!movieName) {
    return res.status(400).send('Il nome del film è richiesto.');
  }

  try {
    const url = `${springBootServerUrl}/${movieName}`; // Costruzione URL CORRETTA
    const response = await axios.get(url, {
      timeout: 5000, // Timeout di 5 secondi per la richiesta a Spring Boot
    });

    if (response.status === 200) {
      // Controlla se la risposta è vuota (lista di film vuota)
      if (Array.isArray(response.data) && response.data.length === 0) {
        res.status(200).send("Nessun film corrispondente alla ricerca trovato."); // Restituisci un messaggio
      } else {
        res.json(response.data); // Invia i dati del film come JSON
      }
    } else {
      res.status(response.status).send("Film non trovato."); //Restituisci errore
    }

  } catch (error) {
    console.error('Errore:', error);
    if (error.response) {
      // Gestione più specifica degli errori
      if (error.response.status === 404) {
        // Se Spring Boot restituisce 404, significa che l'endpoint è corretto,
        // ma la risorsa specifica (il film) non è stata trovata.
        res.status(200).send("Nessun film corrispondente alla ricerca trovato.");
      } else {
        //Altri errori provenienti da Spring Boot
        res.status(error.response.status).send(error.response.data);
      }
    } else if (error.code === 'ECONNABORTED') { // Gestione timeout Axios
      res.status(408).send('Tempo scaduto. Il server Spring Boot non ha risposto.');
    }
    else if (error.code === 'ERR_INVALID_URL'){
      res.status(500).send("Errore nella richiesta, controlla l'URL")
    }
    else {
      res.status(500).send('Errore del server.');
    }
  }
});
module.exports = router;