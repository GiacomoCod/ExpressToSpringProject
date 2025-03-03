// routes/index.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Movie Database' });
});

router.post('/getMovieInfo', async (req, res) => {
  const movieName = req.body.movieName;
  const springBootServerUrl = 'http://localhost:8080/movie';

  try {
    const response = await axios.get(`${springBootServerUrl}/${movieName}`, {
      timeout: 5000,
    });

    if (response.status === 200) {
      res.json(response.data);
    } else {
      res.status(response.status).json({ error: `Errore da Spring Boot: ${response.status}` });
    }
  } catch (error) {
    console.error('Errore:', error);
    let statusCode = 500;
    let errorMessage = 'Errore del server.';

    if (error.response) {
      statusCode = error.response.status;
      errorMessage = `Errore da Spring Boot: ${statusCode}`;
      if (statusCode === 404) {
        errorMessage = "Film non trovato";
      }
    } else if (error.code === 'ECONNABORTED') {
      statusCode = 408;
      errorMessage = 'Tempo scaduto. Il server Spring Boot non ha risposto.';
    } else if (error.code === 'ERR_INVALID_URL') {
      statusCode = 500;
      errorMessage = "Errore, url non valido";
    }
    res.status(statusCode).json({ error: errorMessage });
  }
});

router.get('/movie-details/:id', async (req, res) => {
  const movieId = req.params.id;
  const springBootServerUrl = 'http://localhost:8080/movie/byId'; // URL *base*

  // 1. Costruzione dell'URL (con logging)
  const url = `${springBootServerUrl}/${movieId}`;
  console.log("URL richiesta a Spring Boot:", url); // LOG: Stampa l'URL completo

  try {
    const response = await axios.get(url, {
      timeout: 5000,
    });

    if (response.status === 200) {
      res.render('movie-details', { title: 'Dettagli Film', movie: response.data });
    } else {
      // Se Spring Boot restituisce un errore, gestiscilo qui (ma dovrebbe essere un 500, non un 404)
      res.status(response.status).render('error', { message: `Errore da Spring Boot: ${response.status}`, error: {status: response.status} });
    }

  } catch (error) {
    console.error('Errore:', error);  // Log dell'errore COMPLETO

    // Gestione degli errori (centralizzata, evita duplicazione)
    let statusCode = 500;
    let errorMessage = 'Errore del server.';

    if (error.response) {
      // Errore da Spring Boot
      statusCode = error.response.status;
      errorMessage = `Errore da Spring Boot: ${statusCode}`;
      if(statusCode === 404){ //Gestisco il 404 nello specifico
        errorMessage = "Film non trovato";
      }
      //Potrei aggiungere altri else if per gestire altri statusCode
    } else if (error.code === 'ECONNABORTED') {
      statusCode = 408;
      errorMessage = 'Tempo scaduto. Il server Spring Boot non ha risposto.';
    } else if (error.code === 'ERR_INVALID_URL'){
      statusCode = 500;
      errorMessage = "Errore, url non valido"
    }

    res.status(statusCode).render('error', { message: errorMessage, error: { status: statusCode } });
  }
});

module.exports = router;
