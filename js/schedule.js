// client/js/schedule.js

function gerarHorarios() {
    const hoje = new Date();
    const diaSemana = hoje.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    let horarios = [];

    if (diaSemana >= 1 && diaSemana <= 5) {
        // Segunda a Sexta (7:00h - 18:00h)
        for (let hora = 7; hora <= 17; hora++) {
            horarios.push(`${hora}:00 - ${hora + 1}:00`);
        }
    } else if (diaSemana === 0) {
        // Domingo (8:00h - 12:00h)
        for (let hora = 8; hora <= 11; hora++) {
            horarios.push(`${hora}:00 - ${hora + 1}:00`);
        }
    }

    // Adiciona os horários à div de horários
    const divHorarios = document.getElementById('horarios');
    divHorarios.innerHTML = ''; // Limpa os horários anteriores
    horarios.forEach(horario => {
        const horarioDiv = document.createElement('div');
        horarioDiv.innerText = horario;
        divHorarios.appendChild(horarioDiv);
    });
}

// Gera os horários ao carregar a página
window.onload = gerarHorarios;

