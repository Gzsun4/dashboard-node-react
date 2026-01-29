/**
 * Formats a date string into a user-friendly format.
 * Examples: 
 * "Hoy 1:14 pm"
 * "Ayer 9:05 pm"
 * "26 ene. 2026 - 8:08 pm"
 */
export const formatDateFriendly = (dateString, timeString = null) => {
    if (!dateString) return '';

    // Create date object. careful with timezones, usually split YYYY-MM-DD
    // If dateString includes time, use it. If not, and no timeString, default to noon or keep as is.
    // Assuming dateString is "YYYY-MM-DD" from the previous context.

    // We'll construct a date at a neutral time if only date is provided, 
    // BUT the user wants to show time. 
    // If the backend doesn't provide time, we can't show it accurately.
    // Looking at the code, Expenses.jsx uses `newExpense.date` which is likely just a date input.
    // If the data doesn't have time, we might skip the time part or mock it if strictly requested 
    // (though mocking is bad practice).
    // The user's screenshot has time. 
    // IF the data is just YYYY-MM-DD, we can only show the date.
    // However, the request explicitly asked for time. 
    // I will check if I can get a timestamp. 
    // For now, I will format the DATE part nicely to "Hoy" / "Ayer".
    // If there is no time info in the DB, I will just show the date.

    let date;
    if (dateString.includes('T') || dateString.includes(':')) {
        // Full ISO or with time, parse normally
        date = new Date(dateString);
    } else {
        // Just YYYY-MM-DD, parse as local to avoid UTC shift
        const [year, month, day] = dateString.split('-').map(Number);
        date = new Date(year, month - 1, day);
    }

    const now = new Date();

    // Reset hours to compare just dates (using local time)
    const d = new Date(date); d.setHours(0, 0, 0, 0);
    const n = new Date(now); n.setHours(0, 0, 0, 0);

    const diffTime = n - d;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let dayLabel = '';
    if (diffDays === 0) dayLabel = 'Hoy';
    else if (diffDays === 1) dayLabel = 'Ayer';
    else {
        // Format: 26 ene. 2026
        dayLabel = date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    // Time formatting
    // If the input string is full ISO, we extract time.
    // If it's just YYYY-MM-DD, we might not have time.
    // Let's try to parse time if it exists in the string (e.g. ISO)
    let timeLabel = '';
    if (dateString.includes('T') || dateString.includes(':')) {
        timeLabel = date.toLocaleTimeString('es-ES', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    } else {
        // If data lacks time but user wants the look, we might just omit it
        // OR checks if there's a separate "createdAt" field we should use?
        // For now, leave empty if no time data.
    }

    return timeLabel ? `${dayLabel} ${timeLabel}` : dayLabel;
};
