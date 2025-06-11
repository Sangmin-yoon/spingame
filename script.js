// 룰렛 항목 정의
const items = [
    '1시간 무료이용권',
    '친구초대권',
    '도서할인권',
    '미팅룸 이용권',
    '우선주차권',
    '꽝, 한번더!',
    '음료수 한잔',
    '무료 커피'
];

// 캔버스와 컨텍스트 설정
const canvas = document.getElementById('rouletteCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const resultDisplay = document.getElementById('result');

// 캔버스 크기 설정
function resizeCanvas() {
    const container = canvas.parentElement;
    const size = Math.min(container.clientWidth, container.clientHeight);
    canvas.width = size;
    canvas.height = size;
}

// 룰렛 그리기
function drawRoulette() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    
    // 각 항목의 각도 계산
    const anglePerItem = (2 * Math.PI) / items.length;
    
    // 각 항목 그리기
    items.forEach((item, index) => {
        const startAngle = index * anglePerItem;
        const endAngle = (index + 1) * anglePerItem;
        
        // 섹터 그리기
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        
        // 섹터 색상 설정 (번갈아가며 다른 색상 사용)
        ctx.fillStyle = index % 2 === 0 ? '#FFD700' : '#FFA500';
        ctx.fill();
        
        // 테두리 그리기
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 텍스트 그리기
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + anglePerItem / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#000';
        ctx.font = 'bold 16px NexonGothic';
        ctx.fillText(item, radius - 20, 5);
        ctx.restore();
    });
}

// 룰렛 회전 애니메이션
let isSpinning = false;
let currentRotation = 0;
let targetRotation = 0;

function spinRoulette() {
    if (isSpinning) return;
    
    isSpinning = true;
    startButton.disabled = true;
    resultDisplay.textContent = '';
    
    // 랜덤한 각도 선택 (5바퀴 + 랜덤 각도)
    const randomIndex = Math.floor(Math.random() * items.length);
    const anglePerItem = (2 * Math.PI) / items.length;
    // targetAngle을 각 항목의 중앙에 오도록 조정
    // randomIndex * anglePerItem : 해당 항목의 시작 각도
    // anglePerItem / 2 : 해당 항목의 중앙 각도
    const targetAngle = randomIndex * anglePerItem + anglePerItem / 2;
    targetRotation = currentRotation + (5 * 2 * Math.PI) + targetAngle;
    
    // 애니메이션 시작 시간
    const startTime = performance.now();
    const duration = 5000; // 5초
    
    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 이징 함수 적용 (감속)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        currentRotation = easeOut * (targetRotation - currentRotation) + currentRotation;
        
        // 룰렛 다시 그리기
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(currentRotation);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        drawRoulette();
        ctx.restore();
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // 애니메이션 종료
            isSpinning = false;
            startButton.disabled = false;

            // 실제로 포인터가 가리키는 각도 계산
            let normalizedRotation = currentRotation % (2 * Math.PI);
            if (normalizedRotation < 0) normalizedRotation += 2 * Math.PI;
            const anglePerItem = (2 * Math.PI) / items.length;
            // 포인터가 가리키는 항목의 인덱스 계산 (항목 중앙 기준)
            const selectedIndex = Math.floor((normalizedRotation + (2 * Math.PI) - anglePerItem / 2) % (2 * Math.PI) / anglePerItem) % items.length;
            const result = items[selectedIndex];
            resultDisplay.textContent = `축하합니다! ${result}에 당첨되셨습니다!`;

            // 축하 효과
            if (result !== '꽝, 한번더!') {
                celebrate();
            }
        }
    }
    
    requestAnimationFrame(animate);
}

// 축하 효과 함수
function celebrate() {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // 폭죽 효과
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
    }, 250);
}

// 이벤트 리스너 설정
startButton.addEventListener('click', spinRoulette);
window.addEventListener('resize', () => {
    resizeCanvas();
    drawRoulette();
});

// 초기화
resizeCanvas();
drawRoulette(); 