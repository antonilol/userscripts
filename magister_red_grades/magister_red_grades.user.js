// ==UserScript==
// @name         Return Magister red grades
// @namespace    https://github.com/antonilol/userscripts
// @version      1.0.1
// @description  My reaction to the fact that Magister removed red grades
// @author       antonilol
// @updateURL    https://raw.githubusercontent.com/antonilol/userscripts/master/magister_red_grades/magister_red_grades.meta.js
// @downloadURL  https://raw.githubusercontent.com/antonilol/userscripts/master/magister_red_grades/magister_red_grades.user.js
// @match        https://marnix.magister.net/magister/
// @icon         https://marnix.magister.net/favicon.ico
// @grant        none
// ==/UserScript==

const forEachGrade = n => {
	if (n.grade < 5.5 || n.grade == 'o') {
		n.style.color = 'red';
	} else if (n.grade == 10) {
		n.style.fontSize = '13px';
		n.style.color = 'green';
	}
};

const parseDate = d => {
	const z = d.split('-');
	z.splice(0, 0, ...z.splice(1, 1))
	return new Date(z.join('-'));
};

const parseGrade = n => parseFloat(n.replace(/,/, '.')) || n;

const getValue = elem => {
	if (elem.tagName == 'TD') {
		const e = elem.children.item(0);
		if (!e.classList.contains('empty')) {
			return { v: e.innerText, e };
		}
	}
};

const refresh = tries => {
	if (typeof tries != 'number') {
		tries = 0;
	}

	const hash = window.location.hash;

	if (hash == '#/cijfers') {
		const grades = document.querySelectorAll('#cijfers-laatst-behaalde-resultaten-container>section>div>div.wide-widget>div>div>table>tbody>tr');
		if (grades == null || grades.length == 0) {
			if (tries < 20) {
				setTimeout(refresh.bind(null, tries + 1), 100);
			}
			return;
		}
		[...grades].forEach(e => {
			const c = [...e.children];
			const grade = {
				subject: c[0].innerText,
				date:    parseDate(c[1].innerText),
				desc:    c[2].innerText,
				grade:   parseGrade(c[3].innerText),
				weight:  parseInt(c[4].innerText.replace(/x$/,'')),
				style:   c[3].style
			};
			forEachGrade(grade);
		});
	} else if (hash == '#/cijfers/cijferoverzicht') {
		const subjects = document.querySelector('#cijferoverzichtgrid>div.k-grid-content>table>tbody');
		if (subjects == null || subjects.children.length == 0) {
			if (tries < 20) {
				setTimeout(refresh.bind(null, tries + 1), 100);
			}
			return;
		}
		var subject;
		[...subjects.children].forEach(r => {
			[...r.children].forEach((e, i, l) => {
				if (!i) {
					return;
				}
				const val = getValue(e);
				if (i == 1) { // subject name
					subject = val.v;
				} else if (val && i + 1 != l.length) {
					const grade = {
						subject,
						grade: parseGrade(val.v),
						style: val.e.style
					}
					forEachGrade(grade);
				}
			});
		});
	}
};

refresh();

window.addEventListener('hashchange', refresh);
