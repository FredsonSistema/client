const API_URL = 'http://138.204.143.189/api/appointments'; // Substitua pela URL correta se necessário

// Função para fazer login
async function loginUser(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        const user = await response.json();
        if (user.username === 'admin' || user.username === 'root') {
            window.location.href = 'admin-dashboard.html'; // Redireciona para o admin dashboard
        } else {
            window.location.href = 'dashboard.html'; // Redireciona para o dashboard normal
        }
    } else {
        const error = await response.json();
        alert(error.message);
    }
}

// Função para realizar logout
function logout() {
    localStorage.removeItem('token'); // Remove o token do localStorage
    window.location.href = 'login.html'; // Redireciona para a página de login
}

// Função para buscar e exibir todos os agendamentos
async function fetchAppointments() {
    const response = await fetch(`${API_URL}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (response.ok) {
        const appointments = await response.json();
        console.log(appointments);

        displayAppointments(appointments); displayAppointments(appointments); // Atualiza a lista de agendamentos
    } else {
        console.error('Erro ao buscar agendamentos:', response.statusText);
    }
}

// Função para exibir os agendamentos na tela
function displayAppointments(appointments) {
    const appointmentsContainer = document.getElementById('appointments');
    appointmentsContainer.innerHTML = ''; // Limpar o conteúdo anterior

    if (appointments.length === 0) {
        appointmentsContainer.innerHTML = '<p>Nenhum agendamento encontrado.</p>';
        return;
    }
    appointments.forEach(appointment => {
        const appointmentDiv = document.createElement('div');
        appointmentDiv.classList.add('appointment');

        appointmentDiv.innerHTML = `
            <p><strong>Serviço:</strong> ${appointment.serviceType}</p>
            <p><strong>Data e Hora:</strong> ${new Date(appointment.dateTime).toLocaleString()}</p>
            <p><strong>Usuário:</strong> ${appointment.username}</p> <!-- Mostra o nome do usuário -->
            <button onclick="editAppointment('${appointment._id}')">Editar</button>
            <button onclick="deleteAppointment('${appointment._id}')">Excluir</button>
        `;

        appointmentsContainer.appendChild(appointmentDiv);
    });
}
// Função para validar o horário do agendamento
function validateAppointmentDate(dateTime) {
    const now = new Date();
    const appointmentDate = new Date(dateTime);
    
    // Verifica se a data do agendamento é no futuro
    if (appointmentDate <= now) {
        alert('Por favor, selecione um horário futuro para o agendamento.');
        return false;
    }
    return true;
}

// Função para criar um novo agendamento
async function createAppointment() {
    const serviceType = document.getElementById('serviceType').value;
    const date = document.getElementById('appointmentDate').value;
    const time = document.getElementById('appointmentTime').value;
    const targetUsername = document.getElementById('username').value;
    

    if (date && time && serviceType && targetUsername) {
        const dateTime = new Date(`${date}T${time}:00`); // Combina a data e hora

        

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ serviceType, dateTime, targetUsername }) // Incluindo o nome do usuário
            });

            if (response.ok) {
                alert('Agendamento criado com sucesso!');
                fetchAppointments(); // Atualiza a lista de agendamentos
            } else {
                const errorData = await response.json();
                alert(`Erro ao criar agendamento: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Erro ao criar agendamento:', error);
        }
    } else {
        alert('Data, hora, serviço e nome do usuário são obrigatórios!');
    }
}





// Função para editar um agendamento
async function editAppointment(appointmentId) {
    const newServiceType = prompt('Digite o novo tipo de serviço:');
    const date = prompt('Escolha a nova data (YYYY-MM-DD):'); // Data em formato YYYY-MM-DD
    const time = prompt('Escolha a nova hora (HH:MM):'); // Hora em formato HH:MM

    if (newServiceType && date && time) {
        const newDateTime = new Date(`${date}T${time}:00`);

        try {
            const response = await fetch(`${API_URL}/${appointmentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    serviceType: newServiceType,
                    dateTime: newDateTime
                })
            });

            if (response.ok) {
                alert('Agendamento atualizado com sucesso!');
                fetchAppointments(); // Atualiza a lista de agendamentos
            } else {
                const errorData = await response.json();
                alert(`Erro ao atualizar agendamento: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Erro ao atualizar agendamento:', error);
        }
    } else {
        alert('Tipo de serviço, data e hora são obrigatórios para edição!');
    }
}


// Função para excluir um agendamento
async function deleteAppointment(appointmentId) {
    const confirmDelete = confirm('Tem certeza que deseja excluir este agendamento?');

    if (confirmDelete) {
        try {
            const response = await fetch(`${API_URL}/${appointmentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                alert('Agendamento excluído com sucesso!');
                fetchAppointments(); // Atualiza a lista de agendamentos
            } else {
                const errorData = await response.json();
                alert(`Erro ao excluir agendamento: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Erro ao excluir agendamento:', error);
        }
    }
}

// Chamar a função para buscar agendamentos ao carregar a página
fetchAppointments();


// Função para buscar agendamentos pelo nome do usuário
async function searchAppointmentByUsername() {
    const username = document.getElementById('searchUsername').value;

    if (!username) {
        alert('Por favor, insira o nome do usuário para a busca.');
        return;
    }

    try {
        const response = await fetch(`${API_URL}?username=${username}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const appointments = await response.json();
            
            if (appointments.length === 0) {
                alert('Nenhum agendamento encontrado para o usuário informado.');
            } else {
                displayAppointments(appointments); // Atualiza a exibição dos agendamentos encontrados
            }
        } else {
            alert('Erro ao buscar agendamentos.');
        }
    } catch (error) {
        console.error('Erro ao buscar agendamentos:', error);
        alert('Erro ao buscar agendamentos. Por favor, tente novamente.');
    }
}
// /client/js/admin-app.js
async function fetchAnalytics() {
    const response = await fetch('/api/reports/analytics', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    
    if (!response.ok) {
        console.error('Erro ao buscar análises');
        return;
    }
    
    const data = await response.json();
    
    // Formatar e exibir análises no painel
    const dailyAppointmentsHtml = data.dailyAppointments.map(item => `
        <li>${item._id}: ${item.count} agendamento(s)</li>
    `).join('');
    
    const popularServicesHtml = data.popularServices.map(item => `
        <li>${item._id}: ${item.count} agendamento(s)</li>
    `).join('');
    
    document.getElementById('analytics').innerHTML = `
        <h2>Análises de Agendamentos</h2>
        <h3>Agendamentos por Dia:</h3>
        <ul>${dailyAppointmentsHtml}</ul>
        <h3>Serviços Mais Populares:</h3>
        <ul>${popularServicesHtml}</ul>
    `;
}

// Chama a função para buscar análises ao carregar a página
fetchAnalytics();

// Função para inicializar o calendário
function initializeCalendar(appointments) {
    const events = appointments.map(appointment => ({
        title: appointment.serviceType,
        start: appointment.dateTime,
        id: appointment._id
    }));

    $('#calendar').fullCalendar({
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay'
        },
        defaultDate: new Date(),
        editable: true,
        eventLimit: true, // permite que eventos múltiplos em um dia sejam mostrados
        events: events,
        eventClick: function(event) {
            if (event) {
                const confirmDelete = confirm(`Deseja excluir o agendamento "${event.title}"?`);
                if (confirmDelete) {
                    deleteAppointment(event.id); // Chama a função para excluir o agendamento
                }
            }
        }
    });
}
