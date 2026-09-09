/* =========================================================
   XPERTS CROP
   STATE + DISTRICT + WEATHER + CROP + SCAN
========================================================= */


let selectedLanguage = "English";

let selectedState = "";

let selectedDistrict = "";

let selectedCrop = "";

let uploadedImage = "";



/* =========================================================
   INDIA STATES + DISTRICTS
========================================================= */

/*
   The dataset is loaded from a JSON file containing
   India's States/UTs and their districts.

   The data source is based on the Government of India's
   Integrated Government Online Directory.
*/

const DISTRICT_DATA_URL =
    "https://raw.githubusercontent.com/KTBsomen/Indian-state-district-json/main/india-states-districts-latest.json";


let indiaData = [];



/* =========================================================
   START DIAGNOSIS
========================================================= */

function startDiagnosis() {

    hideAll();

    document.getElementById("language").style.display =
        "block";

}



/* =========================================================
   LANGUAGE
========================================================= */

function selectLanguage(language) {

    selectedLanguage = language;

    hideAll();

    document.getElementById("state").style.display =
        "block";

    loadStates();

}



/* =========================================================
   LOAD ALL STATES / UTs
========================================================= */

async function loadStates() {

    const stateSelect =
        document.getElementById("stateSelect");

    stateSelect.innerHTML = `
        <option value="">
            -- Loading States / UTs... --
        </option>
    `;


    try {

        const response =
            await fetch(DISTRICT_DATA_URL);

        if (!response.ok) {

            throw new Error(
                "Unable to load state data"
            );

        }


        indiaData =
            await response.json();


        stateSelect.innerHTML = `
            <option value="">
                -- Select State / UT --
            </option>
        `;


        indiaData
            .sort((a, b) =>
                a.state.localeCompare(b.state)
            )
            .forEach(item => {

                const option =
                    document.createElement("option");

                option.value =
                    item.state;

                option.textContent =
                    item.state;

                stateSelect.appendChild(option);

            });


    } catch (error) {

        console.error(error);

        stateSelect.innerHTML = `
            <option value="">
                -- Unable to load states --
            </option>
        `;

        alert(
            "State and district data could not be loaded. Please check your internet connection."
        );

    }

}



/* =========================================================
   SELECT STATE
========================================================= */

function selectState() {

    const stateSelect =
        document.getElementById("stateSelect");


    selectedState =
        stateSelect.value;


    if (!selectedState) {

        alert(
            "Please select your State / UT."
        );

        return;

    }


    const selectedData =
        indiaData.find(
            item =>
                item.state === selectedState
        );


    const districtSelect =
        document.getElementById("districtSelect");


    districtSelect.innerHTML = `
        <option value="">
            -- Select District --
        </option>
    `;


    if (
        selectedData &&
        Array.isArray(selectedData.districts)
    ) {

        const districts =
            [...selectedData.districts]
                .sort((a, b) =>
                    a.localeCompare(b)
                );


        districts.forEach(
            district => {

                const option =
                    document.createElement("option");

                option.value =
                    district;

                option.textContent =
                    district;

                districtSelect.appendChild(
                    option
                );

            }
        );

    }


    hideAll();

    document.getElementById("district").style.display =
        "block";

}



/* =========================================================
   SELECT DISTRICT
========================================================= */

function selectDistrict() {

    const districtSelect =
        document.getElementById("districtSelect");


    selectedDistrict =
        districtSelect.value;


    if (!selectedDistrict) {

        alert(
            "Please select your district."
        );

        return;

    }


    hideAll();

    document.getElementById("weather").style.display =
        "block";


    document.getElementById("weatherLocation").textContent =
        selectedDistrict + ", " + selectedState;


    getWeather();

}



/* =========================================================
   WEATHER
========================================================= */

