const API_BASE_URL = 'https://api.chupep.ru'

let isInitialized = false;

// Основной обработчик загрузки страницы
document.addEventListener('DOMContentLoaded', function() {
	if (isInitialized) return;
	isInitialized = true;
	
	console.log('Страница загружена');
	
	// Инициализация вкладок профиля
	const tabs = document.querySelectorAll('.tab-btn, .tab-btn-exit');
	const contents = document.querySelectorAll('.tab-content');

	// Функция для переключения вкладок
	function switchTab(target) {
		tabs.forEach(b => b.classList.remove('active'));
		contents.forEach(c => c.classList.remove('active'));
		
		const activeBtn = document.querySelector(`[data-target="${target}"]`);
		const activeContent = document.getElementById(target);
		
		if (activeBtn) activeBtn.classList.add('active');
		if (activeContent) activeContent.classList.add('active');
		
		// Сохраняем активную вкладку
		localStorage.setItem('activeProfileTab', target);
	}

	// Восстанавливаем активную вкладку или открываем настройки по умолчанию
	const savedTab = localStorage.getItem('activeProfileTab') || 'settings';
	switchTab(savedTab);

	// Добавляем обработчики для кнопок
	tabs.forEach(btn => {
		btn.addEventListener('click', () => {
			const target = btn.dataset.target;
			if (target) {
				switchTab(target);
			}
		});
	});

	// Инициализация обработчиков для кнопок изменения данных
	const nameButton = document.querySelector('.name-info button');
	const emailButton = document.querySelector('.email-info button');
	const passwordButton = document.querySelector('.password-info button');

	if (nameButton) {
		nameButton.addEventListener('click', () => {
			const newName = prompt('Введите новое имя:');
			if (newName) {
				updateUserName(newName);
			}
		});
	}

	if (emailButton) {
		emailButton.addEventListener('click', () => {
			const newEmail = prompt('Введите новый email:');
			if (newEmail) {
				updateUserEmail(newEmail);
			}
		});
	}

	if (passwordButton) {
		passwordButton.addEventListener('click', () => {
			const oldPassword = prompt('Введите текущий пароль:');
			const newPassword = prompt('Введите новый пароль:');
			if (oldPassword && newPassword) {
				updateUserPassword(oldPassword, newPassword);
			}
		});
	}

	// Обработчик кнопки выхода
	const exitConfirmBtn = document.querySelector('.exit-confirm');
	if (exitConfirmBtn) {
		exitConfirmBtn.addEventListener('click', () => {
			localStorage.removeItem('token');
			window.location.href = '../index.html';
		});
	}

	// Инициализация мобильного меню
	const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
	const mobileMenu = document.querySelector('.mobile-menu');
	const mobileMenuClose = document.querySelector('.mobile-menu-close');

	if (mobileMenuBtn && mobileMenu) {
		mobileMenuBtn.addEventListener('click', () => {
			mobileMenu.classList.add('active');
		});
	}
	if (mobileMenuClose && mobileMenu) {
		mobileMenuClose.addEventListener('click', () => {
			mobileMenu.classList.remove('active');
		});
	}

	// Закрытие меню при клике вне меню
	document.addEventListener('click', e => {
		if (mobileMenu && 
			mobileMenu.classList.contains('active') && 
			!mobileMenu.contains(e.target) && 
			e.target !== mobileMenuBtn) {
			mobileMenu.classList.remove('active');
		}
	});

	// Закрытие мобильного меню по клику на любую кнопку меню
	const menuButtons = document.querySelectorAll('.mobile-menu .profile-header-bar button');
	menuButtons.forEach(btn => {
		btn.addEventListener('click', () => {
			mobileMenu.classList.remove('active');
		});
	});

	// Инициализация загрузки аватара
	const avatarImg = document.getElementById('avatarImg');
	const fileInput = document.getElementById('avatarInput');
	
	if (avatarImg && fileInput) {
		avatarImg.style.cursor = 'pointer';
		
		// Удаляем все существующие обработчики
		avatarImg.removeEventListener('click', handleAvatarClick);
		fileInput.removeEventListener('change', handleFileChange);
		
		// Добавляем новые обработчики
		avatarImg.addEventListener('click', handleAvatarClick);
		fileInput.addEventListener('change', handleFileChange);
	}

	// Загрузка данных пользователя
	getUserInfo();
	getUserAvatar();

	// Инициализация раздела устройств
	const devicesTab = document.getElementById('devices');
	if (devicesTab) {
		loadDevices();
		// Обработчик добавления устройства
		const addDeviceForm = document.getElementById('addDeviceForm');
		if (addDeviceForm) {
			addDeviceForm.addEventListener('submit', async function(e) {
				e.preventDefault();
				const nameInput = document.getElementById('deviceNameInput');
				const name = nameInput.value.trim();
				if (!name) return;
				await addDevice(name);
				nameInput.value = '';
				loadDevices();
			});
		}
	}

	// Модальное окно для добавления устройства
	const openAddDeviceModalBtn = document.getElementById('openAddDeviceModal');
	const addDeviceModal = document.getElementById('addDeviceModal');
	const closeAddDeviceModalBtn = document.getElementById('closeAddDeviceModal');
	const addDeviceFormModal = document.getElementById('addDeviceFormModal');
	const deviceNameInputModal = document.getElementById('deviceNameInputModal');

	if (openAddDeviceModalBtn && addDeviceModal && closeAddDeviceModalBtn) {
		openAddDeviceModalBtn.addEventListener('click', () => {
			addDeviceModal.style.display = 'block';
			deviceNameInputModal.value = '';
			deviceNameInputModal.focus();
		});
		closeAddDeviceModalBtn.addEventListener('click', () => {
			addDeviceModal.style.display = 'none';
		});
		window.addEventListener('click', (e) => {
			if (e.target === addDeviceModal) {
				addDeviceModal.style.display = 'none';
			}
		});
		addDeviceFormModal.addEventListener('submit', async function(e) {
			e.preventDefault();
			const name = deviceNameInputModal.value.trim();
			if (!name) return;
			await addDevice(name);
			addDeviceModal.style.display = 'none';
			loadDevices();
		});
	}
});

