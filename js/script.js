// Базовый URL API через Nginx
const API_BASE_URL = 'https://chupep.ru/api'

const tabs = document.querySelectorAll('.tab-btn')
const contents = document.querySelectorAll('.tab-content')

tabs.forEach(btn => {
	btn.addEventListener('click', () => {
		const target = btn.dataset.target
		tabs.forEach(b => b.classList.remove('active'))
		contents.forEach(c => c.classList.remove('active'))
		btn.classList.add('active')
		document.getElementById(target).classList.add('active')
	})
})

document.addEventListener('DOMContentLoaded', function () {
	const loginBtn = document.getElementById('loginBtn')
	const registerBtn = document.getElementById('registerBtn')
	const loginMenu = document.getElementById('loginMenu')
	const registrationMenu = document.getElementById('registrationMenu')
	const closeButtons = document.querySelectorAll('.closeBtn')

	// Базовые настройки для fetch запросов
	const baseRequestOptions = {
		credentials: 'include',
		headers: {
			Accept: 'application/json',
		},
	}

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

	// Обработчики кнопок
	loginBtn?.addEventListener('click', () => openMenu(loginMenu))
	registerBtn?.addEventListener('click', () => openMenu(registrationMenu))

	closeButtons.forEach(button => {
		button.addEventListener('click', () => {
			closeMenu(button.closest('.modal'))
		})
	})

	window.addEventListener('click', event => {
		if (event.target.classList.contains('modal')) {
			closeMenu(event.target)
		}
	})

	// Логика показа/скрытия пароля
	const toggleButtons = document.querySelectorAll('.togglePassword')
	toggleButtons.forEach(btn => {
		btn.addEventListener('click', function () {
			const targetId = this.getAttribute('data-target')
			const input = document.getElementById(targetId)
			if (input.type === 'password') {
				input.type = 'text'
				this.textContent = 'Скрыть'
			} else {
				input.type = 'password'
				this.textContent = 'Показать'
			}
		})
	})

	// Мобильное меню
	const mobileMenuBtn = document.getElementById('mobileMenuBtn')
	const mobileMenu = document.getElementById('mobileMenu')
	mobileMenuBtn?.addEventListener('click', () => {
		mobileMenu.classList.toggle('active')
	})

	// Мобильные кнопки авторизации
	document
		.getElementById('registerBtnMobile')
		?.addEventListener('click', () => {
			openMenu(registrationMenu)
			mobileMenu.classList.remove('active')
		})

	document.getElementById('loginBtnMobile')?.addEventListener('click', () => {
		openMenu(loginMenu)
		mobileMenu.classList.remove('active')
	})

	// Регистрация
	const registrationForm = document.getElementById('registrationForm')
	if (registrationForm) {
		registrationForm.addEventListener('submit', async function (e) {
			e.preventDefault()
			const username = document.getElementById('regUsername').value
			const email = document.getElementById('regEmail').value
			const password = document.getElementById('regPassword').value
			const confirmPassword =
				document.getElementById('regConfirmPassword').value

			if (password !== confirmPassword) {
				alert('Пароли не совпадают')
				return
			}

			try {
				const res = await fetch(`${API_BASE_URL}/new_user`, {
					...baseRequestOptions,
					method: 'POST',
					headers: {
						...baseRequestOptions.headers,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						username,
						email,
						password,
					}),
				})

				const text = await res.text()
				console.log('Raw response:', text)

				let result
				try {
					result = text ? JSON.parse(text) : {}
				} catch (e) {
					console.error('JSON parse error:', e)
					result = { detail: text }
				}

				if (res.ok) {
					alert(`Пользователь ${result.username} успешно зарегистрирован`)
					closeAllMenus()
					openMenu(loginMenu)
				} else {
					const errorMessage = result.detail || text || 'Неизвестная ошибка'
					alert(`Ошибка регистрации: ${errorMessage}`)
				}
			} catch (err) {
				console.error('Registration error:', err)
				alert(`Ошибка регистрации: ${err.message}`)
			}
		})
	}

	// Авторизация
	const loginForm = document.getElementById('loginForm')
	if (loginForm) {
		loginForm.addEventListener('submit', async function (e) {
			e.preventDefault()
			const username = document.getElementById('loginUsername').value
			const password = document.getElementById('loginPassword').value

			try {
				const res = await fetch(`${API_BASE_URL}/token`, {
					...baseRequestOptions,
					method: 'POST',
					headers: {
						...baseRequestOptions.headers,
						'Content-Type': 'application/x-www-form-urlencoded',
					},
					body: new URLSearchParams({
						username,
						password,
					}),
				})

				const text = await res.text()
				let result
				try {
					result = text ? JSON.parse(text) : {}
				} catch (err) {
					console.warn('Failed to parse JSON:', err)
					result = { detail: text }
				}

				if (res.ok) {
					localStorage.setItem('token', result.access_token)
					alert('Вход выполнен успешно')
					closeAllMenus()
					window.location.href = 'profile.html'
				} else {
					alert(`Ошибка авторизации: ${result.detail || text}`)
				}
			} catch (err) {
				console.error('Login error:', err)
				alert(`Ошибка авторизации: ${err.message}`)
			}
		})
	}

	// Загрузка профиля
	if (window.location.pathname.endsWith('profile.html')) {
		const token = localStorage.getItem('token')
		if (!token) {
			alert('Пожалуйста, войдите в систему')
			window.location.href = 'index.html'
		} else {
			fetch(`${API_BASE_URL}/users/me`, {
				...baseRequestOptions,
				headers: {
					...baseRequestOptions.headers,
					Authorization: `Bearer ${token}`,
				},
			})
				.then(res => {
					if (!res.ok) throw new Error('Ошибка загрузки профиля')
					return res.json()
				})
				.then(data => {
					document.getElementById('profileName').value = data.email
					document.getElementById('profileEmail').value = data.email
				})
				.catch(err => {
					console.error('Profile load error:', err)
					alert('Ошибка загрузки профиля')
					localStorage.removeItem('token')
					window.location.href = 'index.html'
				})
		}
	}

	// Обновление профиля
	const profileForm = document.getElementById('profileForm')
	if (profileForm) {
		profileForm.addEventListener('submit', async function (e) {
			e.preventDefault()
			const email = document.getElementById('profileEmail').value
			const password = document.getElementById('profilePassword').value
			const confirm = document.getElementById('profileConfirmPassword').value

			if (password !== confirm) {
				alert('Пароли не совпадают')
				return
			}

			try {
				const token = localStorage.getItem('token')
				const res = await fetch(`${API_BASE_URL}/users/me`, {
					...baseRequestOptions,
					method: 'PUT',
					headers: {
						...baseRequestOptions.headers,
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ email, password }),
				})

				const text = await res.text()
				let result
				try {
					result = text ? JSON.parse(text) : {}
				} catch (e) {
					result = { detail: text }
				}

				if (res.ok) {
					alert('Профиль успешно обновлен')
				} else {
					alert(`Ошибка обновления профиля: ${result.detail || text}`)
				}
			} catch (err) {
				console.error('Profile update error:', err)
				alert('Ошибка при обновлении профиля')
			}
		})
	}

	// Функция для получения данных пользователя
	async function fetchUserProfile() {
		try {
			const token = localStorage.getItem('token')
			if (!token) {
				window.location.href = '/'; // Редирект на главную если нет токена
				return
			}

			const response = await fetch(`${API_BASE_URL}/users/me`, {
				credentials: 'include',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Accept': 'application/json'
				}
			})

			if (response.ok) {
				const userData = await response.json()
				updateProfileUI(userData)
			} else {
				if (response.status === 401) {
					localStorage.removeItem('token')
					window.location.href = '/'
				}
				throw new Error('Ошибка получения данных профиля')
			}
		} catch (error) {
			console.error('Ошибка:', error)
			alert('Не удалось загрузить данные профиля')
		}
	}

	// Функция для загрузки аватара
	async function loadAvatar() {
		const token = localStorage.getItem('token');
		if (!token) return;

		try {
			const response = await fetch(`${API_BASE_URL}/users/me/get_avatar`, {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});

			if (response.ok) {
				const blob = await response.blob();
				const avatarImg = document.getElementById('avatarImg');
				avatarImg.src = URL.createObjectURL(blob);
			} else {
				throw new Error('Ошибка загрузки аватара');
			}
		} catch (error) {
			console.error('Ошибка загрузки аватара:', error);
			const avatarImg = document.getElementById('avatarImg');
			avatarImg.src = '../image/default-avatar.png';
		}
	}

	// Обновляем функцию updateProfileUI
	function updateProfileUI(userData) {
		// Загружаем аватар
		if (userData.avatar) {
			loadAvatar();
		}

		// Обновляем имя пользователя
		const usernameElement = document.querySelector('.profile-header-text h2');
		usernameElement.textContent = userData.name || userData.username;

		// Обновляем @username
		const userHandleElement = document.querySelector('.profile-header-text h4');
		userHandleElement.textContent = `@${userData.username}`;

		// Обновляем email
		const emailElement = document.querySelector('.account-info-item p');
		emailElement.textContent = userData.email;
	}

	// Добавляем обработчики для изменения данных
	function initializeProfileEditors() {
		// Обработчик изменения аватара
		const avatarInput = document.getElementById('avatarInput')
		avatarInput.addEventListener('change', async (e) => {
			const file = e.target.files[0]
			if (!file) return

			const formData = new FormData()
			formData.append('file', file)

			try {
				const token = localStorage.getItem('token')
				const response = await fetch(`${API_BASE_URL}/users/me/avatar`, {
					method: 'PUT',
					headers: {
						'Authorization': `Bearer ${token}`
					},
					body: formData
				})

				if (response.ok) {
					const result = await response.json()
					updateProfileUI(result)
					alert('Аватар успешно обновлен')
				} else {
					throw new Error('Ошибка обновления аватара')
				}
			} catch (error) {
				console.error('Ошибка:', error)
				alert('Не удалось обновить аватар')
			}
		})

		// Обработчики кнопок изменения
		const emailButton = document.querySelector('.account-info-item button')
		emailButton.addEventListener('click', async () => {
			const newEmail = prompt('Введите новый email:')
			if (!newEmail) return

			try {
				const token = localStorage.getItem('token')
				const response = await fetch(`${API_BASE_URL}/users/me/email`, {
					method: 'PUT',
					headers: {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ email: newEmail })
				})

				if (response.ok) {
					const result = await response.json()
					updateProfileUI(result)
					alert('Email успешно обновлен')
				} else {
					throw new Error('Ошибка обновления email')
				}
			} catch (error) {
				console.error('Ошибка:', error)
				alert('Не удалось обновить email')
			}
		})

		const passwordButton = document.querySelector('.password-info button')
		passwordButton.addEventListener('click', async () => {
			const oldPassword = prompt('Введите текущий пароль:')
			if (!oldPassword) return
			
			const newPassword = prompt('Введите новый пароль:')
			if (!newPassword) return

			try {
				const token = localStorage.getItem('token')
				const response = await fetch(`${API_BASE_URL}/users/me/password`, {
					method: 'PUT',
					headers: {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						old_password: oldPassword,
						new_password: newPassword
					})
				})

				if (response.ok) {
					alert('Пароль успешно обновлен')
				} else {
					throw new Error('Ошибка обновления пароля')
				}
			} catch (error) {
				console.error('Ошибка:', error)
				alert('Не удалось обновить пароль')
			}
		})
	}

	// Вызываем функции при загрузке страницы
	document.addEventListener('DOMContentLoaded', () => {
		// Проверяем, находимся ли мы на странице профиля
		if (window.location.pathname.includes('profile')) {
			const token = localStorage.getItem('token');
			if (token) {
				fetchUserProfile();
				initializeProfileEditors();
			} else {
				// Если нет токена, перенаправляем на главную
				window.location.href = '/';
			}
		}
	});
})
