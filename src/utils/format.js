/**
 * ─────────────────────────────────────────────
 *  Format Helpers — progress bars, durations, truncation
 * ─────────────────────────────────────────────
 */

const config = require('../config/config');

module.exports = {
    /**
     * Builds a text progress bar for the currently playing track.
     * @param {number} currentMs
     * @param {number} totalMs
     * @param {number} size number of segments in the bar
     */
    progressBar(currentMs, totalMs, size = 18) {
        if (!totalMs || totalMs <= 0) {
            // Live streams / unknown duration
            return `${config.emojis.dot.repeat ? '' : ''}🔴 LIVE`;
        }

        const ratio = Math.min(Math.max(currentMs / totalMs, 0), 1);
        const filledCount = Math.round(size * ratio);
        const emptyCount = size - filledCount;

        const filled = '▰'.repeat(filledCount);
        const empty = '▱'.repeat(emptyCount);

        return `${filled}${empty}`;
    },

    /** Formats milliseconds as H:MM:SS or M:SS. */
    formatDuration(ms) {
        if (!ms || ms <= 0 || Number.isNaN(ms)) return 'LIVE';

        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const pad = (n) => String(n).padStart(2, '0');

        if (hours > 0) return `${hours}:${pad(minutes)}:${pad(seconds)}`;
        return `${minutes}:${pad(seconds)}`;
    },

    /** Truncates text to a max length, appending an ellipsis if cut. */
    truncate(text, max = 60) {
        if (!text) return '';
        return text.length > max ? `${text.slice(0, max - 1)}…` : text;
    },

    /** Picks a source-appropriate emoji for a track. */
    sourceEmoji(source) {
        switch ((source || '').toLowerCase()) {
            case 'spotify':
                return config.emojis.spotify;
            case 'youtube':
                return config.emojis.youtube;
            case 'soundcloud':
                return config.emojis.soundcloud;
            default:
                return config.emojis.music;
        }
    }
};
