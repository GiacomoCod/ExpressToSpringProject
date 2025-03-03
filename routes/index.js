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
  const springBootServerUrl = 'http://localhost:8080'; // URL *base* di Spring Boot

  try {
    // Richiesta per ottenere i dettagli del film
    const movieResponse = await axios.get(`${springBootServerUrl}/movie/byId/${movieId}`, {
      timeout: 5000,
    });

    if (movieResponse.status !== 200) {
      // Gestisci l'errore se la richiesta per i dettagli del film fallisce
      throw new Error(`Errore nella richiesta dei dettagli del film: ${movieResponse.status}`);
    }

    const movie = movieResponse.data; // Dati del film

    // Richiesta per ottenere le recensioni del film
    const reviewsResponse = await axios.get(`${springBootServerUrl}/movie/${movieId}/reviews`, {
      timeout: 5000,
    });

    if (reviewsResponse.status !== 200) {
      // Gestisci l'errore se la richiesta delle recensioni fallisce
      throw new Error(`Errore nella richiesta delle recensioni: ${reviewsResponse.status}`);
    }

    const reviews = reviewsResponse.data; // Dati delle recensioni


    // Renderizza la vista 'movie-details', passando sia il film che le recensioni
    res.render('movie-details', { title: 'Dettagli Film', movie: movie, reviews: reviews });


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
    } else if (error.code === 'ERR_INVALID_URL'){
      statusCode = 500;
      errorMessage = "Errore, url non valido"
    }

    res.status(statusCode).render('error', { message: errorMessage, error: { status: statusCode } });
  }
});
module.exports = router;
