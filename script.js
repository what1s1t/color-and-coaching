// script.js - 웹사이트의 동적인 기능을 처리합니다.

// Mobile Menu Toggle 기능
const menuButton = document.getElementById('menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = mobileMenu.querySelectorAll('a');

if (menuButton && mobileMenu) {
    // 모바일 메뉴 표시/숨기기 토글
    menuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // 모바일 메뉴 링크 클릭 시 메뉴 닫기
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    });
}

// Contact Form Submission Handling (alert() 대신 Custom Message Box 사용)
const form = document.getElementById('contact-form');
const messageBox = document.getElementById('message-box');

if (form && messageBox) {
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // 기본 폼 제출 방지

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const type = document.getElementById('type').value;

        // 필수 필드 간편 유효성 검사
        if (name && name.length > 1 && email && type) {
            
            // 성공 메시지 표시
            messageBox.classList.remove('hidden', 'bg-red-100', 'text-red-700');
            messageBox.classList.add('bg-warm-secondary', 'text-gray-800'); 
            messageBox.textContent = `${name}님, 코칭 문의가 성공적으로 접수되었습니다. 곧 연락드리겠습니다!`;
            
            // 폼 초기화 및 메시지 박스 숨기기 (3초 후)
            setTimeout(() => {
                form.reset();
                messageBox.classList.add('hidden');
                messageBox.classList.remove('bg-warm-secondary', 'text-gray-800');
            }, 3000);
        } else {
            // 오류 메시지 표시
            messageBox.classList.remove('hidden', 'bg-warm-secondary', 'text-gray-800');
            messageBox.classList.add('bg-red-100', 'text-red-700');
            messageBox.textContent = '모든 필수 정보를 정확하게 입력해 주세요.';
        }
    });
}