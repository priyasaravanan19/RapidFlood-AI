/* =========================================================
   RAPIDFLOOD AI
   Dashboard JavaScript
========================================================= */


// =========================================================
// GLOBAL VARIABLES
// =========================================================

let beforeMap = null;
let afterMap = null;

let beforeMarker = null;
let afterMarker = null;


// =========================================================
// DOM ELEMENTS
// =========================================================

const locationInput = document.getElementById("location");
const dateInput = document.getElementById("floodDate");
const analyzeBtn = document.getElementById("analyzeBtn");

const initialState = document.getElementById("initialState");
const resultsSection = document.getElementById("resultsSection");

const resultLocation = document.getElementById("resultLocation");
const resultDate = document.getElementById("resultDate");

const affectedArea = document.getElementById("affectedArea");
const settlementCount = document.getElementById("settlementCount");
const roadCount = document.getElementById("roadCount");
const agricultureArea = document.getElementById("agricultureArea");

const settlementValue = document.getElementById("settlementValue");
const roadValue = document.getElementById("roadValue");
const agricultureValue = document.getElementById("agricultureValue");

const settlementProgress = document.getElementById("settlementProgress");
const roadProgress = document.getElementById("roadProgress");
const agricultureProgress = document.getElementById("agricultureProgress");

const processLocation = document.getElementById("processLocation");
const processDate = document.getElementById("processDate");


// =========================================================
// DATE - SET MAXIMUM TO TODAY
// =========================================================

const today = new Date();

const todayString =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");

dateInput.max = todayString;


// =========================================================
// NAVIGATION
// =========================================================

const navItems = document.querySelectorAll(".nav-item[data-section]");
const pageSections = document.querySelectorAll(".page-section");

navItems.forEach(item => {

    item.addEventListener("click", function(event) {

        event.preventDefault();

        const sectionId = this.dataset.section;

        // Remove active from all nav items
        navItems.forEach(nav => {
            nav.classList.remove("active");
        });

        // Activate selected nav item
        this.classList.add("active");

        // Hide all sections
        pageSections.forEach(section => {
            section.classList.remove("active-section");
            section.style.display = "none";
        });

        // Show selected section
        const selectedSection =
            document.getElementById(sectionId);

        if (selectedSection) {

            selectedSection.style.display = "block";

            selectedSection.classList.add("active-section");

        }

    });

});


// =========================================================
// ANALYZE BUTTON
// =========================================================

