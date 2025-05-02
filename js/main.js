document.addEventListener('DOMContentLoaded', function () {
    // Мобильное меню для главной страницы
    const mobileMenuBtnMain = document.getElementById('mobileMenuBtn');
    const mobileMenuMain = document.getElementById('mobileMenu');

    if (mobileMenuBtnMain && mobileMenuMain) {
        mobileMenuBtnMain.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileMenuMain.classList.toggle('active');
        });

        // Закрытие по клику вне меню
        document.addEventListener('click', (e) => {
            if (
                mobileMenuMain.classList.contains('active') &&
                !mobileMenuMain.contains(e.target) &&
                e.target !== mobileMenuBtnMain
            ) {
                mobileMenuMain.classList.remove('active');
            }
        });

        // Закрытие по клику на любую кнопку меню
        mobileMenuMain.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                mobileMenuMain.classList.remove('active');
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
        mobileMenuMain.classList.remove('active');
    });
    document.getElementById('loginBtnMobile')?.addEventListener('click', () => {
        openMenu(loginMenu);
        mobileMenuMain.classList.remove('active');
    });
}); 