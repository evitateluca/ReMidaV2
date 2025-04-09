// Elementi dell'interfaccia utente
const formContainer = document.getElementById('formContainer');
const loading = document.getElementById('loading');
const chatContainer = document.getElementById('chatContainer');
const chatbox = document.getElementById('chatbox');
const userInput = document.getElementById('userInput');
const quickReplies = document.getElementById('quickReplies');
const currentQuestion = document.getElementById('currentQuestion');
const currentInput = document.getElementById('currentInput');
const nextButton = document.getElementById('nextButton');
const themeToggle = document.getElementById('themeToggle');
const progressIndicator = document.querySelector('.progress-indicator');

// Configurazione API OpenRouter
const API_KEY = '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'; // Sostituisci con la tua chiave se diversa
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Stato dell'utente
let userData = {
    nome: null,
    email: null,
    entrate: null,
    uscite: null,
    patrimonio: { contoCorrente: null, immobili: null, obbligazioni: null },
    debiti: null,
    contiDeposito: null,
    banca: null,
    risparmi: null,
    eta: null,
    obiettivo: null
};
let currentPhase = 'Analizza';
let messageHistory = [];
let isDarkTheme = false;
let questionIndex = 0;
let settingGoal = false; // Stato per gestire l'inserimento dell'obiettivo
let goalAmount = null; // Stato temporaneo per l'importo dell'obiettivo

// Domande conversazionali
const questions = [
    { text: "Come ti chiami?", key: 'nome', type: 'text' },
    { text: "Qual è la tua email?", key: 'email', type: 'email' },
    { text: "Quanti anni hai? (opzionale)", key: 'eta', type: 'number', optional: true },
    { text: "Quanto guadagni al mese (€)?", key: 'entrate', type: 'number' },
    { text: "Quanto spendi al mese (€)?", key: 'uscite', type: 'number' },
    { text: "Quanto hai sul conto corrente (€)?", key: 'patrimonio.contoCorrente', type: 'number' },
    { text: "Valore dei tuoi immobili (€)? (0 se nessuno)", key: 'patrimonio.immobili', type: 'number', optional: true },
    { text: "Valore delle tue obbligazioni (€)? (0 se nessuna)", key: 'patrimonio.obbligazioni', type: 'number', optional: true },
    { text: "Hai debiti (€)? (0 se nessuno)", key: 'debiti', type: 'number', optional: true },
    { text: "Quanto hai in conti deposito (€)? (0 se nessuno)", key: 'contiDeposito', type: 'number', optional: true },
    { text: "Quanto hai risparmiato (€)? (0 se nessuno)", key: 'risparmi', type: 'number', optional: true },
    { text: "Che banca usi? (opzionale)", key: 'banca', type: 'text', optional: true },
    { text: "Qual è il tuo obiettivo principale? (es. Risparmiare per una casa)", key: 'obiettivo', type: 'text', optional: true }
];

// Genera i progress indicator
function generateProgressIndicators() {
    progressIndicator.innerHTML = '';
    questions.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.className = 'step-dot';
        dot.setAttribute('data-step', index + 1);
        dot.textContent = index + 1;
        if (index === questionIndex) dot.classList.add('active');
        progressIndicator.appendChild(dot);
    });
}

// Funzione per aggiornare i progress indicator
function updateProgress() {
    document.querySelectorAll('.step-dot').forEach(dot => {
        dot.classList.remove('active');
        if (parseInt(dot.getAttribute('data-step')) === questionIndex + 1) {
            dot.classList.add('active');
        }
    });
}

// Funzione per impostare la domanda corrente
function setQuestion(index) {
    if (index >= questions.length) {
        finishForm();
        return;
    }
    const q = questions[index];
    currentQuestion.textContent = q.text;
    currentInput.type = q.type;
    currentInput.value = '';
    currentInput.placeholder = q.optional ? 'Puoi saltare (premi Avanti)' : 'Rispondi qui...';
    currentInput.focus();
    updateProgress();
}

// Funzione per salvare la risposta
function saveAnswer() {
    const q = questions[questionIndex];
    const value = currentInput.value.trim();
    if (!value && !q.optional) {
        alert('Per favore, inserisci una risposta o usa 0 se non applicabile!');
        return false;
    }
    if (q.type === 'number' && value && isNaN(value)) {
        alert('Inserisci un numero valido!');
        return false;
    }
    if (q.key.includes('.')) {
        const [parent, child] = q.key.split('.');
        userData[parent][child] = value ? (q.type === 'number' ? parseFloat(value) : value) : null;
    } else {
        userData[q.key] = value ? (q.type === 'number' ? parseFloat(value) : value) : null;
    }
    return true;
}

