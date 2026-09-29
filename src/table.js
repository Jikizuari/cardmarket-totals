// Reading Cardmarket's div-based #StatusTable, from the live page or from a fetched page.
(function (root) {
	const { parseAmount, parseQuantity } = root.CardmarketParse;

	function findTable(doc) {
		const table = doc.getElementById('StatusTable');
		return table && table.querySelector('.table-body') ? table : null;
	}

	function dataRows(table) {
		return [...table.querySelectorAll('.table-body > .row')].filter((row) => row.querySelector('.col-price'));
	}

	// Row layout: [row number, ID, buyer/seller, Qty., total + date, icons]. The first
	// .col-smallNumber is the row number, the other one is the quantity.
	function quantityCell(row) {
		return row.querySelector(':scope > .col-smallNumber:not(:first-child)');
	}

	/** Totals of one table: number of shipments, summed quantity and summed amount in cents. */
	function readTotals(table) {
		const totals = { shipments: 0, quantity: 0, cents: 0, sample: null };
		for (const row of dataRows(table)) {
			const price = row.querySelector('.col-price');
			const quantity = quantityCell(row);
			totals.shipments += 1;
			totals.quantity += quantity ? parseQuantity(quantity.textContent) : 0;
			totals.cents += parseAmount(price.textContent) || 0;
			totals.sample = totals.sample || price.textContent.trim();
		}
		return totals;
	}

	/** Current and last page number, taken from the pagination links (?site=N). */
	function pageInfo(doc, href) {
		const url = new URL(href);
		const current = parseInt(url.searchParams.get('site'), 10) || 1;
		let last = current;
		for (const link of doc.querySelectorAll('a[href*="site="]')) {
			const site = parseInt(new URL(link.getAttribute('href'), href).searchParams.get('site'), 10);
			if (site > last) {
				last = site;
			}
		}
		return { current, last };
	}

	function pageUrl(href, site) {
		const url = new URL(href);
		url.searchParams.set('site', site);
		return url.toString();
	}

	root.CardmarketTable = { findTable, dataRows, quantityCell, readTotals, pageInfo, pageUrl };
})(this);