analyzeBtn.addEventListener("click", function() {

    const location = locationInput.value.trim();

    const selectedDate = dateInput.value;


    // Validate location
    if (!location) {

        showInputError(
            locationInput,
            "Please enter a location."
        );

        return;
    }


    // Validate date
    if (!selectedDate) {

        showInputError(
            dateInput,
            "Please select the flood event date."
        );

        return;
    }


    // Remove previous errors
    clearInputError(locationInput);
    clearInputError(dateInput);


    // Change button state
    analyzeBtn.disabled = true;

    analyzeBtn.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Analyzing Flood Area...
    `;


    // Simulate processing
    setTimeout(() => {

        generateAnalysis(
            location,
            selectedDate
        );

        analyzeBtn.disabled = false;

        analyzeBtn.innerHTML = `
            <i class="fa-solid fa-satellite"></i>
            Analyze Flood Area
            <i class="fa-solid fa-arrow-right"></i>
        `;

    }, 1500);

});


// =========================================================
// GENERATE ANALYSIS
// =========================================================

function generateAnalysis(location, selectedDate) {

    // -----------------------------------------------------
    // SHOW RESULTS
    // -----------------------------------------------------

    initialState.classList.add("hidden");

    resultsSection.classList.remove("hidden");


    // -----------------------------------------------------
    // DISPLAY LOCATION + DATE
    // -----------------------------------------------------

    resultLocation.textContent = location;

    resultDate.textContent =
        formatDate(selectedDate);

    processLocation.textContent =
        location;

    processDate.textContent =
        formatDate(selectedDate);


    // -----------------------------------------------------
    // DEMO ANALYSIS VALUES
    // -----------------------------------------------------

    /*
        These are DEMO values for the frontend.

        Later Feature:
        Replace these values with actual
        Sentinel-1 + SAR processing results.
    */

    const analysis = {

        affectedArea: 18.7,

        settlements: 42,

        roads: 31.4,

        agriculture: 12.6

    };


    // -----------------------------------------------------
    // DISPLAY STATISTICS
    // -----------------------------------------------------

    affectedArea.textContent =
        analysis.affectedArea + " km²";

    settlementCount.textContent =
        analysis.settlements;

    roadCount.textContent =
        analysis.roads + " km";

    agricultureArea.textContent =
        analysis.agriculture + " km²";


    // -----------------------------------------------------
    // IMPACT CARDS
    // -----------------------------------------------------

    settlementValue.textContent =
        analysis.settlements;

    roadValue.textContent =
        analysis.roads;

    agricultureValue.textContent =
        analysis.agriculture;


    // -----------------------------------------------------
    // PROGRESS BARS
    // -----------------------------------------------------

    setTimeout(() => {

        settlementProgress.style.width =
            calculateProgress(
                analysis.settlements,
                100
            ) + "%";

        roadProgress.style.width =
            calculateProgress(
                analysis.roads,
                100
            ) + "%";

        agricultureProgress.style.width =
            calculateProgress(
                analysis.agriculture,
                30
            ) + "%";

    }, 100);


    // -----------------------------------------------------
    // INITIALIZE MAPS
    // -----------------------------------------------------

    initializeMaps(location);


    // -----------------------------------------------------
    // SCROLL TO RESULTS
    // -----------------------------------------------------

    setTimeout(() => {

        resultsSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }, 100);

}


// =========================================================
// PROGRESS CALCULATION
// =========================================================

function calculateProgress(value, maximum) {

    const percentage =
        (value / maximum) * 100;

    return Math.min(
        Math.max(percentage, 5),
        100
    );

}


// =========================================================
// INITIALIZE MAPS
// =========================================================

function initializeMaps(locationName) {

    // Default location
    // Chennai coordinates

    const defaultLatitude = 13.0827;
    const defaultLongitude = 80.2707;


    // -----------------------------------------------------
    // DESTROY PREVIOUS MAPS
    // -----------------------------------------------------

    if (beforeMap) {

        beforeMap.remove();

        beforeMap = null;
    }

    if (afterMap) {

        afterMap.remove();

        afterMap = null;
    }


    // -----------------------------------------------------
    // BEFORE FLOOD MAP
    // -----------------------------------------------------

    beforeMap = L.map("beforeMap").setView(
        [
            defaultLatitude,
            defaultLongitude
        ],
        11
    );


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
        }
    ).addTo(beforeMap);


    // Marker

    beforeMarker = L.marker([
            defaultLatitude,
            defaultLongitude
        ])
        .addTo(beforeMap)
        .bindPopup(
            `<strong>${escapeHtml(locationName)}</strong><br>
         Pre-flood condition`
        );


    // -----------------------------------------------------
    // AFTER FLOOD MAP
    // -----------------------------------------------------

    afterMap = L.map("afterMap").setView(
        [
            defaultLatitude,
            defaultLongitude
        ],
        11
    );


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
        }
    ).addTo(afterMap);


    // -----------------------------------------------------
    // FLOOD AREA
    // -----------------------------------------------------

    const floodArea = L.circle(
        [
            defaultLatitude,
            defaultLongitude
        ], {
            radius: 5500,

            color: "#dc2626",

            weight: 2,

            fillColor: "#ef4444",

            fillOpacity: 0.28
        }
    ).addTo(afterMap);


    floodArea.bindPopup(
        `<strong>Detected Flood Extent</strong><br>
         ${escapeHtml(locationName)}`
    );


    // -----------------------------------------------------
    // FLOOD CENTER MARKER
    // -----------------------------------------------------

    afterMarker = L.marker([
            defaultLatitude,
            defaultLongitude
        ])
        .addTo(afterMap)
        .bindPopup(
            `<strong>${escapeHtml(locationName)}</strong><br>
         Flood affected region`
        );


    // -----------------------------------------------------
    // LEGEND
    // -----------------------------------------------------

    addMapLegend(afterMap);


    // Fix Leaflet rendering
    setTimeout(() => {

        beforeMap.invalidateSize();

        afterMap.invalidateSize();

    }, 300);

}


// =========================================================
// MAP LEGEND
// =========================================================

function addMapLegend(map) {

    const legend =
        L.control({
            position: "bottomright"
        });


    legend.onAdd = function() {

        const div =
            L.DomUtil.create(
                "div",
                "map-legend"
            );

        div.innerHTML = `
            <div class="legend-title">
                Flood Extent
            </div>

            <div class="legend-item">
                <span class="legend-color"></span>
                Detected flood area
            </div>
        `;

        return div;
    };


    legend.addTo(map);

}


// =========================================================
// FORMAT DATE
// =========================================================

function formatDate(dateString) {

    const date =
        new Date(
            dateString + "T00:00:00"
        );

    return date.toLocaleDateString(
        "en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// =========================================================
// INPUT ERROR
// =========================================================

function showInputError(input, message) {

    input.parentElement.style.borderColor =
        "#dc2626";

    input.focus();

    alert(message);

}


function clearInputError(input) {

    input.parentElement.style.borderColor =
        "#d7dee9";

}


// =========================================================
// HTML ESCAPE
// =========================================================

function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent = value;

    return div.innerHTML;

}


// =========================================================
// ENTER KEY SUPPORT
// =========================================================

locationInput.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            analyzeBtn.click();

        }

    }
);


dateInput.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            analyzeBtn.click();

        }

    }
);
/* =========================================================
   FLOOD ANALYSIS PAGE
========================================================= */

const analysisLocation =
    document.getElementById("analysisLocation");

const analysisDate =
    document.getElementById("analysisDate");

const startAnalysisBtn =
    document.getElementById("startAnalysisBtn");

const analysisPreview =
    document.getElementById("analysisPreview");

const previewLocation =
    document.getElementById("previewLocation");

const previewDate =
    document.getElementById("previewDate");


// Set maximum date to today

const analysisToday = new Date();

const analysisTodayString =
    analysisToday.getFullYear() +
    "-" +
    String(
        analysisToday.getMonth() + 1
    ).padStart(2, "0") +
    "-" +
    String(
        analysisToday.getDate()
    ).padStart(2, "0");

analysisDate.max = analysisTodayString;


// =========================================================
// START FLOOD ANALYSIS
// =========================================================

startAnalysisBtn.addEventListener(
    "click",
    function() {

        const location =
            analysisLocation.value.trim();

        const date =
            analysisDate.value;


        // Validate location

        if (!location) {

            alert(
                "Please enter the analysis location."
            );

            analysisLocation.focus();

            return;
        }


        // Validate date

        if (!date) {

            alert(
                "Please select the flood event date."
            );

            analysisDate.focus();

            return;
        }


        // Button loading state

        startAnalysisBtn.disabled = true;

        startAnalysisBtn.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Preparing Analysis...
        `;


        // Small frontend simulation

        setTimeout(
            function() {

                // Display request

                previewLocation.textContent =
                    location;

                previewDate.textContent =
                    formatAnalysisDate(date);


                // Show analysis preview

                analysisPreview.classList.remove(
                    "hidden"
                );


                // Restore button

                startAnalysisBtn.disabled = false;

                startAnalysisBtn.innerHTML = `
                    <i class="fa-solid fa-satellite"></i>
                    Start Flood Analysis
                    <i class="fa-solid fa-arrow-right"></i>
                `;


                // Scroll to result

                analysisPreview.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            },
            1000
        );

    }
);


