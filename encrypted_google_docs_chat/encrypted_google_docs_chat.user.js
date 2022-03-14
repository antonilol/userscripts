// ==UserScript==
// @name         Encrypted Google Docs Chat
// @namespace    https://github.com/antonilol/userscripts
// @version      1.0.2
// @description  End to end encryption between users in Google Docs chat
// @author       antonilol
// @updateURL    https://raw.githubusercontent.com/antonilol/userscripts/master/encrypted_google_docs_chat/encrypted_google_docs_chat.meta.js
// @downloadURL  https://raw.githubusercontent.com/antonilol/userscripts/master/encrypted_google_docs_chat/encrypted_google_docs_chat.user.js
// @match        https://docs.google.com/document/d/*
// @grant        none
// @require      https://raw.githubusercontent.com/antonilol/userscripts/master/encrypted_google_docs_chat/forge.min.js
// ==/UserScript==

function c(name, d=document) {
	return d.getElementsByClassName(name).item(0);
}

const forge = window.forge;

const keys = {}, keyCache = [];

var me, pub, pem, priv;

var chatInput, chatLog;

forge.pki.rsa.generateKeyPair({ bits: 2048, workers: 2 }, (err, k) => {
	if (err) {
		console.error(err);
	}
	pub = k.publicKey;
	priv = k.privateKey;
	pem = forge.pki.publicKeyToPem(pub);
});

function fingerprint(p) {
	const f = forge.pki.getPublicKeyFingerprint(p, {
		md: forge.md.sha256.create(),
		encoding: 'hex'
	});
	return f;
}

function encrypt(s, ids) {
	if (!ids.filter(id => keys[id].rsa).length) {
		return s;
	}
	const k = forge.random.getBytesSync(32);
	const iv = forge.random.getBytesSync(16);
	const cipher = forge.cipher.createCipher('AES-CBC', k);
	cipher.start({ iv });
	cipher.update(forge.util.createBuffer(s));
	if (!cipher.finish()) {
		return;
	}
	keyCache.push(k + iv);
	return [
		forge.util.encode64(cipher.output.data),
		...ids.filter(id => keys[id].rsa).map(id => {
			return forge.util.encode64(forge.util.hexToBytes(id) + keys[id].rsa.encrypt(k + iv));
		})
	].join('\n');
}

function decrypt(s, fromMe) {
	try {
		var ks = s.split('\n');
		if (ks.length < 2) {
			return s;
		}
		var i;
		for (i = 0; i < ks.length; i++) {
			ks[i] = forge.util.decode64(ks[i]);
		}
		const msg = ks.shift();
		ks = ks
			.filter(k => forge.util.bytesToHex(k.slice(0, 8)) == me.id)
			.map(k => k.slice(8));
		if (fromMe) {
			ks = keyCache;
		}
		for (i = 0; i < ks.length; i++) {
			try {
				var aesKey;
				if (fromMe) {
					aesKey = ks[i];
				} else {
					aesKey = priv.decrypt(ks[i]);
					if (aesKey.length != 48) {
						continue;
					}
				}
				const k = aesKey.slice(0, 32);
				const iv = aesKey.slice(32);
				const decipher = forge.cipher.createDecipher('AES-CBC', k);
				decipher.start({ iv });
				decipher.update(forge.util.createBuffer(msg));
				if (decipher.finish()) {
					if (fromMe) {
						delete keyCache[i];
					}
					return decipher.output.data;
				}
			}
			catch (e) {
			}
		}
	}
	catch (e) {
	}
	return s;
}

// called when a message is sent
// input param is the original message
// return in the function what should
// be sent to others in the document
function send(s) {
	return encrypt(s, Object.keys(keys));
}

// called when a message is received
// input param is the original message
// return in the function what has to
// appear in the chat log
// sender is undefined for status messages
function receive(s, sender) {
	if (sender) {
		if (!keys[sender.id]) {
			try {
				if (s.replace(/\n/g,'').length == 442) {
					const p = forge.pki.publicKeyFromPem(s);
					if (p && p.e && p.n && p.encrypt) {
						if (fingerprint(p) == fingerprint(pub) && (!me || me.id == sender.id)) {
							me = sender;
							return { status: `Public key sent.` };
						}
						keys[sender.id] = {
							name: sender.name,
							rsa: p
						};
						return { status: `Public key received from ${sender.name}.` };
					}
				}
			}
			catch (e) {
			}
		}
		const message = decrypt(s, sender.id == (me && me.id));
		return { message, decrypted: message != s };
	} else {
		if (s.endsWith('has opened the document.')) {
			setTimeout(() => sendMessage(pem), 0);
		}
		return s;
	}
}

var i, prev;
function sendMessage(s) {
	i = s;
	chatInput.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 13 }));
}

var observer;
function obsOn() {
	observer.observe(chatLog, { childList: true, subtree: true });
}

function obsOff() {
	observer.disconnect();
}

function setup() {
	chatInput = c('docs-chat-edit-box');
	chatLog = c('docs-chat-messages');

	if (!chatInput || !chatLog || !pem) {
		setTimeout(setup, 500);
		return;
	}

	// setup chatInput
	chatInput.addEventListener('keydown', e => {
		if (e.keyCode == 13) {
			if (e.isTrusted) {
				if (chatInput.value) {
					chatInput.value = send(chatInput.value);
				}
			} else {
				prev = chatInput.value;
				chatInput.value = i;
			}
		}
	}, true);
	chatInput.addEventListener('keydown', e => {
		if (e.keyCode == 13) {
			if (!e.isTrusted) {
				setTimeout(() => {
					chatInput.value = prev;
				}, 10);
			}
		}
	});

	// setup chatLog
	observer = new MutationObserver(() => {
		obsOff();
		[...chatLog.children].forEach(msg => {
			const cl = msg.classList;
			if ([...cl].includes('decrypted')) {
				return;
			}
			const v = cl.value;
			cl.add('decrypted');
			if (v == 'docs-chat-message docs-chat-status-message') {
				const text = c('docs-chat-status', msg);
				if (!text) {
					return;
				}
				text.innerText = receive(text.innerText);
			} else if (v == 'docs-chat-message') {
				const nameTag = c('docs-chat-nametag', msg);
				const id = c('docs-presence-plus-collab-widget-container', msg);
				const text = c('docs-chat-message-body', msg);
				if (!text || !nameTag || !id) {
					return;
				}
				const t = receive(
					text.innerText,
					{
						name: nameTag.innerText,
						id: id.getAttribute('data-sessionid')
					}
				);
				if (!t) {
					msg.remove();
					return;
				} else if (t.status) {
					cl.add('docs-chat-status-message');
					while (msg.firstChild) {
						msg.removeChild(msg.firstChild);
					}
					const status = document.createElement('span');
					status.classList.add('docs-chat-status');
					status.innerText = t.status;
					msg.appendChild(status);
				} else {
					text.innerText = t.message;
					if (t.decrypted) {
						const lock = document.createElement('img');
						lock.src = 'https://raw.githubusercontent.com/antonilol/userscripts/master/encrypted_google_docs_chat/lock.svg';
						lock.style.marginBottom = '-12px';
						lock.style.marginLeft = '3px';
						lock.style.width = '16px';
						nameTag.parentNode.insertBefore(lock, nameTag);
						nameTag.style.color = '#009900';
					}
				}
			}
		});
		obsOn();
	});

	obsOn();

	setTimeout(() => sendMessage(pem), 2500);
}

setup();
