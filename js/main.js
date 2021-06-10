var nMinutes = 25; // per debuggare con più rapidità: deve stare a 25 normalmente
var timeUpd // poi le altre funzioni non lo vedono
var pRisultati // poi le altre funzioni non lo vedono
var shuffleQuestionMode = true // mescola le domande
var shuffleAnswerMode = true // mescola le risposte

const format = (num, places) => String(num).padStart(places, '0') // funzione one-line figa che permette di fare il padding delle stringhe con gli zeri

// TODO: controllare se effettivamente ci siano 40 domande, siccome se ce ne sono di meno il programma potrebbe non funzionare correttamente
var numeroDomande = 40

var questions // contiene tutte le domande e le risposte (parsate dal json)

////////////////////
// EVENT LISTENER //
////////////////////

// event listener sulla combobox
document.getElementById('so-quiz-version').onchange = function() {
    pRisultati = document.getElementById("risultati")
    pRisultati.hidden = true
    clearBox("container")
    clearInterval(timeUpd)
    buildJSON(this.value)
    document.getElementById("end").innerHTML = "";
    timeStart()
    document.getElementById("btnInvia").style.visibility = "visible";
}

// event listener sul button
document.getElementById('btn-quiz-reload').onclick = function() {
    restart()
}

function restart() {
    pRisultati = document.getElementById("risultati")
    pRisultati.hidden = true
    clearBox("container")
    clearInterval(timeUpd)
    buildJSON(document.getElementById('so-quiz-version').value)
    document.getElementById("end").innerHTML = "";
    timeStart()
    document.getElementById("btnInvia").style.visibility = "visible";
}

// event listener domande casuali
document.getElementById("chk-shuffle-questions").onclick = function() {
    shuffleQuestionMode = !shuffleQuestionMode
    restart()
}

// event listener domande casuali
document.getElementById("chk-shuffle-answers").onclick = function() {
    shuffleAnswerMode = !shuffleAnswerMode
    restart()
}

// cancella il contenuto di un div, container nel nostro caso
function clearBox(elementID) {
    var div = document.getElementById(elementID)

    while (div.firstChild) {
        div.removeChild(div.firstChild)
    }
}

// setta un conto alla rovescia
function timeStart() {
    var countDownDate = new Date()
    countDownDate.setMinutes(countDownDate.getMinutes() + nMinutes)

    timeUpd = setInterval(function() {
        var now = new Date().getTime()
        var timeleft = countDownDate - now;

        // calcola minuti e secondi rimasti
        var seconds = Math.floor((timeleft % (1000 * 60)) / 1000)
        var minutes = Math.floor((timeleft % (1000 * 60 * 60)) / (1000 * 60))

        // mostra quanto tempo manca all'inizio
        document.getElementById("timeleft").innerHTML = format(minutes, 2) + ":" + format(seconds, 2)

        // tempo scaduto
        if (timeleft < 0) {
            clearInterval(timeUpd)
            document.getElementById("timeleft").innerHTML = ""
            document.getElementById("end").innerHTML = "TEMPO SCADUTO!";

            validate()
        }
    }, 1000)
}

// mescola due array con lo stesso "ordinamento casuale"
function shuffle(obj1, obj2) {
    var index = obj1.length;
    var rnd, tmp1, tmp2;

    while (index) {
        rnd = Math.floor(Math.random() * index)
        index -= 1;
        tmp1 = obj1[index];
        tmp2 = obj2[index];
        obj1[index] = obj1[rnd];
        obj2[index] = obj2[rnd];
        obj1[rnd] = tmp1;
        obj2[rnd] = tmp2;
    }
}

// builda i container col json
function buildJSON(path) {
    // parsing del json
    if (shuffleQuestionMode) {
        fetch('json/' + path)
            .then(res => res.json())
            .then(data => questions = data)
            .then(() => questions = questions.sort(() => Math.random() - 0.5)) // randomizziamo l'ordine delle domande con la oneline figa
            .then(() => loadElements(questions)) // buildiamo le varie parti della pagina web
    } else {
        fetch('json/' + path)
            .then(res => res.json())
            .then(data => questions = data)
            .then(() => questions = questions) // non randomizzo
            .then(() => loadElements(questions)) // buildiamo le varie parti della pagina web
    }
}