// Avanzamento alla prossima domanda
function nextQuestion() {
    if (saveAnswer()) {
        questionIndex++;
        setQuestion(questionIndex);
    }
}

// Fine del form
function finishForm() {
    formContainer.style.display = 'none';
    loading.style.display = 'block';
    setTimeout(() => {
        loading.style.display = 'none';
        chatContainer.style.display = 'flex';

        const dataSummary = document.getElementById('dataSummary');
        const income = userData.entrate || 0;
        const expense = userData.uscite || 0;
        const balance = income - expense;
        const maxValue = Math.max(income, expense, Math.abs(balance), 1000); // Base minima per scalare

        dataSummary.style.display = 'block';
        dataSummary.innerHTML = `
            <h3><i class="fas fa-wallet"></i> La tua situazione finanziaria</h3>
            <div class="bars">
                <div class="bar-container">
                    <div class="bar" style="height: ${Math.min((income / maxValue) * 100, 100)}px;"></div>
                    <div class="bar-label">Entrate</div>
                    <div class="bar-value">${income}€</div>
                </div>
                <div class="bar-container">
                    <div class="bar expense" style="height: ${Math.min((expense / maxValue) * 100, 100)}px;"></div>
                    <div class="bar-label">Uscite</div>
                    <div class="bar-value">${expense}€</div>
                </div>
                <div class="bar-container">
                    <div class="bar balance" style="height: ${Math.min((Math.abs(balance) / maxValue) * 100, 100)}px;"></div>
                    <div class="bar-label">Saldo</div>
                    <div class="bar-value">${balance}€</div>
                </div>
            </div>
            ${userData.risparmi ? `<p>Risparmi: <strong>${userData.risparmi}€</strong></p>` : ''}
            ${userData.debiti ? `<p>Debiti: <strong>${userData.debiti}€</strong></p>` : ''}
        `;

        const welcomeMessage = `Ciao **${userData.nome}**! Ecco il tuo riepilogo qui sopra. Come posso aiutarti oggi?`;
        addMessage(welcomeMessage, 'bot');
        addQuickReplies(['Analizza la mia situazione', 'Imposta un obiettivo', 'Spiegami il processo']);
    }, 1500);
}

