let container = document.querySelector(".resultsContainer");
      
function startSearch(event) {
    event.preventDefault();
    let input = document.querySelector("#search");
    let value = input.value.trim().toLowerCase();
    
   

    if (value) {
        setTimeout(() => {
            container.innerHTML = "";
            search(value);
        }, 300);
    } else {
    container.innerHTML = "";
    }
} 



function search(keyword) {
    let foundMatch = false;

    data.forEach((product) => {
        let item = product.tags;
        let matched = false;

        // Check if any tag matches the keyword
        for (let i = 0; i < item.length; i++) {
            if (item[i].toLowerCase().includes(keyword)) {
                matched = true;
                break;
            }
        }

     
        if (!matched && product.name.toLowerCase().includes(keyword)) {
            matched = true;
        }

     
        if (matched) {
            foundMatch = true;
            let itemFound = document.createElement("div");
            itemFound.classList.add("results");
            let itemName = document.createElement("span");
            itemFound.classList.add("found");
            itemName.textContent = product.name;
            let navigate = document.createElement("span");
           navigate.classList.add("go");
           navigate.textContent = "❯";            

           itemFound.appendChild(itemName);
           itemFound.appendChild(navigate);
           container.appendChild(itemFound);
                    
          /* ↓↓↓ */ itemFound.addEventListener("click", () => {
        
        let itemLocation = data.find((item) => item.id === product.id);
        if (itemLocation) {        
           showProduct(itemLocation);
                }
            });         
         /* ↑↑↑↑ */  
          
        }
    });

    // If no match is found, show a message
    if (!foundMatch) {
        container.innerHTML = "<p>No results found.</p>";
    }
}