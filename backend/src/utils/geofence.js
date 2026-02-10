/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lng1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lng2 - Longitude of point 2
 * @returns {number} Distance in meters
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

/**
 * Check if a point is within a geofence
 * @param {number} lat - Point latitude
 * @param {number} lng - Point longitude
 * @param {number} centerLat - Geofence center latitude
 * @param {number} centerLng - Geofence center longitude
 * @param {number} radius - Geofence radius in meters
 * @returns {object} { isInside: boolean, distance: number }
 */
function checkGeofence(lat, lng, centerLat, centerLng, radius) {
    const distance = calculateDistance(lat, lng, centerLat, centerLng);
    return {
        isInside: distance <= radius,
        distance: Math.round(distance * 100) / 100 // Round to 2 decimal places
    };
}

/**
 * Format duration in minutes to human readable string
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted string like "2 jam 30 menit"
 */
function formatDuration(minutes) {
    if (!minutes || minutes < 0) return '0 menit';

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) return `${mins} menit`;
    if (mins === 0) return `${hours} jam`;
    return `${hours} jam ${mins} menit`;
}

/**
 * Get today's date in YYYY-MM-DD format (local timezone)
 * @returns {string} Date string
 */
function getTodayDate() {
    const now = new Date();
    return now.toISOString().split('T')[0];
}

module.exports = {
    calculateDistance,
    checkGeofence,
    formatDuration,
    getTodayDate
};
