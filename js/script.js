// Базовый URL API через Nginx
const API_BASE_URL = 'https://chupep.ru/api'

document.addEventListener('DOMContentLoaded', function () {
    // Вкладки профиля (если есть)
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    tabs.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target;
            tabs.forEach(b => b.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(target)?.classList.add('active');
        });
    });

    // Мобильное меню (универсально)
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn') || document.getElementById('mobileMenuBtn');
    const mobileMenu = document.querySelector('.mobile-menu') || document.getElementById('mobileMenu');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileMenu.classList.toggle('active');
        });
    }
    if (mobileMenuClose && mobileMenu) {
        mobileMenuClose.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
        });
    }

    // Закрытие меню при клике вне меню
    document.addEventListener('click', (e) => {
        if (mobileMenu && mobileMenu.classList.contains('active') &&
            !mobileMenu.contains(e.target) &&
            e.target !== mobileMenuBtn) {
            mobileMenu.classList.remove('active');
        }
    });

    // Закрытие мобильного меню по клику на любую кнопку меню
    if (mobileMenu) {
        mobileMenu.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
            });
        });
    }

    // Модальные окна регистрации/авторизации
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const loginMenu = document.getElementById('loginMenu');
    const registrationMenu = document.getElementById('registrationMenu');
    const closeButtons = document.querySelectorAll('.closeBtn');

    function openMenu(menu) {
        closeAllMenus();
        menu.classList.add('active');
        menu.classList.remove('hidden');
    }

    function closeMenu(menu) {
        menu.classList.remove('active');
        menu.classList.add('hidden');
    }

    function closeAllMenus() {
        loginMenu?.classList.remove('active');
        loginMenu?.classList.add('hidden');
        registrationMenu?.classList.remove('active');
        registrationMenu?.classList.add('hidden');
    }

    loginBtn?.addEventListener('click', () => openMenu(loginMenu));
    registerBtn?.addEventListener('click', () => openMenu(registrationMenu));

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            closeMenu(button.closest('.modal'));
        });
    });

    window.addEventListener('click', event => {
        if (event.target.classList.contains('modal')) {
            closeMenu(event.target);
        }
    });

    // Показ/скрытие пароля
    const toggleButtons = document.querySelectorAll('.togglePassword');
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', function () {
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

    // Кнопки регистрации/авторизации в мобильном меню
    document.getElementById('registerBtnMobile')?.addEventListener('click', () => {
        openMenu(registrationMenu);
        mobileMenu?.classList.remove('active');
    });
    document.getElementById('loginBtnMobile')?.addEventListener('click', () => {
        openMenu(loginMenu);
        mobileMenu?.classList.remove('active');
    });

    // Регистрация
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const username = document.getElementById('regUsername').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('regConfirmPassword').value;

            if (password !== confirmPassword) {
                alert('Пароли не совпадают');
                return;
            }

            try {
                const res = await fetch(`${API_BASE_URL}/new_user`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        username,
                        email,
                        password,
                    }),
                });

                const text = await res.text();
                let result;
                try {
                    result = text ? JSON.parse(text) : {};
                } catch (e) {
                    result = { detail: text };
                }

                if (res.ok) {
                    alert(`Пользователь ${result.username} успешно зарегистрирован`);
                    closeAllMenus();
                    openMenu(loginMenu);
                } else {
                    const errorMessage = result.detail || text || 'Неизвестная ошибка';
                    alert(`Ошибка регистрации: ${errorMessage}`);
                }
            } catch (err) {
                alert(`Ошибка регистрации: ${err.message}`);
            }
        });
    }

    // Авторизация
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;

            try {
                const res = await fetch(`${API_BASE_URL}/token`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        Accept: 'application/json',
                    },
                    credentials: 'include',
                    body: new URLSearchParams({
                        username,
                        password,
                    }),
                });

                const text = await res.text();
                let result;
                try {
                    result = text ? JSON.parse(text) : {};
                } catch (err) {
                    result = { detail: text };
                }

                if (res.ok) {
                    localStorage.setItem('token', result.access_token);
                    alert('Вход выполнен успешно');
                    closeAllMenus();
                    window.location.href = 'profile.html';
                } else {
                    alert(`Ошибка авторизации: ${result.detail || text}`);
                }
            } catch (err) {
                alert(`Ошибка авторизации: ${err.message}`);
            }
        });
    }
}); 