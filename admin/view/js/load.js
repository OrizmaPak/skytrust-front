let percentage = 0;
const loader = document.querySelector('.loader2');
const percentageText = document.querySelector('.loader3');

function updateLoader() {
  // Adjust speed randomly between 10ms and 200ms for fluctuating effect
  const speed = Math.random() * (200 - 10) + 10;
  
  // Increase the percentage more slowly after reaching 80%
  percentage += percentage < 80 ? Math.random() * 3 + 1 : 1;
  loader.style.backgroundPosition = `${percentage}% 0`;
  percentageText.textContent = `${Math.floor(percentage)}%`;

  // Add "pop" effect
  percentageText.classList.add('pop');
  setTimeout(() => percentageText.classList.remove('pop'), 100);

  // Stop at 20% if no internet connection
  if (!navigator.onLine && percentage >= 20) {
    clearInterval(intervalId);
    percentage = 20; // Set percentage to 20% if stopped
    percentageText.textContent = `20% - Waiting for Connection...`;
    return;
  }

  // End loader at 100%
  if (percentage >= 100) {
    clearInterval(intervalId);
    window.location.href = './login.html';
  }
}

// Start loader with fluctuating speed
let intervalId = setInterval(updateLoader, 50); // Initial speed

// Cache resources
const linksToCache = [
  './css/index.css',
  './css/css_vanilla.css',
];

linksToCache.forEach((link) => {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', link, true);
  xhr.send();
});