// =========================================================
// FORMAT DATE
// =========================================================

function formatAnalysisDate(dateString) {

    const date =
        new Date(
            dateString + "T00:00:00"
        );

    return date.toLocaleDateString(
        "en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}
/* =========================================================
   FLOOD MAP PAGE
========================================================= */

let floodMap = null;

let floodZoneLayer = null;
let settlementLayer = null;
let agricultureLayer = null;


// =========================================================
// INITIALIZE FLOOD MAP
// =========================================================

function initializeFloodMap() {

    // Prevent duplicate map initialization

    if (floodMap) {

        setTimeout(() => {

            floodMap.invalidateSize();

        }, 200);

        return;
    }


    // Chennai demo coordinates

    const latitude = 13.0827;
    const longitude = 80.2707;


    // Create map

    floodMap = L.map(
        "floodMap"
    ).setView(
        [
            latitude,
            longitude
        ],
        11
    );


    // OpenStreetMap

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,

            attribution: "&copy; OpenStreetMap contributors"
        }
    ).addTo(floodMap);


    // =====================================================
    // FLOOD EXTENT
    // =====================================================

    floodZoneLayer =
        L.polygon(
            [
                [13.125, 80.205],
                [13.145, 80.250],
                [13.130, 80.305],
                [13.095, 80.335],
                [13.055, 80.320],
                [13.035, 80.275],
                [13.055, 80.225],
                [13.090, 80.195]
            ], {
                color: "#dc2626",

                weight: 2,

                fillColor: "#ef4444",

                fillOpacity: 0.32
            }
        )
        .addTo(floodMap);


    floodZoneLayer.bindPopup(`
        <div class="flood-popup-title">
            Detected Flood Extent
        </div>

        <div class="flood-popup-text">
            Estimated affected area: 18.7 km²
        </div>
    `);


    // =====================================================
    // SETTLEMENTS
    // =====================================================

    settlementLayer =
        L.layerGroup();


    const settlements = [

        [13.105, 80.240, "Affected Settlement 01"],

        [13.090, 80.270, "Affected Settlement 02"],

        [13.075, 80.290, "Affected Settlement 03"],

        [13.115, 80.295, "Affected Settlement 04"],

        [13.065, 80.245, "Affected Settlement 05"]

    ];


    settlements.forEach(
        function(item) {

            const marker =
                L.circleMarker(
                    [
                        item[0],
                        item[1]
                    ], {
                        radius: 7,

                        color: "#c2410c",

                        weight: 2,

                        fillColor: "#f97316",

                        fillOpacity: 0.9
                    }
                );


            marker.bindPopup(`
                <div class="flood-popup-title">
                    ${item[2]}
                </div>

                <div class="flood-popup-text">
                    Located within detected flood extent.
                </div>
            `);


            marker.addTo(
                settlementLayer
            );

        }
    );


    settlementLayer.addTo(
        floodMap
    );


    // =====================================================
    // AFFECTED ROADS
    // =====================================================

    roadLayer =
        L.layerGroup();


    const roads = [

        [
            [13.135, 80.215],
            [13.115, 80.255],
            [13.095, 80.285],
            [13.065, 80.315]
        ],

        [
            [13.045, 80.225],
            [13.075, 80.255],
            [13.105, 80.300]
        ],

        [
            [13.145, 80.285],
            [13.115, 80.285],
            [13.080, 80.285],
            [13.050, 80.280]
        ]

    ];


    roads.forEach(
        function(points) {

            const road =
                L.polyline(
                    points, {
                        color: "#7c3aed",

                        weight: 4,

                        opacity: 0.9
                    }
                );


            road.bindPopup(`
                <div class="flood-popup-title">
                    Affected Road
                </div>

                <div class="flood-popup-text">
                    Road segment intersects flood extent.
                </div>
            `);


            road.addTo(
                roadLayer
            );

        }
    );


    roadLayer.addTo(
        floodMap
    );


    // =====================================================
    // AGRICULTURAL LAND
    // =====================================================

    agricultureLayer =
        L.layerGroup();


    const agricultureAreas = [

        [
            [13.060, 80.210],
            [13.080, 80.215],
            [13.075, 80.240],
            [13.055, 80.235]
        ],

        [
            [13.115, 80.300],
            [13.135, 80.315],
            [13.120, 80.335],
            [13.100, 80.320]
        ],

        [
            [13.075, 80.300],
            [13.090, 80.315],
            [13.075, 80.325],
            [13.060, 80.310]
        ]

    ];


    agricultureAreas.forEach(
        function(points) {

            const area =
                L.polygon(
                    points, {
                        color: "#15803d",

                        weight: 1,

                        fillColor: "#22c55e",

                        fillOpacity: 0.28
                    }
                );


            area.bindPopup(`
                <div class="flood-popup-title">
                    Affected Agricultural Land
                </div>

                <div class="flood-popup-text">
                    Agricultural area inside flood extent.
                </div>
            `);


            area.addTo(
                agricultureLayer
            );

        }
    );


    agricultureLayer.addTo(
        floodMap
    );


    // =====================================================
    // MAP SCALE
    // =====================================================

    L.control.scale({
        imperial: false
    }).addTo(
        floodMap
    );


    // =====================================================
    // FIX MAP SIZE
    // =====================================================

    setTimeout(
        function() {

            floodMap.invalidateSize();

        },
        300
    );

}


