document.addEventListener("DOMContentLoaded", () => {
    const saintForm = document.getElementById("saint-form");
    const saintsContainer = document.getElementById("saints-container");
    const candlesContainer = document.getElementById("candles-container");
    const totalContainer = document.getElementById("total-container");
    const logContainer = document.getElementById("log-container");

    let saints = [];
    let candles = [];
    let totalCandles = {};

    // Registrar Santo
    saintForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("saint-name").value;
        const image = document.getElementById("saint-image").value;
        const description = document.getElementById("saint-description").value;

        const saint = { name, image, description, candles: 0 };
        saints.push(saint);
        renderSaints();
        saintForm.reset();
    });

    // Renderizar Santos Registrados
    function renderSaints() {
    saintsContainer.innerHTML = "";
    saints.forEach((saint, index) => {
        const saintCard = document.createElement("div");
        saintCard.classList.add("saint-card");
        saintCard.innerHTML = `
            <h3>${saint.name}</h3>
            <img src="${saint.image}" alt="${saint.name}">
            <p>${saint.description}</p>
            <textarea placeholder="Escribe tu Agradecimiento" class="message-input" rows="4" cols="50"></textarea>
            <img src="https://lh3.googleusercontent.com/d/1-BxFIRq0PXU0O7p_n1YlIMjn84g8cBEg" class="candle-image">
            <button class="light-candle">Encender Vela</button>
            <button class="remove-saint">Remover Santo</button>
        `;

        saintCard.querySelector(".light-candle").addEventListener("click", () => {
            const message = saintCard.querySelector(".message-input").value;
            lightCandle(saint, message);
            saintCard.querySelector(".message-input").value = ""; // Limpia el textarea después de enviar
        });

        saintCard.querySelector(".remove-saint").addEventListener("click", () => {
            saints.splice(index, 1);
            renderSaints();
            renderTotalCandles();
        });

        saintsContainer.appendChild(saintCard);
    });
}


    // Encender Vela
    function lightCandle(saint, message) {
        const candle = {
            saint,
            message,
            endTime: new Date().getTime() + 8 * 60 * 60 * 1000 // 8 horas
        };
        candles.push(candle);
        saint.candles++;
        renderCandles();
        renderTotalCandles();
        renderLog(saint, message);
    }

    // Renderizar Velas Encendidas
    function renderCandles() {
        candlesContainer.innerHTML = "";
        const now = new Date().getTime();

        candles = candles.filter(candle => candle.endTime > now);
        candles.forEach((candle, index) => {
            const remainingTime = candle.endTime - now;
            const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

            const candleCard = document.createElement("div");
            candleCard.classList.add("candle-card");
            candleCard.innerHTML = `
                <img src="https://media1.tenor.com/m/g05fxbMPwLAAAAAC/vela-r%C3%A1pido.gif" alt="Vela Encendida" class="candle-gif"> <!-- Sustituye el path del gif -->
                <h3>Vela dedicada a ${candle.saint.name}</h3>
                <img src="${candle.saint.image}" alt="${candle.saint.name}" class="saint-image">
                <p>${candle.message}</p>
                <p class="remaining-time">Duración restante de la Vela:<br> ${hours}h ${minutes}m ${seconds}s</p>
            `;

            candlesContainer.appendChild(candleCard);
        });

        if (candles.length > 0) {
            setTimeout(renderCandles, 1000);
        }
    }

    // Renderizar Total de Velas Encendidas
    function renderTotalCandles() {
        totalContainer.innerHTML = "";
        saints.forEach(saint => {
            if (saint.candles > 0) {
                const totalCard = document.createElement("div");
                totalCard.classList.add("total-card");
                totalCard.innerHTML = `
                    <img src="${saint.image}" alt="${saint.name}">
                    <p>${saint.name}</p>
                    <p>Velas encendidas: ${saint.candles}</p>
                `;
                totalContainer.appendChild(totalCard);
            }
        });
    }

    // Registrar Log de Velas Encendidas
    function renderLog(saint, message) {
        const logItem = document.createElement("li");
        const date = new Date();
        logItem.innerHTML = `
            <p>${date.toLocaleDateString()} - ${saint.name} - ${message}</p>
        `;
        logContainer.appendChild(logItem);
    }
});
