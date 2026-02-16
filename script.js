// Initialize data structure
let timesheetData = JSON.parse(localStorage.getItem('timesheetData')) || [];

// Set today's date as default
document.getElementById('work-date').valueAsDate = new Date();

// Form submission handler
document.getElementById('timesheet-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const date = document.getElementById('work-date').value;
    const startTime = document.getElementById('start-time').value;
    const endTime = document.getElementById('end-time').value;
    
    // Calculate hours in decimal format
    const hours = calculateHours(startTime, endTime);
    
    if (hours <= 0) {
        alert('End time must be after start time!');
        return;
    }
    
    // Add entry to data
    const entry = {
        id: Date.now(),
        date: date,
        startTime: startTime,
        endTime: endTime,
        hours: hours
    };
    
    timesheetData.push(entry);
    saveData();
    
    // Reset form
    document.getElementById('start-time').value = '';
    document.getElementById('end-time').value = '';
    document.getElementById('work-date').valueAsDate = new Date();
    
    // Refresh display
    populatePeriodSelector();
    displayEntries();
    
    // Show success feedback
    showNotification('Entry added successfully!');
});

function calculateHours(start, end) {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    const diffMinutes = endMinutes - startMinutes;
    return Math.round((diffMinutes / 60) * 100) / 100; // Round to 2 decimals
}

function saveData() {
    localStorage.setItem('timesheetData', JSON.stringify(timesheetData));
}

function getPayPeriod(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    
    // Pay period: 21st of one month to 20th of next month
    if (day >= 21) {
        const nextMonth = month === 11 ? 0 : month + 1;
        const nextYear = month === 11 ? year + 1 : year;
        return `${year}-${String(month + 1).padStart(2, '0')}-21_${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-20`;
    } else {
        const prevMonth = month === 0 ? 11 : month - 1;
        const prevYear = month === 0 ? year - 1 : year;
        return `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-21_${year}-${String(month + 1).padStart(2, '0')}-20`;
    }
}

function formatPeriodLabel(period) {
    const [start, end] = period.split('_');
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return `${months[startDate.getMonth()]} ${startDate.getDate()} - ${months[endDate.getMonth()]} ${endDate.getDate()}, ${endDate.getFullYear()}`;
}

function populatePeriodSelector() {
    const periods = [...new Set(timesheetData.map(entry => getPayPeriod(entry.date)))];
    periods.sort().reverse();
    
    const select = document.getElementById('period-select');
    const currentSelection = select.value;
    
    select.innerHTML = '';
    
    if (periods.length === 0) {
        const option = document.createElement('option');
        option.value = 'current';
        option.textContent = 'Current Period';
        select.appendChild(option);
    } else {
        periods.forEach(period => {
            const option = document.createElement('option');
            option.value = period;
            option.textContent = formatPeriodLabel(period);
            select.appendChild(option);
        });
    }
    
    // Restore selection or select first
    if (currentSelection && periods.includes(currentSelection)) {
        select.value = currentSelection;
    }
    
    select.addEventListener('change', displayEntries);
}