// =========================================================
// NAVIGATION DETECTION
// =========================================================

const floodMapNav =
    document.querySelector(
        '.nav-item[data-section="flood-map"]'
    );


if (floodMapNav) {

    floodMapNav.addEventListener(
        "click",
        function() {

            setTimeout(
                function() {

                    initializeFloodMap();

                },
                100
            );

        }
    );

}


// =========================================================
// BEFORE / FLOOD VIEW BUTTONS
// =========================================================

const beforeMapBtn =
    document.getElementById(
        "beforeMapBtn"
    );

const afterMapBtn =
    document.getElementById(
        "afterMapBtn"
    );


if (beforeMapBtn) {

    beforeMapBtn.addEventListener(
        "click",
        function() {

            beforeMapBtn.classList.add(
                "active"
            );

            afterMapBtn.classList.remove(
                "active"
            );


            if (floodZoneLayer) {

                floodZoneLayer.setStyle({
                    fillOpacity: 0
                });

            }

        }
    );

}


if (afterMapBtn) {

    afterMapBtn.addEventListener(
        "click",
        function() {

            afterMapBtn.classList.add(
                "active"
            );

            beforeMapBtn.classList.remove(
                "active"
            );


            if (floodZoneLayer) {

                floodZoneLayer.setStyle({
                    fillOpacity: 0.32
                });

            }

        }
    );

}


