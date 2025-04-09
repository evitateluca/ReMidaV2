// Carica i dati utente da localStorage
const userData = JSON.parse(localStorage.getItem('userData')) || {
    entrate: 0,
    uscite: 0,
    patrimonio: { contoCorrente: 0, immobili: 0, obbligazioni: 0 },
    debiti: 0,
    risparmi: 0
};

// Tema
const themeToggle = document.getElementById('themeToggle');
let isDarkTheme = localStorage.getItem('theme') === 'dark';
if (isDarkTheme) {
    document.body.setAttribute('data-theme', 'dark');
    themeToggle.checked = true;
}
themeToggle.addEventListener('change', () => {
    isDarkTheme = themeToggle.checked;
    document.body.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
    updateChartColors();
});

// Funzione per aggiornare i colori dei grafici
function updateChartColors() {
    const colors = isDarkTheme ? {
        income: '#34c759',
        expense: '#ff6b6b',
        balance: '#4a90e2',
        savings: '#f1c40f',
        debt: '#e74c3c',
        account: '#4a90e2',
        realEstate: '#e67e22',
        bonds: '#9b59b6'
    } : {
        income: '#34c759',
        expense: '#ff6b6b',
        balance: '#4a90e2',
        savings: '#f1c40f',
        debt: '#e74c3c',
        account: '#4a90e2',
        realEstate: '#e67e22',
        bonds: '#9b59b6'
    };

    financeChart.data.datasets[0].backgroundColor = [colors.income, colors.expense, colors.balance, colors.savings, colors.debt];
    assetChart.data.datasets[0].backgroundColor = [colors.account, colors.realEstate, colors.bonds];
    savingsDebtChart.data.datasets[0].backgroundColor = [colors.savings];
    savingsDebtChart.data.datasets[1].backgroundColor = [colors.debt];
    financeChart.update();
    assetChart.update();
    savingsDebtChart.update();
}

