
function updateTimer() {
    const [time, hr, mn, sc] = [".timer", ".th", ".tm", ".ts"].map(selector => document.querySelector(selector));
    
  
time.innerHTML = 
`Ends in <span class="time th">02</span>:
<span class="time tm">00</span>:
<span class="time ts">00</span> ❯
    `;
           
}

updateTimer();

let hr = document.querySelector(".th");
let mn = document.querySelector(".tm");
let sc = document.querySelector(".ts");
 
 
let hour = 2;
let minutes = 0;
let seconds = 0;

let timer = setInterval(() => {

     seconds -= 1;
      
    if (seconds < 0) {
        seconds = 59;
        minutes -= 1;
    }

    if (minutes < 0) {
        minutes = 59;
        hour -= 1;
    }

    if (hour < 0) {
        clearInterval(timer);
        console.log("Countdown finished!");
        return;
    }
    
    hr.textContent = String(hour).padStart(2, '0');
    mn.textContent = String(minutes).padStart(2, '0');
    sc.textContent = String(seconds).padStart(2, '0')
    
 
}, 1000);