function displayEntries() {
    const selectedPeriod = document.getElementById('period-select').value;
    const filteredEntries = selectedPeriod === 'current' 
        ? timesheetData 
        : timesheetData.filter(entry => getPayPeriod(entry.date) === selectedPeriod);
    
    // Sort by date descending
    filteredEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const entriesList = document.getElementById('entries-list');
    
    if (filteredEntries.length === 0) {
        entriesList.innerHTML = '<div class="empty-state"><p>No entries yet. Add your first work day!</p></div>';
        document.getElementById('total-hours').textContent = '0h';
        document.getElementById('days-worked').textContent = '0';
        return;
    }
    
    // Calculate totals
    const totalHours = filteredEntries.reduce((sum, entry) => sum + entry.hours, 0);
    document.getElementById('total-hours').textContent = `${totalHours.toFixed(2)}h`;
    document.getElementById('days-worked').textContent = filteredEntries.length;
    
    // Display entries
    entriesList.innerHTML = filteredEntries.map(entry => `
        <div class="entry-item">
            <div class="entry-info">
                <div class="entry-date">${formatDate(entry.date)}</div>
                <div class="entry-time">${entry.startTime} - ${entry.endTime}</div>
            </div>
            <div class="entry-hours">${entry.hours.toFixed(2)}h</div>
            <button class="btn-delete" onclick="deleteEntry(${entry.id})">Delete</button>
        </div>
    `).join('');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function deleteEntry(id) {
    if (confirm('Are you sure you want to delete this entry?')) {
        timesheetData = timesheetData.filter(entry => entry.id !== id);
        saveData();
        populatePeriodSelector();
        displayEntries();
        showNotification('Entry deleted');
    }
}

function exportAsText() {
    const selectedPeriod = document.getElementById('period-select').value;
    const filteredEntries = selectedPeriod === 'current' 
        ? timesheetData 
        : timesheetData.filter(entry => getPayPeriod(entry.date) === selectedPeriod);
    
    if (filteredEntries.length === 0) {
        alert('No entries to export!');
        return;
    }
    
    // Group by work periods (consecutive days or same dates in note format)
    filteredEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let text = '';
    let currentGroup = [];
    
    filteredEntries.forEach((entry, index) => {
        currentGroup.push(entry);
        
        // Check if next entry is not consecutive or is last entry
        const isLastEntry = index === filteredEntries.length - 1;
        const nextEntry = filteredEntries[index + 1];
        const currentDate = new Date(entry.date);
        const nextDate = nextEntry ? new Date(nextEntry.date) : null;
        
        const shouldEndGroup = isLastEntry || 
            !nextDate || 
            (nextDate - currentDate) > (24 * 60 * 60 * 1000 * 2); // More than 2 days gap
        
        if (shouldEndGroup) {
            // Format group
            const startDate = new Date(currentGroup[0].date);
            const endDate = new Date(currentGroup[currentGroup.length - 1].date);
            
            const formatShortDate = (d) => `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
            
            text += `${formatShortDate(startDate)} - ${formatShortDate(endDate)}:\n`;
            
            currentGroup.forEach(e => {
                const date = new Date(e.date);
                text += `${formatShortDate(date)}: ${e.startTime} - ${e.endTime}\n`;
            });
            
            text += '\n\n';
            currentGroup = [];
        }
    });
    
    // Add total
    const totalHours = filteredEntries.reduce((sum, entry) => sum + entry.hours, 0);
    text += `Total Hours: ${totalHours.toFixed(2)}h`;
    
    downloadFile(`timesheet_${selectedPeriod}.txt`, text);
    showNotification('Exported as text!');
}

function exportAsExcel() {
    const selectedPeriod = document.getElementById('period-select').value;
    const filteredEntries = selectedPeriod === 'current' 
        ? timesheetData 
        : timesheetData.filter(entry => getPayPeriod(entry.date) === selectedPeriod);
    
    if (filteredEntries.length === 0) {
        alert('No entries to export!');
        return;
    }
    
    filteredEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Create CSV content
    let csv = 'Date,Day,Month,Time (from - to),Hours\n';
    
    filteredEntries.forEach(entry => {
        const date = new Date(entry.date);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        csv += `${entry.date},${day},${month},${entry.startTime} - ${entry.endTime},${entry.hours.toFixed(2)}\n`;
    });
    
    // Add total
    const totalHours = filteredEntries.reduce((sum, entry) => sum + entry.hours, 0);
    csv += `\n,,,Total,${totalHours.toFixed(2)}`;
    
    downloadFile(`timesheet_${selectedPeriod}.csv`, csv);
    showNotification('Exported as Excel (CSV)!');
}

function exportAsJSON() {
    const data = {
        exportDate: new Date().toISOString(),
        entries: timesheetData
    };
    
    downloadFile('timesheet_backup.json', JSON.stringify(data, null, 2));
    showNotification('Exported as JSON!');
}

function importFromJSON() {
    document.getElementById('import-file').click();
}

document.getElementById('import-file').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const data = JSON.parse(event.target.result);
            
            if (!data.entries || !Array.isArray(data.entries)) {
                alert('Invalid JSON format!');
                return;
            }
            
            if (confirm(`Import ${data.entries.length} entries? This will merge with existing data.`)) {
                // Merge entries, avoiding duplicates by ID
                const existingIds = new Set(timesheetData.map(e => e.id));
                const newEntries = data.entries.filter(e => !existingIds.has(e.id));
                
                timesheetData = [...timesheetData, ...newEntries];
                saveData();
                populatePeriodSelector();
                displayEntries();
                showNotification(`Imported ${newEntries.length} entries!`);
            }
        } catch (error) {
            alert('Error reading JSON file!');
        }
    };
    reader.readAsText(file);
    
    // Reset input
    e.target.value = '';
});

function clearAllData() {
    if (confirm('Are you sure you want to delete ALL timesheet data? This cannot be undone!')) {
        if (confirm('Really delete everything? Consider exporting first!')) {
            timesheetData = [];
            saveData();
            populatePeriodSelector();
            displayEntries();
            showNotification('All data cleared');
        }
    }
}

function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function showNotification(message) {
    // Simple notification - could be enhanced with a toast library
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2ECC71;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2500);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize on page load
populatePeriodSelector();
displayEntries();