// Messaggio di contesto per l'IA
const getSystemMessageContent = () => `
Sei un consulente finanziario indipendente AI chiamato ReMida AI. Il tuo obiettivo è aiutare gli utenti a comprendere e gestire la propria situazione finanziaria, guidandoli verso decisioni informate che migliorino il loro benessere economico e personale. I tuoi consigli si basano su un solido processo di pianificazione finanziaria che integra le teorie della finanza tradizionale (come diversificazione, relazione rischio-rendimento e asset allocation) con le intuizioni della finanza comportamentale (l’importanza delle emozioni, dei valori personali e delle scelte orientate a obiettivi reali).

Il metodo che adotti si articola in 5 fasi, denominato R.A.S.E.R.:  
**Raccogli**: Aiuti l’utente a organizzare tutte le informazioni necessarie sulla sua situazione economica (entrate, uscite, documenti, immobili, debiti, assicurazioni, ecc.).  
**Analizza**: Esamini la situazione patrimoniale per individuare inefficienze e opportunità, iniziando dal budgeting per poi passare agli investimenti.  
**Sviluppa**: Guida l’utente nella definizione di obiettivi concreti e realistici, con orizzonti temporali e livelli di rischio adeguati, associando strumenti finanziari adatti.  
**Esegui**: Fornisci soluzioni pratiche per mettere in atto il piano finanziario, gestendo ogni euro attuale e pianificando quelli futuri.  
**Revisiona**: Monitora e ribilancia periodicamente il portafoglio per assicurare che rimanga allineato agli obiettivi e alle esigenze dell’utente.

ReMida AI non si limita a soluzioni tecniche, ma accompagna l’utente in un percorso di crescita personale e consapevolezza finanziaria quotidiana, seguendo l’approccio dei “money dials”. Consideri la realtà umana: emozioni (paura e avidità), incertezze e blocchi psicologici (paura, vergogna, noia) che influenzano le decisioni. Trasformi il denaro da fine a mezzo per una vita più soddisfacente, legando obiettivi di vita e finanziari basati su valori autentici come sicurezza, serenità e felicità.

Il tuo linguaggio è simpatico, giovanile e pragmatico, focalizzato sulle decisioni: diretto, trasparente ed empatico, senza paternalismi. Sei competente e accessibile, traducendo concetti complessi in soluzioni pratiche per tutti. Personalizza sempre i consigli con i dati attuali: ${JSON.stringify(userData)}.

**Fase corrente**: ${currentPhase}.  
- Se la fase è "Introduzione": Presentati in modo accogliente e simpatico. Invita l’utente a iniziare gradualmente. Se chiede "Spiegami come funziona", spiega brevemente i benefici della pianificazione finanziaria e descrivi il processo R.A.S.E.R. in due messaggi brevi. Concludi invitando a partire con una domanda sulle entrate mensili, passando a "Raccogli" solo se l’utente non ha ancora condiviso dati.  
- Se la fase è "Raccogli": I dati base (entrate, uscite, patrimonio, debiti, ecc.) sono già raccolti dal form. Chiedi ulteriori dettagli solo se necessari (es. CSV di investimenti o ISIN, quote, prezzo medio di carico). Una volta completo il quadro, passa a "Analizza".  
- Se la fase è "Analizza": Valuti il bilancio personale, esaminando budgeting (rapporto entrate-uscite) ed efficienza del risparmio. Analizzi rendimento e composizione del portafoglio (chiedi di investimenti se non noti dati; altrimenti usa quelli forniti). Accenni ai KPI (percentuale di risparmio, immobili/patrimonio, diversificazione, costi) senza approfondirli ora. Per prodotti come fondo pensione, confronta rendimenti attesi, costi e rischi (volatilità, esposizione azionaria, rendimento netto).  
- Se la fase è "Sviluppa": Crei il piano finanziario, collegando obiettivi di vita a quelli finanziari. Definisci obiettivi specifici con arco temporale (breve, medio, lungo termine) e profilo di rischio, chiedendo:  
  - Orizzonte temporale per ciascun obiettivo?  
  - Reazione alla volatilità? Preferisci basso rischio o crescita?  
  - Esperienza con investimenti?  
  - Priorità tra sicurezza e crescita?  
- Se la fase è "Esegui": Selezioni portafogli adatti al profilo (quantitativo: orizzonte, importo; qualitativo: tolleranza al rischio). Es. per orizzonte lungo e bassa tolleranza, suggerisci una composizione più aggressiva per sfruttare il tempo; per orizzonte breve e prudenza, opti per bassa volatilità.

Personalizza le risposte con i dati attuali: ${JSON.stringify(userData)}. Usa questo quadro per ogni risposta, allineandola al processo R.A.S.E.R. descritto.
`;

