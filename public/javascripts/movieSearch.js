// public/javascripts/movieSearch.js

document.addEventListener('DOMContentLoaded', () => {

    const movieForm = document.getElementById('movieForm');
    const movieInfoDiv = document.getElementById('movieInfo');

    movieForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const movieName = document.getElementById('movieName').value;
        const encodedMovieName = encodeURIComponent(movieName);

        // Usa fetch per fare una richiesta POST a /getMovieInfo
        fetch('/getMovieInfo', {
            method: 'POST', // Metodo POST
            headers: {
                'Content-Type': 'application/json' // Indica che invii JSON
            },
            body: JSON.stringify({ movieName: movieName }) // Invia il nome del film come JSON
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Errore HTTP: ${response.status}`); // Gestione errori più pulita
                }
                return response.json(); // Parsa la risposta come JSON
            })
            .then(data => {
                if(data.error) {
                    renderErrorInfo(data.error)
                } else {
                    renderMovieInfo(data); // Passa la lista di film a renderMovieInfo
                }

            })
            .catch(error => {
                console.error('Errore durante la richiesta:', error);
                renderErrorInfo(error.message); //Mostra messaggio all'utente

            });
    });

    function renderMovieInfo(movies) {
        let html = '';
        if (movies.length > 0) {
            movies.forEach(movie => {
                html += `
                    <div class="col-md-4 mb-3">
                        <div class="card h-100">
                            <img src="${movie.poster || 'placeholder.jpg'}" class="card-img-top" alt="Locandina di ${movie.name}">
                            <div class="card-body">
                                <h5 class="card-title">${movie.name}</h5>
                                 <p class="card-text">Anno: ${movie.year}</p>
                                <a href="/movie-details/${movie.id}" class="btn btn-primary">Dettagli</a>
                            </div>
                        </div>
                    </div>
                `;
            });
        } else {
            html = '<div class="alert alert-info" role="alert">Nessun film trovato.</div>';
        }

        movieInfoDiv.innerHTML = html;
    }


    function renderErrorInfo(message) {
        movieInfoDiv.innerHTML = `<div class="alert alert-danger" role="alert">${message}</div>`; // Usa classi Bootstrap per l'errore
    }
});