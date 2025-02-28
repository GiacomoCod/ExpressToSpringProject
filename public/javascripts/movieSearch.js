// public/javascripts/movieSearch.js

//Questo assicura che il codice JavaScript venga eseguito solo dopo che il DOM (la struttura HTML della pagina) è stato completamente caricato.
document.addEventListener('DOMContentLoaded', () => {

    const movieForm = document.getElementById('movieForm'); //Ottiene un riferimento all'elemento HTML <form> con id="movieForm".
    const movieInfoDiv = document.getElementById('movieInfo'); //Ottiene un riferimento all'elemento HTML <div> con id="movieInfo".  Questo è il div dove mostreremo le informazioni sul film.

    //Aggiunge un event listener al form.  Quando l'utente fa clic sul pulsante "Cerca Film" (o preme Invio nel campo di input), viene scatenato l'evento submit.  La funzione async (event) => { ... } viene eseguita in risposta a questo evento.
    //async: parola chiave indica che la funzione è asincrona. Questo ci permette di usare await all'interno della funzione.
    movieForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const movieName = document.getElementById('movieName').value;
        const encodedMovieName = encodeURIComponent(movieName);
        const url = `/getMovieInfo?movieName=${encodedMovieName}`;

        try {
            const response = await fetch(url, {
                signal: AbortSignal.timeout(5000) // Timeout di 5 secondi (lato client)
            });

            if (response.ok) {
                const contentType = response.headers.get("content-type");
                //Controllo se il tipo di contenuto è JSON
                if (contentType && contentType.includes("application/json")) {
                    const movies = await response.json();
                    renderMovieInfo(movies);

                } else {
                    //Se non è JSON, la risposta contiene il messaggio
                    const message = await response.text();
                    renderErrorInfo(message); // Mostra il messaggio "Nessun film..."
                }
            } else {
                const errorText = await response.text();
                renderErrorInfo(errorText);
            }

        } catch (error) {
            console.error('Errore:', error);
            if (error.name === 'TimeoutError') {
                renderErrorInfo("Tempo scaduto. Il server non ha risposto in tempo.");
            } else {
                renderErrorInfo("Errore durante la richiesta.");
            }
        }
    });

    function renderMovieInfo(movies) {
        let html = '';
        if (movies.length > 0) {
            movies.forEach(movie => {
                html += `
                <div class="col-md-4 mb-3"> {{!-- Colonna Bootstrap --}}
                    <div class="card h-100"> {{!-- Card Bootstrap, altezza 100% --}}
                        <img src="${movie.poster || 'placeholder.jpg'}" class="card-img-top" alt="Locandina di ${movie.name}"> {{!-- Immagine --}}
                        <div class="card-body">
                            <h5 class="card-title">${movie.name}</h5>
                            <p class="card-text">Anno: ${movie.year}</p>
                            <p class="card-text">Tagline: ${movie.tagline}</p>
                            <p class="card-text">Descrizione: ${movie.description}</p>
                            <p class="card-text">Durata: ${movie.minute} minuti</p>
                            <p class="card-text">Valutazione: ${movie.rating}</p>
                        </div>
                    </div>
                </div>
            `;
            });
        } else {
            html = '<div class="alert alert-info" role="alert">Nessun film trovato.</div>'; // Messaggio con stile Bootstrap
        }

        movieInfoDiv.innerHTML = html;
    }

    function renderErrorInfo(message) {
        movieInfoDiv.innerHTML = `<div class="alert alert-danger" role="alert">${message}</div>`; // Messaggio di errore con stile Bootstrap
    }
});