// carichiamo gli elementi nella pagina web
function loadElements(questions) {
    for (i = 0; i < numeroDomande; i++) {
        var container = document.getElementById('container')
        var containingDiv = document.createElement("div")
        containingDiv.id = i;
        container.appendChild(containingDiv)

        var tabella = document.createElement("table")
        tabella.border = 1;

        tabella.innerHTML = "<b><font color='blue'>" + (i + 1) + ". " + questions[i]['question'] + "</font></b><br>";
        containingDiv.appendChild(tabella)

        // shufflo gli array insieme (risposte casuali)
        var replies = questions[i]['replies'];

        // questo array mi serve perchè altrimenti avrei dovuto cambiare il json da capo
        // (sebbene sarebbe stato più comodo avere un numero abbiamo delle lettere, quindi dobbiamo convertirle)
        var replyNumber = Array.from(Array(replies.length).keys())

        // casuale
        if (shuffleAnswerMode) {
            shuffle(replies, replyNumber)
        }

        // tabella per la risposta
        var uglyTabella = document.createElement("table")
        uglyTabella.border = 1;

        // ora mi calcolo la risposta giusta
        var rightAnswerText = questions[i]['correct'].charCodeAt(0) - 97 // prima mi calcolo il numero dalla lettera
        //rightAnswerText = replyNumber.findIndex((element) => element == rightAnswerText) // lo cerco nell'array delle risposte shufflate e mi salvo l'indice "shufflato" 

        // se c'è codice renderizziamolo in opportuna tabella e blocco pre
        if (questions[i]['has_code'] == 1) {
            tablePre = document.createElement('table')
            tablePre.border = 2;
            preBlock = document.createElement('pre')
            preBlock.textContent = questions[i]['code'];
            tablePre.append(preBlock)
            uglyTabella.append(tablePre)
        }

        // per ogni risposta del json (le varie scelte)
        for (j = 0; j < replies.length; j++) {
            var radiobox = document.createElement('input')
            radiobox.id = 'risposta' + i + "." + j;
            radiobox.type = 'radio';
            radiobox.name = 'radioBtns' + i;
            radiobox.value = (replyNumber[j])

            var label = document.createElement('label')
            label.htmlFor = 'risposta' + i + "." + j;

            // se il flag nel json è 1, allora renderizzamelo come blocco pre 
            if (questions[i]['answers_have_code']) {
                description = document.createElement('textarea')
                description.name = "taAnswerCode"
                description.textContent = " " + replies[j];
                description.readOnly = true;
                description.cols = 100;
                description.rows = 10
            } else {
                var description = document.createTextNode(" " + replies[j])
            }
            label.appendChild(description)

            var newline = document.createElement('br')

            uglyTabella.appendChild(radiobox)
            uglyTabella.appendChild(label)
            uglyTabella.appendChild(newline)
        };

        // definisco radiobutton della risposta saltata
        var radiobox = document.createElement('input')
        radiobox.id = 'risposta' + i + "." + j;
        radiobox.type = 'radio';
        radiobox.name = 'radioBtns' + i;
        radiobox.value = "s";
        radiobox.checked = true; // settato a true di default

        var label = document.createElement('label')
        label.htmlFor = 'risposta' + i + "." + j;

        var description = document.createTextNode(" Nessuna risposta")
        label.appendChild(description)

        var newline = document.createElement('br')

        uglyTabella.appendChild(radiobox)
        uglyTabella.appendChild(label)
        uglyTabella.appendChild(newline)

        // aggiungo la tabella al div gigante
        containingDiv.appendChild(uglyTabella)

        // aggiungo lo span nascosto della risposta giusta
        var answer = document.createElement("span")
        answer.textContent = rightAnswerText
        answer.hidden = "true";
        answer.id = "span" + i;
        uglyTabella.appendChild(answer)

        var newline2 = document.createElement('br')

        containingDiv.appendChild(newline2)
        container.appendChild(containingDiv)
    }
}

// valida le risposte inserite a seguito della pressione del tasto invia
// o della scadenza del popup
function validate() {
    contSkip = 0;
    contRight = 0;
    contWrong = 0;
    punteggio = 0;

    for (i = 0; i < numeroDomande; i++) {
        var buttons = document.getElementsByName("radioBtns" + i)
        var rightAnswer = document.getElementById("span" + i)
        var result = -1;
        var checked = -1;

        // disattivo i bottoni
        for (j = 0; j < buttons.length; j++) {
            buttons[j].disabled = true;
        }

        // ciclo i bottoni
        // se l'ultimo bottone è stato selezionato allora è stata skippata la risposta
        if (buttons[buttons.length - 1].checked) {
            contSkip++;

            // quella giusta era
            var num = rightAnswer.textContent

            var inputElement = buttons[num];
            var labelElement = inputElement.nextElementSibling
            labelElement.style.backgroundColor = "#00FF00";


        } else {
            // se uno dei bottoni contiene la risposta giusta allora setto il booleano a true
            for (j = 0; j < (buttons.length - 1); j++) { // -1 perché tanto l'ultimo l'ho già visto e contiene la risposta saltata
                if (buttons[j].checked) {
                    checked = j; // salvo cosa ho checkato

                    if (buttons[j].value === rightAnswer.textContent) {
                        result = j; // salvo se ho beccato quello giusto o no
                        break;
                    }
                }
            }

            var inputElement = buttons[checked]; // prendo l'elemento checkato
            var labelElement = inputElement.nextElementSibling; // prendo la label associata

            if (result != -1) {
                // se becco quella giusta, allora coloramela in verde
                labelElement.style.backgroundColor = "#00FF00";

                punteggio += 2;
                contRight++;
            } else {
                // colora in rosso la label della sbagliata
                labelElement.style.backgroundColor = "#FF0000";

                // quella giusta era
                var num = rightAnswer.textContent

                var inputElement = buttons[num]; // quella giusta ce l'ho salvata in num
                var labelElement = inputElement.nextElementSibling
                labelElement.style.backgroundColor = "#00FF00";

                punteggio -= 1;
                contWrong++;
            }
        }
    }

    // aggiungo i risultati a fine pagina
    pRisultati = document.getElementById("risultati")
    pRisultati.innerHTML =
        "Risposte giuste: <b>" + contRight + "</b>" + "<br>" +
        "Risposte errate: <b>" + contWrong + "</b>" + "<br>" +
        "Non risposte: <b>" + contSkip + "</b>" + "<br>" +
        "<b>Punteggio: " + punteggio + "/" + "80" + "</b>" + "<br>";

    pRisultati.hidden = false;

    // ciò viene fatto altrimenti il timer continua
    document.getElementById("timeleft").innerHTML = ""
    clearInterval(timeUpd)

    // TODO: trovare un modo migliore per fare ciò rispeto a fare un copia-incolla
    // fa un popup contenente il testo "copia" dell'innerhtml
    testoAlert = "Risposte giuste:" + contRight + "\r\n" +
        "Risposte errate: " + contWrong + "\r\n" +
        "Non risposte: " + contSkip + "\r\n" +
        "Punteggio: " + punteggio + "/" + "80" + "\r\n";

    document.getElementById("btnInvia").style.visibility = "hidden";

    window.alert(testoAlert)
}