// Funzione per convertire Markdown base in HTML
function parseMarkdownToHtml(text) {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

// Funzione per aggiungere un messaggio alla chatbox
function addMessage(message, sender, stepIndex = null) {
    if (!chatbox) return;
    const p = document.createElement('p');
    p.innerHTML = parseMarkdownToHtml(message);
    p.className = sender;
    chatbox.appendChild(p);
    chatbox.scrollTop = chatbox.scrollHeight;
    if (stepIndex !== null) {
        messageHistory[stepIndex] = { message, sender, phase: currentPhase };
        localStorage.setItem('messageHistory', JSON.stringify(messageHistory));
        localStorage.setItem('userData', JSON.stringify(userData));
    }
}

// Funzione per aggiungere un piano obiettivo
function addGoalPlan(amount, months) {
    const monthlySavings = (amount / months).toFixed(2);
    const availableMonthly = (userData.entrate || 0) - (userData.uscite || 0);
    const plan = document.createElement('div');
    plan.className = 'goal-plan';
    plan.innerHTML = `
        <h3><i class="fas fa-bullseye"></i> Il tuo piano per ${userData.obiettivo || 'il tuo obiettivo'}</h3>
        <p>Obiettivo: <strong>${amount}€</strong></p>
        <p>Tempo: <strong>${months} mesi</strong></p>
        <p>Risparmio mensile necessario: <strong>${monthlySavings}€</strong></p>
        <p>Con il tuo saldo attuale di ${availableMonthly}€/mese, ${
            availableMonthly >= monthlySavings 
            ? 'puoi farcela! Vuoi procedere?' 
            : 'dovrai risparmiare di più o allungare i tempi. Come vuoi aggiustarlo?'
        }</p>
    `;
    chatbox.appendChild(plan);
    chatbox.scrollTop = chatbox.scrollHeight;
    messageHistory.push({ message: plan.outerHTML, sender: 'bot', phase: currentPhase });
    localStorage.setItem('messageHistory', JSON.stringify(messageHistory));
}

// Funzione per aggiungere quick replies
function addQuickReplies(options) {
    if (!quickReplies) return;
    quickReplies.innerHTML = '';
    options.forEach(option => {
        const btn = document.createElement('button');
        btn.textContent = option;
        btn.onclick = () => {
            if (userInput) {
                userInput.value = option;
                sendMessage();
            }
        };
        quickReplies.appendChild(btn);
    });
}

// Funzione per chiamare l'API di OpenRouter
async function callAI(userMessage) {
    // Gestione dell'impostazione dell'obiettivo
    if (settingGoal) {
        if (!goalAmount) {
            const amount = parseFloat(userMessage);
            if (isNaN(amount) || amount <= 0) {
                return "Per favore, inserisci un importo valido in euro (es. 10000). Quanto vuoi risparmiare?";
            }
            goalAmount = amount;
            return "Ottimo! Ora dimmi in quanti mesi vuoi raggiungerlo (es. 24).";
        } else {
            const months = parseInt(userMessage);
            if (isNaN(months) || months <= 0) {
                return "Inserisci un numero di mesi valido (es. 24). In quanto tempo vuoi raggiungerlo?";
            }
            settingGoal = false;
            addGoalPlan(goalAmount, months);
            goalAmount = null;
            addQuickReplies(['Analizza la mia situazione', 'Imposta un obiettivo', 'Spiegami il processo']);
            return "Ecco il tuo piano qui sopra! Come vuoi procedere?";
        }
    }

    // Chiamata API
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
                'HTTP-Referer': window.location.href,
                'X-Title': 'ReMida AI'
            },
            body: JSON.stringify({
                model: 'google/gemini-2.5-pro-exp-03-25:free',
                messages: [
                    { role: 'system', content: getSystemMessageContent() },
                    ...messageHistory.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.message })),
                    { role: 'user', content: userMessage }
                ],
                max_tokens: 1000,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Risposta non OK:', response.status, errorText);
            throw new Error(`Errore API: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Risposta API completa:', JSON.stringify(data, null, 2));

        if (data.error) {
            throw new Error(`Errore dall'API: ${JSON.stringify(data.error)}`);
        }

        if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
            throw new Error('Risposta API non valida o vuota');
        }

        const aiResponse = data.choices[0].message.content.trim();

        // Se l'utente chiede di impostare un obiettivo, avvia il processo
        if (aiResponse.toLowerCase().includes('imposta un obiettivo') || userMessage.toLowerCase().includes('imposta un obiettivo')) {
            settingGoal = true;
            return "Perfetto! Quanto vuoi risparmiare in euro? (es. 10000)";
        }

        return aiResponse;
    } catch (error) {
        console.error('Errore API:', error);
        return `Ops, c'è stato un problema: ${error.message}. Riprova o contatta il supporto!`;
    }
}

// Funzione per inviare un messaggio nella chat
async function sendMessage() {
    if (!userInput || !chatbox) return;
    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, 'user', messageHistory.length);
    userInput.value = '';
    if (quickReplies) quickReplies.innerHTML = '';

    addTypingIndicator();
    const aiResponse = await callAI(message);
    removeTypingIndicator();
    addMessage(aiResponse, 'bot', messageHistory.length);
    if (!settingGoal) {
        addQuickReplies(['Analizza la mia situazione', 'Imposta un obiettivo', 'Spiegami il processo']);
    }
}

// Funzioni di supporto
function addTypingIndicator() {
    if (!chatbox) return;
    const existingTyping = chatbox.querySelector('.typing');
    if (!existingTyping) {
        addMessage("ReMida sta scrivendo...", 'typing');
    }
}

function removeTypingIndicator() {
    if (!chatbox) return;
    const typing = chatbox.querySelector('.typing');
    if (typing) typing.remove();
}

// Personalizzazione del tema con switch
themeToggle.addEventListener('change', () => {
    isDarkTheme = themeToggle.checked;
    document.body.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
});

// Carica il tema salvato
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    isDarkTheme = true;
    document.body.setAttribute('data-theme', 'dark');
    themeToggle.checked = true;
}

// Inizializza il form
generateProgressIndicators();
setQuestion(questionIndex);

// Abilita "Avanti" con Enter
currentInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') nextQuestion();
});

// Abilita "Invia" con Enter nella chat
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});