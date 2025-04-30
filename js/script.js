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
})

// Получение данных пользователя
function fetchUserProfile() {
	const token = localStorage.getItem('token')
	if (!token) {
		window.location.href = '/'
	}
}

// Вызываем функции при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
	// Проверяем, находимся ли мы на странице профиля
	if (window.location.pathname.includes('profile')) {
		const token = localStorage.getItem('token');
		if (token) {
			fetchUserProfile(token)
		} else {
			window.location.href = '/'
		}
	}
})

//отображение данных пользователя на странице профиля при обновлении страницы
async function displayUserProfile() {
	try {
		const token = localStorage.getItem('token')
		if (!token) {
			window.location.href = '/'
			return
		}

		const res = await fetch(`${API_BASE_URL}/me`, {
			...baseRequestOptions,
			headers: {
				...baseRequestOptions.headers,
				'Authorization': `Bearer ${token}`
			}
		})

		const text = await res.text()
		let userData
		try {
			userData = text ? JSON.parse(text) : {}
		} catch (err) {
			alert('Ошибка парсинга JSON: ' + err)
			userData = { detail: text }
		}

		if (!res.ok) {
			throw new Error(`Ошибка получения данных профиля: ${userData.detail || text}`)
		}

		// Обновляем информацию на странице
		const accountInfo = document.querySelector('.account-info-item p')
		if (accountInfo) {
			accountInfo.textContent = userData.email || 'Email не указан'
		}

		const usernameElement = document.querySelector('.profile-username')
		if (usernameElement) {
			usernameElement.textContent = userData.username || 'Пользователь'
		}

	} catch (err) {
		alert('Ошибка при отображении профиля: ' + err.message)
		if (err.message.includes('Failed to fetch')) {
			alert('Ошибка соединения с сервером')
		} else {
			alert(err.message)
		}
		window.location.href = '/'
	}
}


// Вызываем функцию при загрузке страницы профиля
if (window.location.pathname.includes('profile')) {
	displayUserProfile()
}



//изменение емейла
async function updateEmail(newEmail) {
	const token = localStorage.getItem('token')
	if (!token) {
		window.location.href = '/'
	}

	try {
		const res = await fetch(`${API_BASE_URL}/me/email`, {
			...baseRequestOptions,
			method: 'POST',
			headers: {
				...baseRequestOptions.headers,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ email: newEmail }),
		})
	} catch (err) {
		console.error('Error updating email:', err)
		alert('Ошибка при изменении email')
	}
}

// Обработка выхода из аккаунта
function logout() {
	localStorage.removeItem('token')
	window.location.href = '/'
}

// Добавляем обработчик для кнопки выхода
const logoutBtn = document.querySelector('#exit button')
if (logoutBtn) {
	logoutBtn.addEventListener('click', logout)
}