// Grafico Riepilogo Finanziario
const financeCtx = document.getElementById('financeChart').getContext('2d');
let financeChart = new Chart(financeCtx, {
    type: 'bar',
    data: {
        labels: ['Entrate', 'Uscite', 'Saldo', 'Risparmi', 'Debiti'],
        datasets: [{
            label: 'Finanze (€)',
            data: [
                userData.entrate || 0,
                userData.uscite || 0,
                (userData.entrate || 0) - (userData.uscite || 0),
                userData.risparmi || 0,
                userData.debiti || 0
            ],
            backgroundColor: ['#34c759', '#ff6b6b', '#4a90e2', '#f1c40f', '#e74c3c'],
            borderWidth: 2,
            borderColor: isDarkTheme ? '#2e4066' : '#ffffff',
            borderRadius: 10,
            barThickness: 40
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false, // Permette al grafico di adattarsi all'altezza del contenitore
        animation: { duration: 1000, easing: 'easeOutBounce' },
        scales: {
            y: { beginAtZero: true, grid: { color: isDarkTheme ? '#3e4e6d' : '#e0e6ed' }, ticks: { color: isDarkTheme ? '#e0e6ed' : '#1a2b3c', font: { size: 14, weight: '500' } } },
            x: { grid: { display: false }, ticks: { color: isDarkTheme ? '#e0e6ed' : '#1a2b3c', font: { size: 14, weight: '600' } } }
        },
        plugins: {
            legend: { display: false },
            tooltip: { backgroundColor: isDarkTheme ? '#2e4066' : '#ffffff', titleColor: isDarkTheme ? '#e0e6ed' : '#1a2b3c', bodyColor: isDarkTheme ? '#e0e6ed' : '#1a2b3c', borderWidth: 1, borderColor: isDarkTheme ? '#3e4e6d' : '#e0e6ed' }
        }
    }
});

// Grafico Composizione Patrimonio (blurred)
const assetCtx = document.getElementById('assetChart').getContext('2d');
let assetChart = new Chart(assetCtx, {
    type: 'doughnut',
    data: {
        labels: ['Conto Corrente', 'Immobili', 'Obbligazioni'],
        datasets: [{
            data: [
                userData.patrimonio.contoCorrente || 0,
                userData.patrimonio.immobili || 0,
                userData.patrimonio.obbligazioni || 0
            ],
            backgroundColor: ['#4a90e2', '#e67e22', '#9b59b6'],
            borderWidth: 2,
            borderColor: isDarkTheme ? '#2e4066' : '#ffffff'
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false, // Adatta al contenitore
        animation: { duration: 1000, easing: 'easeInOutQuart' },
        plugins: {
            legend: { position: 'bottom', labels: { color: isDarkTheme ? '#e0e6ed' : '#1a2b3c', font: { size: 14, weight: '500' } } },
            tooltip: { enabled: false }
        },
        cutout: '60%'
    }
});

// Grafico Risparmi vs Debiti
const savingsDebtCtx = document.getElementById('savingsDebtChart').getContext('2d');
let savingsDebtChart = new Chart(savingsDebtCtx, {
    type: 'bar',
    data: {
        labels: ['Risparmi', 'Debiti'],
        datasets: [
            { label: 'Risparmi', data: [userData.risparmi || 0], backgroundColor: ['#f1c40f'], borderWidth: 2, borderColor: isDarkTheme ? '#2e4066' : '#ffffff', borderRadius: 10, barThickness: 40 },
            { label: 'Debiti', data: [userData.debiti || 0], backgroundColor: ['#e74c3c'], borderWidth: 2, borderColor: isDarkTheme ? '#2e4066' : '#ffffff', borderRadius: 10, barThickness: 40 }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false, // Adatta al contenitore
        animation: { duration: 1000, easing: 'easeOutBounce' },
        scales: {
            y: { beginAtZero: true, grid: { color: isDarkTheme ? '#3e4e6d' : '#e0e6ed' }, ticks: { color: isDarkTheme ? '#e0e6ed' : '#1a2b3c', font: { size: 14, weight: '500' } } },
            x: { grid: { display: false }, ticks: { color: isDarkTheme ? '#e0e6ed' : '#1a2b3c', font: { size: 14, weight: '600' } } }
        },
        plugins: {
            legend: { display: false },
            tooltip: { backgroundColor: isDarkTheme ? '#2e4066' : '#ffffff', titleColor: isDarkTheme ? '#e0e6ed' : '#1a2b3c', bodyColor: isDarkTheme ? '#e0e6ed' : '#1a2b3c', borderWidth: 1, borderColor: isDarkTheme ? '#3e4e6d' : '#e0e6ed' }
        }
    }
});

// Modali
document.querySelectorAll('.sidebar-title').forEach(title => {
    title.addEventListener('click', () => {
        const modalId = title.getAttribute('data-modal');
        const modal = document.getElementById(modalId);
        modal.style.display = 'block';
    });
});

document.querySelectorAll('.close-modal').forEach(close => {
    close.addEventListener('click', () => {
        close.parentElement.parentElement.style.display = 'none';
    });
});

window.addEventListener('click', (event) => {
    document.querySelectorAll('.modal').forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Calcolatore PAC
document.getElementById('calculatePac').addEventListener('click', () => {
    const amount = parseFloat(document.getElementById('pacAmount').value) || 0;
    const years = parseInt(document.getElementById('pacYears').value) || 0;
    const rate = parseFloat(document.getElementById('pacRate').value) || 0;

    if (amount <= 0 || years <= 0 || rate < 0) {
        document.getElementById('pacResult').innerHTML = '<span style="color: #ff6b6b;">Inserisci valori validi!</span>';
        return;
    }

    const months = years * 12;
    const monthlyRate = rate / 100 / 12;
    const futureValue = amount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    const totalInvested = amount * months;

    document.getElementById('pacResult').innerHTML = `
        <p>Valore futuro: <strong>${futureValue.toFixed(2)}€</strong></p>
        <p>Totale investito: <strong>${totalInvested.toFixed(2)}€</strong></p>
        <p>Guadagno: <strong>${(futureValue - totalInvested).toFixed(2)}€</strong></p>
    `;
});