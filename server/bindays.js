
const fedHolidays = require('@18f/us-federal-holidays');

function getBinDays(start, end) {

    const modernObserved = [
        'New Years Day',
        'Memorial Day',
        'Independence Day',
        'Labor Day',
        'Thanksgiving Day',
        'Christmas Day'
    ];
    const refStart = new Date('2026-03-31T00:00:00-04:00');

    let events = []

    for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {

        if(d.getDay() == 2) {

            let recycling = false;
            let eventTime = d;

            const weekOffset = Math.round((d - refStart) / (1000 * 3600 * 24)) / 7;
            if ((weekOffset % 2) == 0) {
                recycling = true;
            }

            const options = { shiftSaturdayHolidays: false, shiftSundayHolidays: true };
            const sundayBefore = new Date(d);
            sundayBefore.setDate(d.getDate() - 2);
            const holidays = fedHolidays.inRange(sundayBefore, d, options);
            for (let h = 0; h < holidays.length; h++) {
                if (modernObserved.includes(holidays[h].name)) {
                    eventTime.setDate(eventTime.getDate() + 1);
                    break;
                }
            }

            let title = '🗑️';
            let description = 'Bin ';
            if (recycling) {
                title += ' ♻️';
                description += ' and recycling ';
            }
            description += 'day.';

            events.push({
                id: eventTime.toISOString() + '-' + description.replaceAll(' ', '-'),
                summary: title,
                description: description,
                allday: true,
                start: {
                    dateTime: new Date(eventTime)
                }
            });
        }
    }
    return events;
}

exports.getBinDays = getBinDays;