// =========================================================
// FIT FLOOD AREA
// =========================================================

const fitFloodBtn =
    document.getElementById(
        "fitFloodBtn"
    );


if (fitFloodBtn) {

    fitFloodBtn.addEventListener(
        "click",
        function() {

            if (
                floodMap &&
                floodZoneLayer
            ) {

                floodMap.fitBounds(
                    floodZoneLayer.getBounds(), {
                        padding: [30, 30]
                    }
                );

            }

        }
    );

}


// =========================================================
// LAYER TOGGLES
// =========================================================

const floodLayerToggle =
    document.getElementById(
        "floodLayerToggle"
    );

const settlementLayerToggle =
    document.getElementById(
        "settlementLayerToggle"
    );

const roadLayerToggle =
    document.getElementById(
        "roadLayerToggle"
    );

const agricultureLayerToggle =
    document.getElementById(
        "agricultureLayerToggle"
    );


// Flood layer

if (floodLayerToggle) {

    floodLayerToggle.addEventListener(
        "change",
        function() {

            if (!floodMap || !floodZoneLayer) {
                return;
            }


            if (this.checked) {

                floodZoneLayer.addTo(
                    floodMap
                );

            } else {

                floodMap.removeLayer(
                    floodZoneLayer
                );

            }

        }
    );

}


// Settlement layer

if (settlementLayerToggle) {

    settlementLayerToggle.addEventListener(
        "change",
        function() {

            if (!floodMap ||
                !settlementLayer
            ) {
                return;
            }


            if (this.checked) {

                settlementLayer.addTo(
                    floodMap
                );

            } else {

                floodMap.removeLayer(
                    settlementLayer
                );

            }

        }
    );

}
/* =========================================================
   ROADS FEATURE
   RapidFlood AI
========================================================= */

let roadMap = null;
let roadLayer = null;
let roadFloodLayer = null;


/* =========================================================
   DEMO ROAD DATA
========================================================= */

const roadData = [{
        name: "Road 01",
        type: "Main Road",
        totalLength: "5.8 km",
        affectedLength: "3.4 km",
        exposure: 59,
        impact: "Severe",
        coordinates: [
            [13.115, 80.215],
            [13.105, 80.235],
            [13.095, 80.260],
            [13.080, 80.285]
        ]
    },

    {
        name: "Road 02",
        type: "Highway",
        totalLength: "8.2 km",
        affectedLength: "4.1 km",
        exposure: 50,
        impact: "Severe",
        coordinates: [
            [13.130, 80.240],
            [13.120, 80.260],
            [13.105, 80.280],
            [13.090, 80.305]
        ]
    },

    {
        name: "Road 03",
        type: "Local Road",
        totalLength: "3.6 km",
        affectedLength: "1.3 km",
        exposure: 36,
        impact: "Moderate",
        coordinates: [
            [13.070, 80.220],
            [13.075, 80.245],
            [13.080, 80.270],
            [13.085, 80.295]
        ]
    },

    {
        name: "Road 04",
        type: "Residential",
        totalLength: "2.9 km",
        affectedLength: "0.8 km",
        exposure: 28,
        impact: "Moderate",
        coordinates: [
            [13.060, 80.255],
            [13.075, 80.265],
            [13.090, 80.275],
            [13.105, 80.285]
        ]
    },

    {
        name: "Road 05",
        type: "Local Road",
        totalLength: "4.2 km",
        affectedLength: "0.4 km",
        exposure: 10,
        impact: "Low",
        coordinates: [
            [13.045, 80.235],
            [13.060, 80.250],
            [13.075, 80.260]
        ]
    }
];


/* =========================================================
   INITIALIZE ROAD MAP
========================================================= */

