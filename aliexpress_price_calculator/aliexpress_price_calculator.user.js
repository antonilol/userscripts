// ==UserScript==
// @name         AliExpress price calculator
// @namespace    https://github.com/antonilol/userscripts
// @version      1.0.0
// @description  Calculates price including VAT, excluding VAT, shipping per item, etc
// @author       antonilol
// @updateURL    https://raw.githubusercontent.com/antonilol/userscripts/master/aliexpress_price_calculator.meta.js
// @downloadURL  https://raw.githubusercontent.com/antonilol/userscripts/master/aliexpress_price_calculator.user.js
// @match        https://*.aliexpress.com/item/*
// @icon         https://aliexpress.com/favicon.ico
// @grant        none
// ==/UserScript==

const n = x => (Math.round(x)/100).toFixed(2);

function refresh() {
	var price, ship, qty;
	price = parseInt(document.querySelector('span.product-price-value').innerText.replace(/[^0-9\-]/g,''));
	try {
		ship = parseInt('0' + document.querySelector('div.product-shipping-price>span').innerText.replace(/\D/g,''));
	} catch (e) {}
	qty = parseInt(document.querySelector('div.product-quantity>span>span>span>input').value.replace(/\D/g,''));

	var elem = document.querySelector('#autopricecalc');
	if (!elem) {
		elem = document.createElement('table');
		elem.style.borderSpacing = '8px';
		elem.style.borderCollapse = 'separate';
		elem.id = 'autopricecalc';
		document.querySelector('.product-price').appendChild(elem);
	}
	elem.innerHTML = `<tr><th></th><th>VAT excl</th><th>VAT incl</th></tr>` + [
		[`${qty} item${qty-1?'s':''}`, price * qty],
		[`Shipping`, ship],
		[`Total price`, price * qty + ship, 0b01],
		[],
		[`Shipping/item`, ship / qty],
		[`Total price/item`, ship / qty + price]
	].map(x => `<tr>${x.length ?
		`<td>${x[0]}:</td><td>${x[2]>>1&1?'<b>':''}${x[1]!==undefined?n(x[1]/1.21):'?'}${x[2]>>1&1?'</b>':''}</td><td>${x[2]&1?'<b>':''}${x[1]!==undefined?n(x[1]):'?'}${x[2]&1?'</b>':''}</td>` :
		''}</tr>`
	).join('');
}

// hacky
setInterval(refresh, 1000);
