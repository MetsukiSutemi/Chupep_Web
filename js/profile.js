const API_BASE_URL = 'http://127.0.0.1:8000'

let isInitialized = false;

// Основной обработчик загрузки страницы
document.addEventListener('DOMContentLoaded', function() {
	if (isInitialized) return;
	isInitialized = true;
	
	console.log('Страница загружена');
	
	// Инициализация вкладок профиля
	const tabs = document.querySelectorAll('.tab-btn');
	const contents = document.querySelectorAll('.tab-content');

	tabs.forEach(btn => {
		btn.addEventListener('click', () => {
			const target = btn.dataset.target;
			tabs.forEach(b => b.classList.remove('active'));
			contents.forEach(c => c.classList.remove('active'));
			btn.classList.add('active');
			document.getElementById(target).classList.add('active');
		});
	});

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

	// Инициализация кнопки выхода
	const exitButton = document.querySelector('.tab-btn-exit');
	if (exitButton) {
		exitButton.addEventListener('click', function() {
			clearAvatarUrl();
			localStorage.removeItem('token');
			window.location.href = '../index.html';
		});
	}

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
				'Authorization': `Bearer ${token}`,
				'Accept': 'application/json'
			},
			credentials: 'include'
		});

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

			// Обновляем информацию в настройках
			const accountInfoItem = document.querySelector('.account-info-item p');
			if (accountInfoItem) {
				accountInfoItem.textContent = userInfo.email || 'Email не указан';
			}
		} else {
			const errorMessage = result.detail || text || 'Неизвестная ошибка';
			alert(`Ошибка получения данных: ${errorMessage}`);
			window.location.href = '../index.html';
		}
	} catch (err) {
		alert(`Ошибка получения данных: ${err.message}`);
		window.location.href = '../index.html';
	}
}

// Функция для получения и отображения аватара пользователя
async function getUserAvatar() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Токен не найден');
            throw new Error('Токен не найден');
        }

        console.log('Получение аватара...');
        // Добавляем timestamp для предотвращения кэширования
        const timestamp = new Date().getTime();
        const res = await fetch(`${API_BASE_URL}/user/get_avatar?t=${timestamp}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });

        console.log('Статус ответа:', res.status);
        
        if (res.ok) {
            const blob = await res.blob();
            console.log('Получен blob:', blob);
            const imageUrl = URL.createObjectURL(blob);
            console.log('Создан URL:', imageUrl);
            
            const avatarElement = document.getElementById('avatarImg');
            console.log('Найден элемент аватара:', avatarElement);
            
            if (avatarElement) {
                // Очищаем старый URL перед установкой нового
                if (avatarElement.src) {
                    URL.revokeObjectURL(avatarElement.src);
                }
                avatarElement.src = imageUrl;
                console.log('Аватар установлен');
            } else {
                console.error('Элемент аватара не найден');
            }
        } else {
            console.error('Ошибка получения аватара:', res.status);
            // Используем аватар по умолчанию при ошибке
            const defaultAvatarUrl = '../image/default-avatar.png';
            const avatarElement = document.getElementById('avatarImg');
            if (avatarElement) {
                avatarElement.src = defaultAvatarUrl;
                console.log('Установлен аватар по умолчанию');
            }
        }
    } catch (err) {
        console.error(`Ошибка при загрузке аватара: ${err.message}`);
        // Используем аватар по умолчанию при ошибке
        const defaultAvatarUrl = '../image/default-avatar.png';
        const avatarElement = document.getElementById('avatarImg');
        if (avatarElement) {
            avatarElement.src = defaultAvatarUrl;
            console.log('Установлен аватар по умолчанию из-за ошибки');
        }
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
    if (file) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/user/update_avatar`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
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
        } catch (err) {
            console.error('Ошибка при загрузке аватара:', err);
            alert('Произошла ошибка при загрузке аватара');
        }
    }
}