// Получение данных авторизованного пользователя через API
async function getUserInfo() {
	try {
		const token = localStorage.getItem('token');
		if (!token) {
			window.location.href = '../index.html';
			return;
		}

		const res = await fetch(`${API_BASE_URL}/user/get_user_info`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${localStorage.getItem('token')}`,
				'Accept': 'application/json'
			},
			credentials: 'include'
		});

		if (!res.ok) {
			if (res.status === 401) {
				localStorage.removeItem('token');
				window.location.href = '../index.html';
			}
			throw new Error('Ошибка получения данных пользователя');
		}

		const text = await res.text();
		let result;
		try {
			result = text ? JSON.parse(text) : {};
		} catch (e) {
			result = { detail: text };
		}

		if (res.ok) {
			const userInfo = result;
			
			// Обновляем информацию в профиле
			const profileHeaderText = document.querySelector('.profile-header-text');
			if (profileHeaderText) {
				const h2 = profileHeaderText.querySelector('h2');
				const h4 = profileHeaderText.querySelector('h4');
				if (h2) h2.textContent = userInfo.name || 'Имя не указано';
				if (h4) h4.textContent = `@${userInfo.username || 'username'}`;
			}

			// Обновляем аватар
			const avatarImg = document.getElementById('avatarImg');
			if (avatarImg && userInfo.avatar) {
				avatarImg.src = userInfo.avatar;
			}

			// Обновляем информацию в настройках профиля
			const usernameInfo = document.querySelector('.username-info p:nth-child(2)');
			if (usernameInfo) {
				usernameInfo.textContent = userInfo.username || 'Не указано';
			}

			const nameInfo = document.querySelector('.name-info p:nth-child(2)');
			if (nameInfo) {
				nameInfo.textContent = userInfo.name || 'Не указано';
			}

			const emailInfo = document.querySelector('.email-info p:nth-child(2)');
			if (emailInfo) {
				emailInfo.textContent = userInfo.email || 'Не указано';
			}

			const currentStatusInfo = document.querySelector('.current-status-info p:nth-child(2)');
			if (currentStatusInfo) {
				currentStatusInfo.textContent = userInfo.current_status === true ? 'Онлайн' : 'Оффлайн';
			}

			const createInfo = document.querySelector('.create-info p:nth-child(2)');
			if (createInfo && userInfo.created_at) {
				const date = new Date(userInfo.created_at);
				createInfo.textContent = date.toLocaleDateString('ru-RU');
			}

			// Обновляем информацию в настройках
			const accountInfoItem = document.querySelector('.account-info-item p');
			if (accountInfoItem) {
				accountInfoItem.textContent = userInfo.email || 'Email не указан';
			}
		} else {
			const errorMessage = result.detail || text || 'Неизвестная ошибка';
			alert(`Ошибка получения данных: ${errorMessage}`);
			// window.location.href = '../index.html';
		}
	} catch (err) {
		alert(`Ошибка получения данных: ${err.message}`);
		// window.location.href = '../index.html';
	}
}

// Получение аватара пользователя
async function getUserAvatar() {
	try {
		const token = localStorage.getItem('token');
		if (!token) {
			return;
		}

		const res = await fetch(`${API_BASE_URL}/user/avatar`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token}`,
				'Accept': 'application/json'
			},
			credentials: 'include'
		});

		if (res.ok) {
			const avatarData = await res.json();
			const avatarImg = document.getElementById('avatarImg');
			if (avatarImg && avatarData.avatar_url) {
				avatarImg.src = avatarData.avatar_url;
			}
		}
	} catch (error) {
		console.error('Ошибка получения аватара:', error);
	}
}

