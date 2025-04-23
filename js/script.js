// Жёстко задаём базовый URL API
const API_BASE_URL = 'http://localhost:8000';

document.addEventListener('DOMContentLoaded', function () {
	const loginBtn = document.getElementById('loginBtn')
	const registerBtn = document.getElementById('registerBtn')
	const loginMenu = document.getElementById('loginMenu')
	const registrationMenu = document.getElementById('registrationMenu')
	const closeButtons = document.querySelectorAll('.closeBtn')

	function openMenu(menu) {
		closeAllMenus()
		menu.classList.add('active')
	}

	function closeMenu(menu) {
		menu.classList.remove('active')
	}

	function closeAllMenus() {
		loginMenu.classList.remove('active')
		registrationMenu.classList.remove('active')
	}

	loginBtn.addEventListener('click', function () {
		openMenu(loginMenu)
	})

	registerBtn.addEventListener('click', function () {
		openMenu(registrationMenu)
	})

	closeButtons.forEach(button => {
		button.addEventListener('click', function () {
			closeMenu(button.closest('.modal'))
		})
	})

	window.addEventListener('click', function (event) {
		if (event.target.classList.contains('modal')) {
			closeMenu(event.target)
		}
	})

	// Логика показа/скрытия пароля
	const toggleButtons = document.querySelectorAll('.togglePassword');
	toggleButtons.forEach(btn => {
		btn.addEventListener('click', function() {
			const targetId = this.getAttribute('data-target');
			const input = document.getElementById(targetId);
			if (input.type === 'password') {
				input.type = 'text';
				this.textContent = 'Скрыть';
			} else {
				input.type = 'password';
				this.textContent = 'Показать';
			}
		});
	});

	// Логика открытия/закрытия мобильного меню
	const mobileMenuBtn = document.getElementById('mobileMenuBtn');
	const mobileMenu = document.getElementById('mobileMenu');
	mobileMenuBtn.addEventListener('click', function() {
		mobileMenu.classList.toggle('active');
	});

	// Обработчики для кнопок мобильного меню
	document.getElementById('registerBtnMobile').addEventListener('click', function() {
		openMenu(registrationMenu);
		mobileMenu.classList.remove('active');
	});
	document.getElementById('loginBtnMobile').addEventListener('click', function() {
		openMenu(loginMenu);
		mobileMenu.classList.remove('active');
	});

	// Интеграция API: регистрация
	const registrationForm = document.getElementById('registrationForm');
	if (registrationForm) {
		registrationForm.addEventListener('submit', async function(e) {
			e.preventDefault();
			const email = document.getElementById('regEmail').value;
			const password = document.getElementById('regPassword').value;
			const confirmPassword = document.getElementById('regConfirmPassword').value;
			if (password !== confirmPassword) {
				alert('Пароли не совпадают');
				return;
			}
			try {
				const res = await fetch(`${API_BASE_URL}/register`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
					body: JSON.stringify({ email: email, password: password })
				});
				const text = await res.text();
				let result;
				try { result = text ? JSON.parse(text) : {}; } catch (e) { result = { detail: text } }
				console.log('Registration response:', res.status, result);
				if (res.ok) {
					alert(`Пользователь ${result.email} зарегистрирован`);
					closeAllMenus();
				} else {
					alert(`Ошибка регистрации ${res.status}: ${result.detail || text}`);
				}
			} catch (err) {
				console.error('Ошибка регистрации:', err);
				alert(`Ошибка регистрации: ${err.message}`);
			}
		});
	}

	// Интеграция API: авторизация
	const loginForm = document.getElementById('loginForm');
	if (loginForm) {
		loginForm.addEventListener('submit', async function(e) {
			e.preventDefault();
			const email = document.getElementById('loginEmail').value;
			const password = document.getElementById('loginPassword').value;
			try {
				const res = await fetch(`${API_BASE_URL}/token`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
						'Accept': 'application/json'
					},
					body: new URLSearchParams({ username: email, password: password })
				});
				// Безопасный разбор ответа
				const text = await res.text();
				let result;
				try {
					result = text ? JSON.parse(text) : {};
				} catch (err) {
					console.warn('Failed to parse JSON for login:', err);
					result = { detail: text };
				}
				console.log('Login response:', res.status, result);
				if (res.ok) {
					localStorage.setItem('token', result.access_token);
					alert('Вход выполнен');
					closeAllMenus();
					window.location.href = 'profile.html';
				} else {
					alert(`Ошибка авторизации ${res.status}: ${result.detail || text}`);
				}
			} catch (err) {
				console.error('Ошибка авторизации:', err);
				alert(`Ошибка авторизации: ${err.message}`);
			}
		});
	}

	// Загрузка профиля на странице profile.html
	if (window.location.pathname.endsWith('profile.html')) {
		const token = localStorage.getItem('token');
		if (!token) {
			alert('Пожалуйста, войдите в систему');
			window.location.href = 'index.html';
		} else {
			fetch(`${API_BASE_URL}/users/me`, {
				headers: { 'Authorization': 'Bearer ' + token }
			})
			.then(res => res.json())
			.then(data => {
				document.getElementById('profileName').value = data.email;
				document.getElementById('profileEmail').value = data.email;
			})
			.catch(err => console.error('Ошибка загрузки профиля:', err));
		}
	}

	// Обновление профиля (PUT /users/me)
	const profileForm = document.getElementById('profileForm');
	if (profileForm) {
		profileForm.addEventListener('submit', async function(e) {
			e.preventDefault();
			const email = document.getElementById('profileEmail').value;
			const password = document.getElementById('profilePassword').value;
			const confirm = document.getElementById('profileConfirmPassword').value;
			if (password !== confirm) { alert('Пароли не совпадают'); return; }
			try {
				const token = localStorage.getItem('token');
				const res = await fetch(`${API_BASE_URL}/users/me`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': 'Bearer ' + token
					},
					body: JSON.stringify({ email: email, password: password })
				});
				const text = await res.text();
				let result;
				try { result = text ? JSON.parse(text) : {}; } catch (e) { result = { detail: text } }
				console.log('Update profile:', res.status, result);
				if (res.ok) {
					alert('Профиль обновлён');
				} else {
					alert(`Ошибка обновления ${res.status}: ${result.detail || text}`);
				}
			} catch (err) {
				console.error('Ошибка обновления профиля:', err);
				alert('Ошибка при обновлении профиля');
			}
		});
	}
})
