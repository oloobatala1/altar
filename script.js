document.addEventListener("DOMContentLoaded", async () => {
    const saintForm = document.getElementById("saint-form");
    const saintsContainer = document.getElementById("saints-container");
    const candlesContainer = document.getElementById("candles-container");
    const totalContainer = document.getElementById("total-container");
    const logContainer = document.getElementById("log-container");

    let saints = [];
    let candles = [];
    let totalCandles = {};

    // Registrar Santo
    saintForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("saint-name").value;
        const image = document.getElementById("saint-image").value;
        const description = document.getElementById("saint-description").value;

        try {
            await addDoc(collection(db, "saints"), {
                name,
                image,
                description,
                candles: 0
            });
        } catch (e) {
            console.error("Error adding document: ", e);
        }
        saintForm.reset();
    });

    // Obtener y renderizar Santos
    const q = query(collection(db, "saints"));
    onSnapshot(q, (querySnapshot) => {
        saints = [];
        querySnapshot.forEach((doc) => {
            saints.push({ id: doc.id, ...doc.data() });
        });
        renderSaints();
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

            saintCard.querySelector(".light-candle").addEventListener("click", async () => {
                const message = saintCard.querySelector(".message-input").value;
                await lightCandle(saint, message);
                saintCard.querySelector(".message-input").value = ""; // Limpia el textarea después de enviar
            });

            saintCard.querySelector(".remove-saint").addEventListener("click", async () => {
                await deleteDoc(doc(db, "saints", saint.id));
            });

            saintsContainer.appendChild(saintCard);
        });
    }

    // Encender Vela
    async function lightCandle(saint, message) {
        const endTime = new Date().getTime() + 8 * 60 * 60 * 1000; // 8 horas
        try {
            await addDoc(collection(db, "candles"), {
                saintId: saint.id,
                message,
                endTime
            });
            const saintRef = doc(db, "saints", saint.id);
            await updateDoc(saintRef, {
                candles: saint.candles + 1
            });
        } catch (e) {
            console.error("Error adding candle: ", e);
        }
    }

    // Obtener y renderizar Velas Encendidas
    const candleQuery = query(collection(db, "candles"));
    onSnapshot(candleQuery, (querySnapshot) => {
        candles = [];
        querySnapshot.forEach((doc) => {
            candles.push({ id: doc.id, ...doc.data() });
        });
        renderCandles();
    });

    // Renderizar Velas Encendidas
    function renderCandles() {
        candlesContainer.innerHTML = "";
        const now = new Date().getTime();

        candles = candles.filter(candle => candle.endTime > now);
        candles.forEach((candle) => {
            const saint = saints.find(s => s.id === candle.saintId);
            const remainingTime = candle.endTime - now;
            const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

            const candleCard = document.createElement("div");
            candleCard.classList.add("candle-card");
            candleCard.innerHTML = `
                <img src="https://media1.tenor.com/m/g05fxbMPwLAAAAAC/vela-r%C3%A1pido.gif" alt="Vela Encendida" class="candle-gif">
                <h3>Vela dedicada a ${saint.name}</h3>
                <img src="${saint.image}" alt="${saint.name}" class="saint-image">
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