// Функции для обновления данных пользователя
async function updateUserName(newName) {
	try {
		const token = localStorage.getItem('token');
		if (!token) {
			window.location.href = '../index.html';
			return;
		}
		const res = await fetch(`${API_BASE_URL}/user/update_name`, {
			method: 'PUT',
			headers: {
				'Authorization': `Bearer ${localStorage.getItem('token')}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ name: newName })
		});

		if (res.ok) {
			alert('Имя успешно обновлено');
			// Обновляем отображение имени на странице
			const nameElement = document.querySelector('.name-info p:nth-child(2)');
			if (nameElement) {
				nameElement.textContent = newName;
			}
		} else {
			const errorData = await res.json();
			alert(`Ошибка обновления имени: ${errorData.detail || 'Неизвестная ошибка'}`);
		}
	} catch (err) {
		console.error('Ошибка при обновлении имени:', err);
		alert('Произошла ошибка при обновлении имени');
	}
}

async function updateUserEmail(newEmail) {
	try {
		const token = localStorage.getItem('token');
		if (!token) {
			window.location.href = '../index.html';
			return;
		}
		const res = await fetch(`${API_BASE_URL}/user/update_email`, {
			method: 'PUT',
			headers: {
				'Authorization': `Bearer ${localStorage.getItem('token')}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ email: newEmail })
		});

		if (res.ok) {
			alert('Email успешно обновлен');
			// Обновляем отображение email на странице
			const emailElement = document.querySelector('.email-info p:nth-child(2)');
			if (emailElement) {
				emailElement.textContent = newEmail;
			}
		} else {
			const errorData = await res.json();
			alert(`Ошибка обновления email: ${errorData.detail || 'Неизвестная ошибка'}`);
		}
	} catch (err) {
		console.error('Ошибка при обновлении email:', err);
		alert('Произошла ошибка при обновлении email');
	}
}

