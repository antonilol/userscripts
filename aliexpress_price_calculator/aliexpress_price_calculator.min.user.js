// ==UserScript==
// @name         AliExpress price calculator
// @namespace    https://github.com/antonilol/userscripts
// @version      1.0.0
// @description  Calculates price including VAT, excluding VAT, shipping per item, etc
// @author       antonilol
// @updateURL    https://raw.githubusercontent.com/antonilol/userscripts/master/aliexpress_price_calculator.min.meta.js
// @downloadURL  https://raw.githubusercontent.com/antonilol/userscripts/master/aliexpress_price_calculator.min.user.js
// @match        https://*.aliexpress.com/item/*
// @icon         https://aliexpress.com/favicon.ico
// @grant        none
// ==/UserScript==

(()=>{const n=e=>(Math.round(e)/100).toFixed(2);setInterval(function(){var e,t=parseInt(document.querySelector("span.product-price-value").innerText.replace(/[^0-9\-]/g,""));try{e=parseInt("0"+document.querySelector("div.product-shipping-price>span").innerText.replace(/\D/g,""))}catch(e){}var r=parseInt(document.querySelector("div.product-quantity>span>span>span>input").value.replace(/\D/g,"")),c=document.querySelector("#autopricecalc");c||((c=document.createElement("table")).style.borderSpacing="8px",c.style.borderCollapse="separate",c.id="autopricecalc",document.querySelector(".product-price").appendChild(c)),c.innerHTML="<tr><th></th><th>VAT excl</th><th>VAT incl</th></tr>"+[[r+" item"+(r-1?"s":""),t*r],["Shipping",e],["Total price",t*r+e,1],[],["Shipping/item",e/r],["Total price/item",e/r+t]].map(e=>`<tr>${e.length?`<td>${e[0]}:</td><td>${e[2]>>1&1?"<b>":""}${void 0!==e[1]?n(e[1]/1.21):"?"}${e[2]>>1&1?"</b>":""}</td><td>${1&e[2]?"<b>":""}${void 0!==e[1]?n(e[1]):"?"}${1&e[2]?"</b>":""}</td>`:""}</tr>`).join("")},1e3)})();
