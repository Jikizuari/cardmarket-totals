(function (root) {
	const { detectFormat, formatAmount } = root.CardmarketParse;
	const { findTable, dataRows, quantityCell, readTotals, pageInfo, pageUrl } = root.CardmarketTable;

	const FETCH_DELAY_MS = 1000;

	const table = findTable(document);
	if (!table || !dataRows(table).length) {
		return;
	}

	const pageTotals = readTotals(table);
	const format = detectFormat(pageTotals.sample);
	const pages = pageInfo(document, location.href);

	// Clone a real row so every cell lines up with the columns above it, then strip its content.
	const row = dataRows(table)[0].cloneNode(true);
	row.className = 'row g-0 flex-nowrap cmt-total';
	row.querySelectorAll('a, img, svg, .icon').forEach((node) => node.remove());
	row.querySelectorAll('*').forEach((node) => {
		[...node.childNodes].filter((child) => child.nodeType === Node.TEXT_NODE).forEach((child) => child.remove());
	});
	row.addEventListener('click', (event) => event.stopPropagation());

	const label = document.createElement('span');
	label.className = 'cmt-label';
	const actions = document.createElement('span');
	actions.className = 'cmt-actions';
	const qty = document.createElement('span');
	const amount = document.createElement('span');

	const labelCell = row.querySelector(':scope > .col');
	labelCell.classList.add('cmt-label-cell');
	labelCell.replaceChildren(label, actions);
	quantityCell(row)?.replaceChildren(qty);
	row.querySelector('.col-price').replaceChildren(amount);

	function show(scope, totals) {
		const noun = totals.shipments === 1 ? 'zending' : 'zendingen';
		label.textContent = `${scope} · ${totals.shipments} ${noun}`;
		qty.textContent = totals.quantity;
		amount.textContent = formatAmount(totals.cents, format);
	}

	function button(text, onClick) {
		const node = document.createElement('button');
		node.type = 'button';
		node.className = 'cmt-button';
		node.textContent = text;
		node.addEventListener('click', onClick);
		return node;
	}

	function status(text) {
		const node = document.createElement('span');
		node.className = 'cmt-status';
		node.textContent = text;
		return node;
	}

	const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

	async function fetchPage(site) {
		const response = await fetch(pageUrl(location.href, site), { credentials: 'include' });
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}
		const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
		const fetched = findTable(doc);
		if (!fetched) {
			throw new Error('geen tabel gevonden');
		}
		return readTotals(fetched);
	}

	async function sumAllPages() {
		let stopped = false;
		const total = { ...pageTotals };
		actions.replaceChildren();
		const progress = status('');
		actions.append(progress, button('Stop', () => {
			stopped = true;
		}));

		const others = [];
		for (let site = 1; site <= pages.last; site++) {
			if (site !== pages.current) {
				others.push(site);
			}
		}

		for (const [index, site] of others.entries()) {
			if (stopped) {
				show(`${index + 1} van ${pages.last} pagina's`, total);
				actions.replaceChildren(status('gestopt'), button('Opnieuw', sumAllPages));
				return;
			}
			progress.textContent = `pagina ${index + 2}/${pages.last}…`;
			try {
				const totals = await fetchPage(site);
				total.shipments += totals.shipments;
				total.quantity += totals.quantity;
				total.cents += totals.cents;
			} catch (error) {
				show(`${index + 1} van ${pages.last} pagina's`, total);
				actions.replaceChildren(status(`fout bij pagina ${site}: ${error.message}`), button('Opnieuw', sumAllPages));
				return;
			}
			show(`${index + 2} van ${pages.last} pagina's`, total);
			if (index < others.length - 1) {
				await sleep(FETCH_DELAY_MS);
			}
		}

		show(`Alle ${pages.last} pagina's`, total);
		actions.replaceChildren(status('✓'));
	}

	show(pages.last > 1 ? 'Deze pagina' : 'Totaal', pageTotals);
	if (pages.last > 1) {
		actions.append(button(`Alle ${pages.last} pagina's optellen`, sumAllPages));
	}

	table.querySelector('.table-body').after(row);
})(this);
