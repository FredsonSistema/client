///////////!!!!!!!!!!!!!!!!!!!!   FILÉ  COM HORARIOS  AJUSTTADOS !!!!!!!!!/////////////
//////////////////////////////FILÉ COM HORARIOS AJUSTADOS E INDISPONIBILIDADE DA HORA USADA//////////////////

// Definir uma única URL pública para o backend
const API_URL = 'https://seu-backend-publico.com/api'; // Substitua pela URL pública do backend

// Função para verificar a URL atual
function isDashboardPage() {
    return window.location.pathname.includes('dashboard.html');
}

// Função para gerar horários fixos
function generateTimeSlots(date, occupiedSlots) {
    const slots = [];
    const day = new Date(date).getDay(); // Obtém o dia da semana (===6 = domingo, >=0 & <=5 = segunda a sabado)

    // Horários disponíveis
    if (day === 6) { // Domingo
        // Horários de 8:00 às 12:00
        for (let hour = 8; hour < 12; hour++) {
            const slot = `${hour.toString().padStart(2, '0')}:00`;
            if (!occupiedSlots.includes(slot)) slots.push(slot);
        }
    } else if (day >= 0 & day <= 5) { // Segunda a sexta (1 a 5)
        // Horários de 7:00 às 18:00
        for (let hour = 7; hour < 19; hour++) { // 19 é exclusivo
            const slot = `${hour.toString().padStart(2, '0')}:00`;
            if (!occupiedSlots.includes(slot)) slots.push(slot);
        }
    }

    return slots;
}

async function updateTimeSlots() {
    const dateInput = document.getElementById('date');
    const timeSlotSelect = document.getElementById('timeSlot');

    const selectedDate = dateInput.value;
    timeSlotSelect.innerHTML = ''; // Limpar horários anteriores

    if (selectedDate) {
        const token = localStorage.getItem('token');

        // Obter agendamentos existentes para o dia selecionado
        try {
            const response = await fetch(`${API_URL}/appointments?date=${selectedDate}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            let occupiedSlots = [];
            if (response.ok) {
                const appointments = await response.json();
                occupiedSlots = appointments.map(appointment => {
                    const dateTime = new Date(appointment.dateTime);
                    return dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                });
            }

            // Gerar novos slots com base nos horários ocupados
            const timeSlots = generateTimeSlots(selectedDate, occupiedSlots);
            timeSlots.forEach(slot => {
                const option = document.createElement('option');
                option.value = slot;
                option.textContent = slot;
                timeSlotSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar agendamentos:', error);
            alert('Erro ao carregar horários ocupados');
        }
    }
}

// Registro de usuários
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value; // Campo de email
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        if (response.ok) {
            alert('Usuário registrado com sucesso');
            window.location.href = 'login.html'; // Redireciona para login
        } else {
            const errorData = await response.json();
            alert(`Erro ao registrar o usuário: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Erro ao registrar o usuário:', error);
        alert('Erro ao conectar ao servidor');
    }
});

// Login de usuários
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Lógica para autenticar o usuário
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);

        // Verificar se o usuário é admin
        if (username === 'admin' || username === 'root') {
            window.location.href = 'admin-dashboard.html'; // Redirecionar para o painel do administrador
        } else {
            window.location.href = 'dashboard.html'; // Redirecionar para o painel do usuário normal
        }
    } else {
        const error = await response.json();
        alert(error.message);
    }
});

// Painel de Controle - só executa se estiver no dashboard e se o usuário tiver token
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');

    if (!isDashboardPage() || !token) return; // Executa apenas no dashboard e se o token estiver presente

    // Adiciona o listener ao campo de data
    document.getElementById('date')?.addEventListener('change', updateTimeSlots);

    // Carrega os agendamentos existentes
    try {
        const response = await fetch(`${API_URL}/appointments`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro na requisição dos agendamentos');
        }

        const appointments = await response.json();
        console.log("Agendamentos carregados:", appointments); // Depuração
        const appointmentsDiv = document.getElementById('appointments');

        if (appointments.length === 0) {
            appointmentsDiv.innerHTML = '<p>Você ainda não fez seu Agendamento, Por favor! Agende seu Serviço.</p>';
            return;
        } else {
            appointmentsDiv.innerHTML = appointments.map(appointment => `
                <div>
                    <p>${appointment.serviceType} - ${new Date(appointment.dateTime).toLocaleString()}</p>
                    <button onclick="rescheduleAppointment('${appointment._id}')">Remarcar</button>
                    <button onclick="cancelAppointment('${appointment._id}')">Cancelar</button>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Erro ao carregar os agendamentos:', error); // Depuração
        alert('Erro ao carregar os agendamentos');
    }
});