function initializeRoadMap() {

    const mapElement = document.getElementById("roadMap");

    if (!mapElement) {
        console.warn("roadMap element not found.");
        return;
    }


    /* -----------------------------------------------------
       If map already exists, only refresh its size
    ----------------------------------------------------- */

    if (roadMap !== null) {

        setTimeout(() => {
            roadMap.invalidateSize();
        }, 200);

        return;
    }


    /* -----------------------------------------------------
       Create Leaflet Map
    ----------------------------------------------------- */

    roadMap = L.map("roadMap");


    roadMap.setView(
        [13.085, 80.275],
        12
    );


    /* -----------------------------------------------------
       OpenStreetMap
    ----------------------------------------------------- */

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,

            attribution: "&copy; OpenStreetMap contributors"
        }
    ).addTo(roadMap);


    /* =====================================================
       FLOOD EXTENT
    ===================================================== */

    roadFloodLayer = L.polygon(
        [
            [13.125, 80.205],
            [13.145, 80.250],
            [13.130, 80.305],
            [13.095, 80.335],
            [13.055, 80.320],
            [13.035, 80.275],
            [13.055, 80.225],
            [13.090, 80.195]
        ], {
            color: "#dc2626",

            weight: 2,

            fillColor: "#ef4444",

            fillOpacity: 0.15
        }
    );


    roadFloodLayer.addTo(roadMap);


    /* =====================================================
       CREATE ROAD LAYER
    ===================================================== */

    roadLayer = L.layerGroup();


    /* -----------------------------------------------------
       Add every road
    ----------------------------------------------------- */

    roadData.forEach((road) => {

        let roadColor = "#16a34a";


        if (road.impact === "Severe") {

            roadColor = "#dc2626";

        } else if (road.impact === "Moderate") {

            roadColor = "#f97316";

        } else {

            roadColor = "#16a34a";

        }


        /* -------------------------------------------------
           Create road line
        ------------------------------------------------- */

        const roadLine = L.polyline(
            road.coordinates, {
                color: roadColor,

                weight: 6,

                opacity: 0.9
            }
        );


        /* -------------------------------------------------
           Popup
        ------------------------------------------------- */

        roadLine.bindPopup(`
            <div style="
                min-width:180px;
                font-family:Arial,sans-serif;
            ">

                <h4 style="
                    margin:0 0 10px;
                    color:#172033;
                ">
                    ${road.name}
                </h4>

                <div style="
                    font-size:12px;
                    line-height:1.8;
                    color:#475569;
                ">

                    <strong>Type:</strong>
                    ${road.type}
                    <br>

                    <strong>Total Length:</strong>
                    ${road.totalLength}
                    <br>

                    <strong>Affected Length:</strong>
                    ${road.affectedLength}
                    <br>

                    <strong>Exposure:</strong>
                    ${road.exposure}%
                    <br>

                    <strong>Impact:</strong>
                    ${road.impact}

                </div>

            </div>
        `);


        /* -------------------------------------------------
           IMPORTANT:
           Add road to roadLayer
        ------------------------------------------------- */

        roadLayer.addLayer(roadLine);

    });


    /* -----------------------------------------------------
       Add road layer to map
    ----------------------------------------------------- */

    roadLayer.addTo(roadMap);


    /* =====================================================
       SCALE
    ===================================================== */

    L.control.scale({
        imperial: false
    }).addTo(roadMap);


    /* =====================================================
       Refresh map
    ===================================================== */

    setTimeout(() => {

        roadMap.invalidateSize();

    }, 300);

}


/* =========================================================
   ROAD SEARCH
========================================================= */

function setupRoadSearch() {

    const searchInput =
        document.getElementById("roadSearch");


    if (!searchInput) {
        return;
    }


    searchInput.addEventListener(
        "input",
        function() {

            const searchText =
                this.value
                .toLowerCase()
                .trim();


            const rows =
                document.querySelectorAll(
                    "#roadTableBody tr"
                );


            rows.forEach((row) => {

                const text =
                    row.textContent
                    .toLowerCase();


                if (
                    text.includes(searchText)
                ) {

                    row.style.display = "";

                } else {

                    row.style.display = "none";

                }

            });

        }
    );

}


/* =========================================================
   ROAD NAVIGATION
========================================================= */

function setupRoadNavigation() {

    const roadNavItems =
        document.querySelectorAll(
            '[data-section="roads"]'
        );


    roadNavItems.forEach((item) => {

        item.addEventListener(
            "click",
            function() {

                setTimeout(() => {

                    initializeRoadMap();

                }, 150);

            }
        );

    });

}


