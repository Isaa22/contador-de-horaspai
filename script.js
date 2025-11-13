document.addEventListener('DOMContentLoaded', function() {
    const timesheetBody = document.getElementById('timesheetBody');
    const calculateBtn = document.getElementById('calculateBtn');
    const monthSelect = document.getElementById('monthSelect');
    const yearInput = document.getElementById('yearInput');
    
    const totalWorkedElement = document.getElementById('totalWorked');
    const totalOvertimeElement = document.getElementById('totalOvertime');
    const totalBreakElement = document.getElementById('totalBreak');
    const daysWorkedElement = document.getElementById('daysWorked');
    
    // Definir mês e ano atual
    const now = new Date();
    monthSelect.value = now.getMonth();
    yearInput.value = now.getFullYear();
    
    // Gerar a planilha com 30 dias
    generateTimesheet();
    
    // Event listeners
    calculateBtn.addEventListener('click', calculateTotals);
    monthSelect.addEventListener('change', generateTimesheet);
    yearInput.addEventListener('change', generateTimesheet);
    
    function generateTimesheet() {
        timesheetBody.innerHTML = '';
        const month = parseInt(monthSelect.value);
        const year = parseInt(yearInput.value);
        
        // Quantidade de dias no mês selecionado
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay();
            const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
            
            const row = document.createElement('tr');
            
            // Dia da semana
            const dayCell = document.createElement('td');
            dayCell.textContent = dayNames[dayOfWeek];
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                dayCell.style.backgroundColor = '#f8d7da';
            }
            row.appendChild(dayCell);
            
            // Data
            const dateCell = document.createElement('td');
            dateCell.textContent = `${day.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}`;
            row.appendChild(dateCell);
            
            // Campos de entrada de horários
            const timeInputs = ['start', 'lunchOut', 'lunchIn', 'end'];
            
            timeInputs.forEach(inputType => {
                const cell = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'time';
                input.id = `${inputType}-${day}`;
                input.addEventListener('change', calculateDayHours);
                cell.appendChild(input);
                row.appendChild(cell);
            });
            
            // Horas trabalhadas
            const workedCell = document.createElement('td');
            workedCell.id = `worked-${day}`;
            workedCell.textContent = '00:00';
            row.appendChild(workedCell);
            
            // Horas extras
            const overtimeCell = document.createElement('td');
            overtimeCell.id = `overtime-${day}`;
            overtimeCell.textContent = '00:00';
            row.appendChild(overtimeCell);
            
            timesheetBody.appendChild(row);
        }
        
        // Recalcular totais após gerar a planilha
        calculateTotals();
    }
    
    function calculateDayHours() {
        const day = this.id.split('-')[1];
        const startTime = document.getElementById(`start-${day}`).value;
        const lunchOutTime = document.getElementById(`lunchOut-${day}`).value;
        const lunchInTime = document.getElementById(`lunchIn-${day}`).value;
        const endTime = document.getElementById(`end-${day}`).value;
        
        if (startTime && lunchOutTime && lunchInTime && endTime) {
            // Calcular horas trabalhadas
            const start = timeToMinutes(startTime);
            const lunchOut = timeToMinutes(lunchOutTime);
            const lunchIn = timeToMinutes(lunchInTime);
            const end = timeToMinutes(endTime);
            
            // Horas de trabalho (manhã + tarde)
            const morningHours = lunchOut - start;
            const afternoonHours = end - lunchIn;
            const totalMinutes = morningHours + afternoonHours;
            
            // Horas de descanso (almoço)
            const breakMinutes = lunchIn - lunchOut;
            
            // Converter para formato HH:MM
            const workedHours = Math.floor(totalMinutes / 60);
            const workedMinutes = totalMinutes % 60;
            const workedFormatted = `${workedHours.toString().padStart(2, '0')}:${workedMinutes.toString().padStart(2, '0')}`;
            
            // Calcular horas extras (considerando jornada de 8h = 480 minutos)
            const regularWorkMinutes = 480; // 8 horas
            const overtimeMinutes = Math.max(0, totalMinutes - regularWorkMinutes);
            const overtimeHours = Math.floor(overtimeMinutes / 60);
            const overtimeMinutesRemainder = overtimeMinutes % 60;
            const overtimeFormatted = `${overtimeHours.toString().padStart(2, '0')}:${overtimeMinutesRemainder.toString().padStart(2, '0')}`;
            
            // Atualizar células
            document.getElementById(`worked-${day}`).textContent = workedFormatted;
            document.getElementById(`overtime-${day}`).textContent = overtimeFormatted;
            
            // Recalcular totais
            calculateTotals();
        }
    }
    
    function calculateTotals() {
        let totalWorkedMinutes = 0;
        let totalOvertimeMinutes = 0;
        let totalBreakMinutes = 0;
        let daysWorked = 0;
        
        const month = parseInt(monthSelect.value);
        const year = parseInt(yearInput.value);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        for (let day = 1; day <= daysInMonth; day++) {
            const startTime = document.getElementById(`start-${day}`).value;
            const lunchOutTime = document.getElementById(`lunchOut-${day}`).value;
            const lunchInTime = document.getElementById(`lunchIn-${day}`).value;
            const endTime = document.getElementById(`end-${day}`).value;
            
            if (startTime && lunchOutTime && lunchInTime && endTime) {
                daysWorked++;
                
                // Calcular horas trabalhadas
                const start = timeToMinutes(startTime);
                const lunchOut = timeToMinutes(lunchOutTime);
                const lunchIn = timeToMinutes(lunchInTime);
                const end = timeToMinutes(endTime);
                
                // Horas de trabalho (manhã + tarde)
                const morningHours = lunchOut - start;
                const afternoonHours = end - lunchIn;
                const totalMinutes = morningHours + afternoonHours;
                
                // Horas de descanso (almoço)
                const breakMinutes = lunchIn - lunchOut;
                
                totalWorkedMinutes += totalMinutes;
                totalBreakMinutes += breakMinutes;
                
                // Calcular horas extras (considerando jornada de 8h = 480 minutos)
                const regularWorkMinutes = 480;
                const overtimeMinutes = Math.max(0, totalMinutes - regularWorkMinutes);
                totalOvertimeMinutes += overtimeMinutes;
            }
        }
        
        // Atualizar totais na interface
        totalWorkedElement.textContent = formatMinutesToTime(totalWorkedMinutes);
        totalOvertimeElement.textContent = formatMinutesToTime(totalOvertimeMinutes);
        totalBreakElement.textContent = formatMinutesToTime(totalBreakMinutes);
        daysWorkedElement.textContent = daysWorked;
    }
    
    function timeToMinutes(timeString) {
        if (!timeString) return 0;
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    }
    
    function formatMinutesToTime(totalMinutes) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
});
