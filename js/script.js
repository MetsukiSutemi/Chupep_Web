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
})
