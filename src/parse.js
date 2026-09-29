// Loaded as a plain content script (exposes CardmarketParse) and required by the node tests.
(function (root) {
	const NUMBER = /\d(?:[\d.,\s  ]*\d)?/;

	function splitNumber(raw) {
		const digits = raw.replace(/[\s  ]/g, '');
		const separator = Math.max(digits.lastIndexOf(','), digits.lastIndexOf('.'));
		// A separator followed by at most two digits is the decimal mark; otherwise it groups thousands.
		if (separator !== -1 && digits.length - separator - 1 <= 2) {
			return { whole: digits.slice(0, separator), fraction: digits.slice(separator + 1), decimal: digits[separator] };
		}
		return { whole: digits, fraction: '', decimal: null };
	}

	/** Amount in whole cents, or null when the text holds no number. */
	function parseAmount(text) {
		const match = String(text).match(NUMBER);
		if (!match) {
			return null;
		}
		const { whole, fraction } = splitNumber(match[0]);
		return (parseInt(whole.replace(/[.,]/g, ''), 10) || 0) * 100 + parseInt((fraction + '00').slice(0, 2), 10);
	}

	function parseQuantity(text) {
		return parseInt(String(text).replace(/\D/g, ''), 10) || 0;
	}

	/** Learn decimal mark and currency placement from an amount as the page shows it. */
	function detectFormat(sample) {
		const text = String(sample).trim();
		const match = text.match(NUMBER);
		if (!match) {
			return { decimal: ',', thousands: '.', prefix: '', suffix: ' €' };
		}
		const decimal = splitNumber(match[0]).decimal || ',';
		return {
			decimal,
			thousands: decimal === ',' ? '.' : ',',
			prefix: text.slice(0, match.index),
			suffix: text.slice(match.index + match[0].length),
		};
	}

	function formatAmount(cents, format) {
		const whole = String(Math.floor(cents / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, format.thousands);
		const fraction = String(cents % 100).padStart(2, '0');
		return `${format.prefix}${whole}${format.decimal}${fraction}${format.suffix}`;
	}

	const api = { parseAmount, parseQuantity, detectFormat, formatAmount };
	if (typeof module !== 'undefined' && module.exports) {
		module.exports = api;
	} else {
		root.CardmarketParse = api;
	}
})(this);
