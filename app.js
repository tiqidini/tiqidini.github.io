function updateDays() {
    const startDate = new Date('2022-02-24');
    const today = new Date();
    const diffTime = Math.abs(today - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const message = `Сьогодні ${diffDays} доба героїчного протистояння`;
    document.getElementById('message').textContent = message;
}

updateDays();
setInterval(updateDays, 60000); // Обновлять каждую минуту