/*
document.addEventListener('DOMContentLoaded', ...):  Questo assicura che il codice JavaScript venga eseguito solo dopo che il DOM (la struttura HTML della pagina) è stato completamente caricato.  È una best practice per evitare errori.

const movieForm = document.getElementById('movieForm');:  Ottiene un riferimento all'elemento HTML <form> con id="movieForm".

const movieInfoDiv = document.getElementById('movieInfo');:  Ottiene un riferimento all'elemento HTML <div> con id="movieInfo".  Questo è il div dove mostreremo le informazioni sul film.

movieForm.addEventListener('submit', async (event) => { ... });:  Aggiunge un event listener al form.  Quando l'utente fa clic sul pulsante "Cerca Film" (o preme Invio nel campo di input), viene scatenato l'evento submit.  La funzione async (event) => { ... } viene eseguita in risposta a questo evento.

async: Questa parola chiave indica che la funzione è asincrona. Questo ci permette di usare await all'interno della funzione.
(event): L'oggetto event contiene informazioni sull'evento (in questo caso, l'evento submit).
event.preventDefault();:  Importantissimo!  Impedisce il comportamento predefinito del form (che sarebbe quello di inviare i dati a un'altra pagina e ricaricare la pagina corrente).  Vogliamo gestire l'invio dei dati con JavaScript (AJAX).

const movieName = document.getElementById('movieName').value;:  Ottiene il valore inserito dall'utente nel campo di input con id="movieName".

const encodedMovieName = encodeURIComponent(movieName);:  Fondamentale!  Codifica il nome del film in modo che sia sicuro da usare in un URL.  Ad esempio, se l'utente inserisce "Il buono, il brutto, il cattivo", questo verrà codificato come "Il%20buono%2C%20il%20brutto%2C%20il%20cattivo".

const url =/getMovieInfo?movieName=${encodedMovieName};:  Costruisce l'URL per la richiesta AJAX.  Nota che stiamo usando una query string per passare il nome del film (?movieName=...).

try { ... } catch (error) { ... }:  Blocco try...catch per gestire eventuali errori durante la richiesta AJAX.

const response = await fetch(url);:  Qui avviene la magia di AJAX!  Questa riga fa una richiesta HTTP GET all'URL che abbiamo costruito.

fetch(url): La funzione fetch è un'API del browser (moderna) per fare richieste di rete. Restituisce una Promise.
await: Questa parola chiave (che può essere usata solo all'interno di una funzione async) fa sì che l'esecuzione del codice si metta in pausa fino a quando la Promise restituita da fetch non viene risolta (cioè, fino a quando non riceviamo una risposta dal server). Questo rende il codice asincrono più facile da leggere e scrivere (sembra sincrono).
response: L'oggetto response contiene la risposta del server (codice di stato, header, corpo della risposta).
if (response.ok) { ... } else { ... }:  Controlla se la richiesta ha avuto successo.  response.ok è true se il codice di stato HTTP è compreso tra 200 e 299 (successo).

const movie = await response.json();:  Se la richiesta ha avuto successo, parsa il corpo della risposta come JSON.  Dato che il tuo server Spring Boot restituisce un oggetto JSON, questo trasforma la stringa JSON in un oggetto JavaScript.

await viene utilizzato di nuovo per attendere che la Promise ritornata da response.json() venga risolta.
renderMovieInfo(movie);: Chiama la funzione renderMovieInfo (definita sotto) per aggiornare il contenuto della pagina con le informazioni sul film.

const errorText = await response.text();: Se la richiesta non ha avuto successo, ottiene il corpo della risposta come testo (che dovrebbe contenere un messaggio di errore).

renderErrorInfo(errorText);: Chiama la funzione renderErrorInfo per mostrare il messaggio di errore.

catch (error) { ... }:  Gestisce eventuali errori che si verificano durante la richiesta (ad esempio, errori di rete).

renderErrorInfo("Errore durante la richiesta.");: Mostra un messaggio di errore generico in caso di problemi di rete.

function renderMovieInfo(movie) { ... }:

Questa funzione riceve come argomento l'oggetto JavaScript movie (ottenuto parsando il JSON).
Aggiorna il contenuto di movieInfoDiv con le informazioni sul film, usando template literals (backtick: `) per creare l'HTML in modo dinamico.
function renderErrorInfo(message) { ... }:

Questa funzione riceve come argomento il messaggio di errore.
Aggiorna il contenuto di movieInfoDiv con il messaggio di errore.
 */