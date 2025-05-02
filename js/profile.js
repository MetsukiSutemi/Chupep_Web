document.addEventListener('DOMContentLoaded', function () {
    // Вкладки профиля
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

    // Мобильное меню профиля
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
    document.addEventListener('click', (e) => {
        if (mobileMenu && mobileMenu.classList.contains('active') &&
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

    // Здесь может быть остальная логика профиля (например, загрузка данных пользователя)
}); 