async function updateUserPassword(oldPassword, newPassword) {
	try {
		const token = localStorage.getItem('token');
		if (!token) {
			window.location.href = '../index.html';
			return;
		}
		const res = await fetch(`${API_BASE_URL}/user/update_password`, {
			method: 'PUT',
			headers: {
				'Authorization': `Bearer ${localStorage.getItem('token')}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				old_password: oldPassword,
				new_password: newPassword
			})
		});

		if (res.ok) {
			alert('Пароль успешно обновлен');
		} else {
			const errorData = await res.json();
			alert(`Ошибка обновления пароля: ${errorData.detail || 'Неизвестная ошибка'}`);
		}
	} catch (err) {
		console.error('Ошибка при обновлении пароля:', err);
		alert('Произошла ошибка при обновлении пароля');
	}
}

// Очищаем сохраненный URL аватара при выходе
function clearAvatarUrl() {
	localStorage.removeItem('avatarUrl');
}

// Выносим обработчик в отдельную функцию
function handleAvatarClick(e) {
	e.preventDefault();
	e.stopPropagation();
	const fileInput = document.getElementById('avatarInput');
	if (fileInput) {
		fileInput.click();
	}
}

// Выносим обработчик изменения файла в отдельную функцию
async function handleFileChange(e) {
	const file = e.target.files[0];
	if (!file) return;

	const token = localStorage.getItem('token');
	if (!token) {
		window.location.href = '../index.html';
		return;
	}

	const formData = new FormData();
	formData.append('file', file);
	
	const res = await fetch(`${API_BASE_URL}/user/update_avatar`, {
		method: 'PUT',
		headers: {
			'Authorization': `Bearer ${localStorage.getItem('token')}`,
		},
		body: formData
	});
	
	if (res.ok) {
		getUserAvatar();
		alert('Аватар успешно обновлен');
	} else {
		const errorData = await res.json();
		alert(`Ошибка обновления аватара: ${errorData.detail || 'Неизвестная ошибка'}`);
	}
}

async function loadDevices() {
	const token = localStorage.getItem('token');
	if (!token) {
		window.location.href = '../index.html';
		return;
	}
	try {
		const res = await fetch(`${API_BASE_URL}/device/my_devices`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${localStorage.getItem('token')}`,
				'Accept': 'application/json'
			},
			credentials: 'include'
		});
		const text = await res.text();
		let devices = [];
		try { devices = text ? JSON.parse(text) : []; } catch { devices = []; }
		if (res.ok) {
			if (devices.length === 0) {
				devicesList.innerHTML = '<p>Нет устройств</p>';
				return;
			}
			devicesList.innerHTML = devices.map(device => renderDeviceStyled(device)).join('');
			// Навешиваем обработчики на кнопки
			devices.forEach(device => {
				const delBtn = document.getElementById(`deleteDeviceBtn_${device.id}`);
				if (delBtn) {
					delBtn.addEventListener('click', async () => {
						if (confirm('Удалить устройство?')) {
							await deleteDevice(device.id);
							loadDevices();
						}
					});
				}
				const regenBtn = document.getElementById(`regenCodeBtn_${device.id}`);
				if (regenBtn) {
					regenBtn.addEventListener('click', async () => {
						await regenerateDeviceCode(device.id);
						loadDevices();
					});
				}
				// --- Кнопки показать/скрыть и копировать код ---
				const codeId = `codeValue_${device.id}`;
				const showBtnId = `showCodeBtn_${device.id}`;
				const copyBtnId = `copyCodeBtn_${device.id}`;
				const codeElem = document.getElementById(codeId);
				const showBtn = document.getElementById(showBtnId);
				const copyBtn = document.getElementById(copyBtnId);
				if (showBtn && codeElem) {
					showBtn.addEventListener('click', () => {
						if (codeElem.classList.contains('code-hidden')) {
							codeElem.classList.remove('code-hidden');
							showBtn.textContent = 'Скрыть';
						} else {
							codeElem.classList.add('code-hidden');
							showBtn.textContent = 'Показать';
						}
					});
				}
				if (copyBtn && codeElem) {
					copyBtn.addEventListener('click', async () => {
						try {
							await navigator.clipboard.writeText(device.code || '');
							copyBtn.textContent = 'Скопировано!';
							setTimeout(() => { copyBtn.textContent = 'Скопировать'; }, 1200);
						} catch {
							copyBtn.textContent = 'Ошибка';
							setTimeout(() => { copyBtn.textContent = 'Скопировать'; }, 1200);
						}
					});
				}
			});
		} else {
			devicesList.innerHTML = `<p>Ошибка загрузки: ${devices.detail || text}</p>`;
		}
	} catch (err) {
		devicesList.innerHTML = `<p>Ошибка: ${err.message}</p>`;
	}
}

