// ==UserScript==
// @name         Return Magister red grades
// @namespace    https://github.com/antonilol/userscripts
// @version      1.0.1
// @description  My reaction to the fact that Magister removed red grades
// @author       antonilol
// @updateURL    https://raw.githubusercontent.com/antonilol/userscripts/master/magister_red_grades/magister_red_grades.min.meta.js
// @downloadURL  https://raw.githubusercontent.com/antonilol/userscripts/master/magister_red_grades/magister_red_grades.min.user.js
// @match        https://marnix.magister.net/magister/
// @icon         https://marnix.magister.net/favicon.ico
// @grant        none
// ==/UserScript==

(()=>{const i=e=>{e.grade<5.5||"o"==e.grade?e.style.color="red":10==e.grade&&(e.style.fontSize="13px",e.style.color="green")},l=e=>parseFloat(e.replace(/,/,"."))||e,c=e=>{"number"!=typeof e&&(e=0);var t,r,n=window.location.hash;"#/cijfers"==n?null!=(t=document.querySelectorAll("#cijfers-laatst-behaalde-resultaten-container>section>div>div.wide-widget>div>div>table>tbody>tr"))&&0!=t.length?[...t].forEach(e=>{const t=[...e.children];e={subject:t[0].innerText,date:(e=>{const t=e.split("-");return t.splice(0,0,...t.splice(1,1)),new Date(t.join("-"))})(t[1].innerText),desc:t[2].innerText,grade:l(t[3].innerText),weight:parseInt(t[4].innerText.replace(/x$/,"")),style:t[3].style};i(e)}):e<20&&setTimeout(c.bind(null,e+1),100):"#/cijfers/cijferoverzicht"==n&&(null!=(n=document.querySelector("#cijferoverzichtgrid>div.k-grid-content>table>tbody"))&&0!=n.children.length?[...n.children].forEach(e=>{[...e.children].forEach((e,t,n)=>{t&&(e=(e=>{if("TD"==e.tagName){const t=e.children.item(0);if(!t.classList.contains("empty"))return{v:t.innerText,e:t}}})(e),1==t?r=e.v:e&&t+1!=n.length&&(e={subject:r,grade:l(e.v),style:e.e.style},i(e)))})}):e<20&&setTimeout(c.bind(null,e+1),100))};c(),window.addEventListener("hashchange",c)})();