/* =========================================================
   WHEN PAGE LOADS
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        setupRoadNavigation();

        setupRoadSearch();

    }
);
/* =========================================================
   AGRICULTURE
========================================================= */

let agricultureMapInstance = null;
let agricultureFloodLayer = null;
let agricultureLandLayer = null;


/* =========================================================
   AGRICULTURE DATA
========================================================= */

const agricultureDemoData = [

    {
        name: "Agricultural Zone A",
        type: "Paddy Field",
        totalArea: 32.5,
        affectedArea: 18.4,
        exposure: 57,
        impact: "Severe",

        coordinates: [
            [13.105, 80.235],
            [13.120, 80.260],
            [13.105, 80.285],
            [13.085, 80.275],
            [13.090, 80.245]
        ]
    },

    {
        name: "Agricultural Zone B",
        type: "Crop Land",
        totalArea: 24.8,
        affectedArea: 12.2,
        exposure: 49,
        impact: "Severe",

        coordinates: [
            [13.075, 80.220],
            [13.095, 80.235],
            [13.085, 80.275],
            [13.065, 80.260]
        ]
    },

    {
        name: "Agricultural Zone C",
        type: "Vegetable Farm",
        totalArea: 15.6,
        affectedArea: 7.4,
        exposure: 47,
        impact: "Moderate",

        coordinates: [
            [13.055, 80.250],
            [13.075, 80.265],
            [13.065, 80.295],
            [13.045, 80.280]
        ]
    },

    {
        name: "Agricultural Zone D",
        type: "Mixed Agriculture",
        totalArea: 8.2,
        affectedArea: 3.1,
        exposure: 38,
        impact: "Moderate",

        coordinates: [
            [13.040, 80.230],
            [13.060, 80.245],
            [13.055, 80.270],
            [13.035, 80.255]
        ]
    },

    {
        name: "Agricultural Zone E",
        type: "Plantation",
        totalArea: 5.3,
        affectedArea: 1.7,
        exposure: 32,
        impact: "Low",

        coordinates: [
            [13.030, 80.285],
            [13.050, 80.300],
            [13.065, 80.315],
            [13.045, 80.325]
        ]
    }

];


/* =========================================================
   AGRICULTURE MAP
========================================================= */

function initializeAgricultureMap() {

    const mapContainer =
        document.getElementById(
            "agricultureMap"
        );


    if (!mapContainer) {
        return;
    }


    if (typeof L === "undefined") {

        console.error(
            "Leaflet is not loaded."
        );

        return;
    }


    /* Prevent duplicate Leaflet map */

    if (agricultureMapInstance !== null) {

        setTimeout(
            function() {

                agricultureMapInstance
                    .invalidateSize();

            },
            200
        );

        return;
    }


    /* =====================================================
       CREATE MAP
    ===================================================== */

    agricultureMapInstance =
        L.map(
            "agricultureMap"
        ).setView(
            [13.080, 80.270],
            12
        );


    /* =====================================================
       OPEN STREET MAP
    ===================================================== */

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,

            attribution: "&copy; OpenStreetMap contributors"
        }
    ).addTo(
        agricultureMapInstance
    );


    /* =====================================================
       FLOOD EXTENT
    ===================================================== */

    agricultureFloodLayer =
        L.polygon(
            [
                [13.125, 80.205],
                [13.145, 80.250],
                [13.130, 80.305],
                [13.095, 80.335],
                [13.055, 80.320],
                [13.035, 80.275],
                [13.055, 80.225],
                [13.090, 80.195]
            ], {
                color: "#2563eb",
                weight: 2,
                fillColor: "#3b82f6",
                fillOpacity: 0.15
            }
        );


    agricultureFloodLayer.addTo(
        agricultureMapInstance
    );


    /* =====================================================
       AGRICULTURAL ZONES
    ===================================================== */

    agricultureLandLayer =
        L.layerGroup();


    agricultureDemoData.forEach(
        function(zone) {

            let zoneColor =
                "#16a34a";


            if (zone.impact === "Severe") {

                zoneColor =
                    "#dc2626";

            } else if (
                zone.impact === "Moderate"
            ) {

                zoneColor =
                    "#f97316";

            }


            const polygon =
                L.polygon(
                    zone.coordinates, {
                        color: zoneColor,

                        weight: 2,

                        fillColor: zoneColor,

                        fillOpacity: 0.35
                    }
                );


            polygon.bindPopup(`

                <div style="
                    min-width:200px;
                    font-family:Arial,sans-serif;
                ">

                    <h4 style="
                        margin:0 0 8px;
                        color:#172033;
                    ">
                        ${zone.name}
                    </h4>

                    <div style="
                        font-size:12px;
                        line-height:1.8;
                        color:#475569;
                    ">

                        <strong>Land Type:</strong>
                        ${zone.type}

                        <br>

                        <strong>Total Area:</strong>
                        ${zone.totalArea} km²

                        <br>

                        <strong>Affected Area:</strong>
                        ${zone.affectedArea} km²

                        <br>

                        <strong>Exposure:</strong>
                        ${zone.exposure}%

                        <br>

                        <strong>Impact:</strong>
                        ${zone.impact}

                    </div>

                </div>

            `);


            agricultureLandLayer.addLayer(
                polygon
            );

        }
    );


    agricultureLandLayer.addTo(
        agricultureMapInstance
    );


    /* =====================================================
       SCALE
    ===================================================== */

    L.control.scale({
        imperial: false
    }).addTo(
        agricultureMapInstance
    );


    /* =====================================================
       MAP SIZE FIX
    ===================================================== */

    setTimeout(
        function() {

            agricultureMapInstance
                .invalidateSize();

        },
        400
    );

}