async function getWeather() {

    const status =
        document.getElementById("weatherStatus");


    status.textContent =
        "Finding location...";


    try {

        /*
           First convert district + state
           into latitude and longitude.
        */

        const locationQuery =
            encodeURIComponent(
                selectedDistrict +
                ", " +
                selectedState +
                ", India"
            );


        const geoURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${locationQuery}&count=1&language=en&format=json`;


        const geoResponse =
            await fetch(geoURL);


        const geoData =
            await geoResponse.json();


        if (
            !geoData.results ||
            geoData.results.length === 0
        ) {

            throw new Error(
                "Location not found"
            );

        }


        const location =
            geoData.results[0];


        const latitude =
            location.latitude;

        const longitude =
            location.longitude;


        status.textContent =
            "Loading current weather...";


        /*
           Get current weather
        */

        const weatherURL =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,rain&timezone=auto`;


        const weatherResponse =
            await fetch(weatherURL);


        const weatherData =
            await weatherResponse.json();


        const current =
            weatherData.current;


        document.getElementById(
            "weatherTemperature"
        ).textContent =
            Math.round(
                current.temperature_2m
            ) + "°C";


        document.getElementById(
            "weatherHumidity"
        ).textContent =
            current.relative_humidity_2m +
            "%";


        document.getElementById(
            "weatherWind"
        ).textContent =
            current.wind_speed_10m +
            " km/h";


        document.getElementById(
            "weatherRain"
        ).textContent =
            current.rain +
            " mm";


        const condition =
            getWeatherCondition(
                current.weather_code
            );


        document.getElementById(
            "weatherCondition"
        ).textContent =
            condition.text;


        document.getElementById(
            "weatherIcon"
        ).textContent =
            condition.icon;


        status.textContent =
            "✅ Current weather loaded successfully.";


    } catch (error) {

        console.error(error);


        document.getElementById(
            "weatherCondition"
        ).textContent =
            "Weather unavailable";


        document.getElementById(
            "weatherTemperature"
        ).textContent =
            "--°C";


        document.getElementById(
            "weatherHumidity"
        ).textContent =
            "--";


        document.getElementById(
            "weatherWind"
        ).textContent =
            "--";


        document.getElementById(
            "weatherRain"
        ).textContent =
            "--";


        document.getElementById(
            "weatherIcon"
        ).textContent =
            "🌤️";


        status.textContent =
            "Weather could not be loaded. You can still continue.";

    }

}



/* =========================================================
   WEATHER CONDITIONS
========================================================= */

function getWeatherCondition(code) {

    if (code === 0) {

        return {
            text: "Clear Sky",
            icon: "☀️"
        };

    }


    if (
        code === 1 ||
        code === 2
    ) {

        return {
            text: "Partly Cloudy",
            icon: "🌤️"
        };

    }


    if (code === 3) {

        return {
            text: "Cloudy",
            icon: "☁️"
        };

    }


    if (
        code >= 45 &&
        code <= 48
    ) {

        return {
            text: "Fog",
            icon: "🌫️"
        };

    }


    if (
        code >= 51 &&
        code <= 67
    ) {

        return {
            text: "Rain",
            icon: "🌧️"
        };

    }


    if (
        code >= 71 &&
        code <= 77
    ) {

        return {
            text: "Snow",
            icon: "❄️"
        };

    }


    if (
        code >= 80 &&
        code <= 82
    ) {

        return {
            text: "Rain Showers",
            icon: "🌦️"
        };

    }


    if (
        code >= 95
    ) {

        return {
            text: "Thunderstorm",
            icon: "⛈️"
        };

    }


    return {

        text: "Unknown",

        icon: "🌤️"

    };

}



/* =========================================================
   CONTINUE TO CROP
========================================================= */

function continueToCrop() {

    hideAll();

    document.getElementById("crop").style.display =
        "block";

}



/* =========================================================
   SELECT CROP
========================================================= */

function selectCrop() {

    const cropSelect =
        document.getElementById("cropSelect");


    selectedCrop =
        cropSelect.value;


    if (!selectedCrop) {

        alert(
            "Please select a crop."
        );

        return;

    }


    hideAll();

    document.getElementById("upload").style.display =
        "block";

}



/* =========================================================
   IMAGE PREVIEW
========================================================= */

function previewImage() {

    const file =
        document.getElementById(
            "cropImage"
        ).files[0];


    if (!file) {

        return;

    }


    const reader =
        new FileReader();


    reader.onload =
        function(event) {

            uploadedImage =
                event.target.result;


            const image =
                document.getElementById(
                    "imagePreview"
                );


            image.src =
                uploadedImage;


            image.style.display =
                "block";

        };


    reader.readAsDataURL(file);

}



/* =========================================================
   ANALYZE CROP
========================================================= */

function analyzeCrop() {

    const file =
        document.getElementById(
            "cropImage"
        ).files[0];


    if (!file) {

        alert(
            "Please upload a crop image first."
        );

        return;

    }


    const scanContainer =
        document.querySelector(
            ".scan-container"
        );


    scanContainer.classList.add(
        "scanning"
    );


    /*
       Simulated scan.

       Later this can be connected to
       an actual AI crop-disease model.
    */

    setTimeout(
        function() {

            scanContainer.classList.remove(
                "scanning"
            );


            showResult();

        },
        3500
    );

}



/* =========================================================
   SHOW RESULT
========================================================= */

