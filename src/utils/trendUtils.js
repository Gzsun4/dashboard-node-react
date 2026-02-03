export const calculateTrend = (data, timeFilter) => {
    if (!data || data.length === 0 || !timeFilter) {
        return null; // No data or no time filter applied, no trend to show
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let daysInPeriod = 0;
    let periodLabel = "";

    // If 'all', we default to showing "Last 30 Days" trend vs previous 30 days
    // This gives the user *some* trend info instead of a broken empty state
    if (timeFilter === 'all') {
        daysInPeriod = 365; // Show trend vs last year if all
        periodLabel = "vs año ant.";
    } else if (timeFilter === '7days') {
        daysInPeriod = 7;
        periodLabel = "vs 7 días ant.";
    } else if (timeFilter === 'month') {
        daysInPeriod = 30;
        periodLabel = "vs mes ant.";
    } else if (timeFilter === '3months') {
        daysInPeriod = 90;
        periodLabel = "vs 3 meses ant.";
    } else {
        return null; // Unknown filter
    }

    // Current Period Range
    const currentStart = new Date(today);
    currentStart.setDate(today.getDate() - daysInPeriod);

    // Previous Period Range
    const prevStart = new Date(currentStart);
    prevStart.setDate(currentStart.getDate() - daysInPeriod);
    const prevEnd = new Date(currentStart); // The end of previous period is the start of current

    // Calculate Sums
    let currentSum = 0;
    let prevSum = 0;

    data.forEach(item => {
        // Defensive date parsing
        if (!item.date) return;

        // Improved date parsing for YYYY-MM-DD to avoid UTC issues
        // We assume input is YYYY-MM-DD string
        let itemDate;
        if (typeof item.date === 'string' && item.date.includes('-')) {
            const [y, m, d] = item.date.split('-').map(Number);
            itemDate = new Date(y, m - 1, d);
        } else {
            // Fallback for other formats
            itemDate = new Date(item.date);
        }

        itemDate.setHours(0, 0, 0, 0); // Normalize to midnight to match ranges

        // Check Current Period
        if (itemDate >= currentStart && itemDate <= today) {
            currentSum += (item.amount || 0);
        }

        // Check Previous Period
        if (itemDate >= prevStart && itemDate < prevEnd) {
            prevSum += (item.amount || 0);
        }
    });

    if (prevSum === 0) {
        // If no previous data, we don't show a trend percentage as it would be infinite or 100% which might be misleading
        // UNLESS we want to show it as "New" or something. User requested "si no tengo ingresos que no haya nada".
        return null;
    }

    const diff = currentSum - prevSum;
    const percentage = (diff / prevSum) * 100;

    const sign = percentage > 0 ? "+" : "";
    const formattedDiff = `${sign}${percentage.toFixed(1)}%`;

    return {
        trend: formattedDiff,
        trendLabel: periodLabel
    };
};

export const calculateLinearRegression = (dailyData, totalDays = 7) => {
    // dailyData: Array of numbers representing actual daily spending so far
    const n = dailyData.length;
    if (n === 0) return 0;
    if (n === 1) return dailyData[0] * totalDays; // Fallback for single data point

    // X = 0, 1, 2... (days)
    // Y = amounts
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    for (let i = 0; i < n; i++) {
        const x = i;
        const y = dailyData[i];
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumXX += x * x;
    }

    // Calculate slope (m) and intercept (b)
    const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const b = (sumY - m * sumX) / n;

    // Calculate current accumulated total
    let totalProjected = dailyData.reduce((a, b) => a + b, 0);

    // Project remaining days
    // If we have n days of data, we calculate for x = n, n+1, ... totalDays-1
    for (let x = n; x < totalDays; x++) {
        const predictedVal = m * x + b;
        // Don't predict negative spending, minimum 0
        totalProjected += Math.max(0, predictedVal);
    }

    return Math.round(totalProjected);
};