/* =========================================================
   RECOMMENDATIONS
========================================================= */

function generateAgricultureRecommendations() {

    const container =
        document.getElementById(
            "agricultureRecommendations"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    const severeZones =
        agricultureDemoData.filter(
            function(zone) {

                return zone.impact === "Severe";

            }
        );


    /* 1. SEVERE AREAS */

    addAgricultureRecommendation(

        container,

        "red",

        "fa-triangle-exclamation",

        "Prioritize Severely Affected Fields",

        `${severeZones.length} agricultural zones show severe flood exposure.`,

        "Prioritize field inspection and crop-damage assessment."

    );


    /* 2. WATERLOGGING */

    addAgricultureRecommendation(

        container,

        "blue",

        "fa-water",

        "Monitor Waterlogging",

        "Persistent floodwater can affect crop health and soil conditions.",

        "Monitor water persistence and identify fields requiring drainage."

    );


    /* 3. DAMAGE ASSESSMENT */

    addAgricultureRecommendation(

        container,

        "orange",

        "fa-clipboard-check",

        "Assess Crop Damage",

        "Flood-exposed agricultural areas should be inspected after water levels decrease.",

        "Record affected crop area and estimate agricultural losses."

    );


    /* 4. FARMER SUPPORT */

    addAgricultureRecommendation(

        container,

        "green",

        "fa-people-group",

        "Prioritize Farmer Assistance",

        "Farmers operating within severely affected zones may require immediate support.",

        "Prioritize affected agricultural communities for relief and recovery."

    );


    /* 5. SATELLITE MONITORING */

    addAgricultureRecommendation(

        container,

        "blue",

        "fa-satellite",

        "Continue Satellite Monitoring",

        "Flood boundaries can change after the initial flood event.",

        "Compare future Sentinel-1 images to monitor flood recession."

    );

}


/* =========================================================
   CREATE RECOMMENDATION
========================================================= */

function addAgricultureRecommendation(
    container,
    color,
    icon,
    title,
    description,
    action
) {

    const item =
        document.createElement("div");


    item.className =
        "agri-recommendation-item";


    item.innerHTML = `

        <div class="agri-rec-icon ${color}">

            <i class="fa-solid ${icon}"></i>

        </div>


        <div>

            <h3>
                ${title}
            </h3>

            <p>
                ${description}
            </p>

            <span class="agri-rec-action">

                Recommended:
                ${action}

            </span>

        </div>

    `;


    container.appendChild(item);

}


/* =========================================================
   AGRICULTURE SEARCH
========================================================= */

function initializeAgricultureSearch() {

    const searchInput =
        document.getElementById(
            "agricultureSearch"
        );


    if (!searchInput) {
        return;
    }


    searchInput.addEventListener(
        "input",
        function() {

            const searchText =
                this.value
                .toLowerCase()
                .trim();


            const rows =
                document.querySelectorAll(
                    "#agricultureTableBody tr"
                );


            rows.forEach(
                function(row) {

                    const text =
                        row.textContent
                        .toLowerCase();


                    row.style.display =
                        text.includes(
                            searchText
                        ) ?
                        "" :
                        "none";

                }
            );

        }
    );

}


/* =========================================================
   AGRICULTURE NAVIGATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        initializeAgricultureSearch();

        generateAgricultureRecommendations();

    }
);