function renderDeviceStyled(device) {
	const codeId = `codeValue_${device.id}`;
	const showBtnId = `showCodeBtn_${device.id}`;
	const copyBtnId = `copyCodeBtn_${device.id}`;
	return `
	<div class="device">
	  <div class="device-row">
		<div class="device-name"><b>Имя:</b> ${device.name || '—'}</div>
		<div class="device-status"><b>Статус:</b> ${device.current_status ? 'Онлайн' : 'Оффлайн'}</div>
		<div class="device-ip"><b>IP:</b> ${device.ip || '—'}</div>
	  </div>
	  <div class="device-row">
		<div class="device-code">
		  <b>Код:</b>
		  <span id="${codeId}" class="code-value code-hidden">${device.code || '—'}</span>
		  <button class="show-code-btn" id="${showBtnId}" aria-label="Показать/скрыть код" title="Показать/скрыть код">Показать</button>
		  <button class="copy-code-btn" id="${copyBtnId}" aria-label="Скопировать код" title="Скопировать код">Скопировать</button>
		</div>
	  </div>
	  <div class="device-row">
		<div><b>Создано:</b> ${device.created_at ? new Date(device.created_at).toLocaleString('ru-RU') : '—'}</div>
		<div><b>Последняя активность:</b> ${device.last_status_active ? new Date(device.last_status_active).toLocaleString('ru-RU') : '—'}</div>
	  </div>
	  <div class="device-row device-actions">
		<button id="regenCodeBtn_${device.id}">Обновить код</button>
		<button id="deleteDeviceBtn_${device.id}">Удалить</button>
	  </div>
	</div>
	`;
}

async function addDevice(name) {
	const token = localStorage.getItem('token');
	if (!token) {
		window.location.href = '../index.html';
		return;
	}
	try {
		const res = await fetch(`${API_BASE_URL}/device/add_device`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${localStorage.getItem('token')}`,
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			},
			credentials: 'include',
			body: JSON.stringify({ name })
		});
		if (res.ok) {
			alert('Устройство добавлено!');
		} else {
			const text = await res.text();
			let result;
			try { result = text ? JSON.parse(text) : {}; } catch { result = { detail: text }; }
			alert(`Ошибка добавления: ${result.detail || text}`);
		}
	} catch (err) {
		alert(`Ошибка добавления: ${err.message}`);
	}
}

async function deleteDevice(deviceId) {
	const token = localStorage.getItem('token');
	if (!token) {
		window.location.href = '../index.html';
		return;
	}
	try {
		const res = await fetch(`${API_BASE_URL}/device/delete_device/${deviceId}`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${localStorage.getItem('token')}`,
				'Accept': 'application/json'
			},
			credentials: 'include'
		});
		if (res.ok) {
			alert('Устройство удалено!');
		} else {
			const text = await res.text();
			let result;
			try { result = text ? JSON.parse(text) : {}; } catch { result = { detail: text }; }
			alert(`Ошибка удаления: ${result.detail || text}`);
		}
	} catch (err) {
		alert(`Ошибка удаления: ${err.message}`);
	}
}

async function regenerateDeviceCode(deviceId) {
	const token = localStorage.getItem('token');
	if (!token) {
		window.location.href = '../index.html';
		return;
	}
	try {
		const res = await fetch(`${API_BASE_URL}/device/regenerate_code/${deviceId}`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${localStorage.getItem('token')}`,
				'Accept': 'application/json'
			},
			credentials: 'include'
		});
		if (res.ok) {
			alert('Код устройства обновлён!');
		} else {
			const text = await res.text();
			let result;
			try { result = text ? JSON.parse(text) : {}; } catch { result = { detail: text }; }
			alert(`Ошибка обновления кода: ${result.detail || text}`);
		}
	} catch (err) {
		alert(`Ошибка обновления кода: ${err.message}`);
	}
}