function showResult() {

    hideAll();


    document.getElementById("result").style.display =
        "block";


    document.getElementById(
        "resultState"
    ).textContent =
        selectedState;


    document.getElementById(
        "resultDistrict"
    ).textContent =
        selectedDistrict;


    document.getElementById(
        "resultCrop"
    ).textContent =
        selectedCrop;


    document.getElementById(
        "resultImage"
    ).src =
        uploadedImage;


    /*
       Demo result.

       Replace this section later with
       your actual AI prediction.
    */

    const demoDisease =
        getDemoDisease(selectedCrop);


    document.getElementById(
        "resultDisease"
    ).textContent =
        demoDisease.disease;


    document.getElementById(
        "resultConfidence"
    ).textContent =
        demoDisease.confidence;


    document.getElementById(
        "resultRisk"
    ).textContent =
        demoDisease.risk;


    document.getElementById(
        "resultRecommendation"
    ).textContent =
        demoDisease.recommendation;

}



/* =========================================================
   DEMO DISEASE DATA
========================================================= */

function getDemoDisease(crop) {

    const diseases = {

        Apple: {

            disease: "Apple Scab",

            confidence: "92%",

            risk: "Medium",

            recommendation:
                "Remove infected leaves and improve air circulation around the crop."

        },


        Blueberry: {

            disease: "Leaf Spot",

            confidence: "89%",

            risk: "Medium",

            recommendation:
                "Remove affected leaves and avoid excessive moisture on foliage."

        },


        Cherry: {

            disease: "Leaf Spot",

            confidence: "90%",

            risk: "Medium",

            recommendation:
                "Remove infected leaves and maintain good field sanitation."

        },


        Corn: {

            disease: "Corn Leaf Blight",

            confidence: "91%",

            risk: "High",

            recommendation:
                "Remove heavily infected plant material and monitor nearby plants."

        },


        Grape: {

            disease: "Grape Leaf Disease",

            confidence: "88%",

            risk: "Medium",

            recommendation:
                "Improve ventilation and remove severely infected leaves."

        },


        Orange: {

            disease: "Citrus Leaf Disease",

            confidence: "87%",

            risk: "Medium",

            recommendation:
                "Remove affected leaves and inspect the plant regularly."

        },


        Peach: {

            disease: "Peach Leaf Curl",

            confidence: "90%",

            risk: "Medium",

            recommendation:
                "Remove infected leaves and maintain proper orchard sanitation."

        },


        Pepper: {

            disease: "Pepper Leaf Spot",

            confidence: "88%",

            risk: "Medium",

            recommendation:
                "Avoid overhead watering and remove infected plant material."

        },


        Potato: {

            disease: "Potato Early Blight",

            confidence: "93%",

            risk: "High",

            recommendation:
                "Remove infected leaves and avoid prolonged leaf wetness."

        },


        Raspberry: {

            disease: "Raspberry Leaf Spot",

            confidence: "86%",

            risk: "Medium",

            recommendation:
                "Remove affected foliage and improve air circulation."

        },


        Soybean: {

            disease: "Soybean Leaf Disease",

            confidence: "88%",

            risk: "Medium",

            recommendation:
                "Monitor crop regularly and remove severely affected plants."

        },


        Squash: {

            disease: "Powdery Mildew",

            confidence: "94%",

            risk: "High",

            recommendation:
                "Improve airflow and avoid excessive humidity around leaves."

        },


        Strawberry: {

            disease: "Leaf Spot",

            confidence: "89%",

            risk: "Medium",

            recommendation:
                "Remove infected leaves and keep foliage dry."

        },


        Tomato: {

            disease: "Tomato Leaf Disease",

            confidence: "92%",

            risk: "High",

            recommendation:
                "Remove infected leaves and avoid overhead irrigation."

        }

    };


    return (
        diseases[crop] ||
        {

            disease: "Possible Leaf Disease",

            confidence: "85%",

            risk: "Medium",

            recommendation:
                "Inspect the crop carefully and consult an agricultural expert if symptoms continue."

        }
    );

}



/* =========================================================
   HIDE ALL SECTIONS
========================================================= */

function hideAll() {

    const sections = [

        "home",
        "language",
        "state",
        "district",
        "weather",
        "crop",
        "upload",
        "result"

    ];


    sections.forEach(
        id => {

            const element =
                document.getElementById(id);


            if (element) {

                element.style.display =
                    "none";

            }

        }
    );

}



/* =========================================================
   INITIAL STATE
========================================================= */

window.addEventListener(
    "DOMContentLoaded",
    function() {

        hideAll();

        document.getElementById(
            "home"
        ).style.display =
            "block";

    }
);
``
