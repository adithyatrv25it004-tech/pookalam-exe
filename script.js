const svg = document.getElementById("pookalam");

const generateBtn =
    document.getElementById("generateBtn");

const replayBtn =
    document.getElementById("replayBtn");

const layerCountText =
    document.getElementById("layerCount");

const petalCountText =
    document.getElementById("petalCount");

const symmetryCountText =
    document.getElementById("symmetryCount");


const SVG_NS =
    "http://www.w3.org/2000/svg";


const CENTER_X = 300;
const CENTER_Y = 300;


const palettes = [

    [
        "#ffd54a",
        "#ff9f1c",
        "#ff5d3a",
        "#fff0b3",
        "#8bc34a"
    ],

    [
        "#ffe066",
        "#f6a01a",
        "#e4572e",
        "#fff4c2",
        "#72a92f"
    ],

    [
        "#ffcc33",
        "#ff851b",
        "#d93636",
        "#fff3c4",
        "#6cab3c"
    ]

];


function randomItem(array) {

    return array[
        Math.floor(
            Math.random() * array.length
        )
    ];

}


function createPetal(
    radius,
    angle,
    width,
    height,
    color,
    delay
) {

    const radians =
        angle * Math.PI / 180;


    const x =
        CENTER_X +
        radius * Math.cos(radians);


    const y =
        CENTER_Y +
        radius * Math.sin(radians);


    const petal =
        document.createElementNS(
            SVG_NS,
            "ellipse"
        );


    petal.setAttribute("cx", x);
    petal.setAttribute("cy", y);

    petal.setAttribute(
        "rx",
        width
    );

    petal.setAttribute(
        "ry",
        height
    );


    petal.setAttribute(
        "fill",
        color
    );


    petal.setAttribute(
        "transform",
        `
        rotate(
            ${angle + 90}
            ${x}
            ${y}
        )
        `
    );


    petal.classList.add("petal");


    petal.style.animationDelay =
        `${delay}s`;


    svg.appendChild(petal);

}


function createRing(
    radius,
    petalCount,
    width,
    height,
    color,
    rotationOffset,
    delayOffset
) {

    for (
        let i = 0;
        i < petalCount;
        i++
    ) {

        const angle =
            (360 / petalCount) * i
            + rotationOffset;


        createPetal(
            radius,
            angle,
            width,
            height,
            color,
            delayOffset + i * 0.015
        );

    }

}


function createCenter(palette) {

    const outer =
        document.createElementNS(
            SVG_NS,
            "circle"
        );

    outer.setAttribute(
        "cx",
        CENTER_X
    );

    outer.setAttribute(
        "cy",
        CENTER_Y
    );

    outer.setAttribute(
        "r",
        38
    );

    outer.setAttribute(
        "fill",
        palette[1]
    );

    outer.classList.add(
        "center-core"
    );


    svg.appendChild(outer);


    const inner =
        document.createElementNS(
            SVG_NS,
            "circle"
        );


    inner.setAttribute(
        "cx",
        CENTER_X
    );

    inner.setAttribute(
        "cy",
        CENTER_Y
    );

    inner.setAttribute(
        "r",
        18
    );


    inner.setAttribute(
        "fill",
        palette[0]
    );


    inner.classList.add(
        "center-core"
    );


    svg.appendChild(inner);

}


function generatePookalam() {

    svg.innerHTML = "";


    const palette =
        randomItem(palettes);


    const layers = [

        {
            radius: 65,
            petals: 12,
            width: 16,
            height: 35,
            color: palette[0],
            rotation: 0
        },

        {
            radius: 105,
            petals: 16,
            width: 17,
            height: 40,
            color: palette[1],
            rotation: 11
        },

        {
            radius: 145,
            petals: 20,
            width: 15,
            height: 40,
            color: palette[2],
            rotation: 0
        },

        {
            radius: 185,
            petals: 24,
            width: 16,
            height: 42,
            color: palette[0],
            rotation: 7.5
        },

        {
            radius: 225,
            petals: 28,
            width: 14,
            height: 40,
            color: palette[4],
            rotation: 0
        },

        {
            radius: 260,
            petals: 32,
            width: 12,
            height: 32,
            color: palette[3],
            rotation: 5.5
        }

    ];


    let totalPetals = 0;


    layers.forEach(
        (layer, index) => {

            createRing(

                layer.radius,

                layer.petals,

                layer.width,

                layer.height,

                layer.color,

                layer.rotation,

                index * 0.12

            );


            totalPetals +=
                layer.petals;

        }
    );


    createCenter(palette);


    layerCountText.textContent =
        layers.length;


    petalCountText.textContent =
        totalPetals;


    symmetryCountText.textContent =
        layers[0].petals;

}


function replayAnimation() {

    const petals =
        document.querySelectorAll(
            ".petal, .center-core"
        );


    petals.forEach(
        element => {

            element.style.animation =
                "none";

        }
    );


    requestAnimationFrame(() => {

        petals.forEach(
            element => {

                element.style.animation =
                    "";

            }
        );

    });

}


generateBtn.addEventListener(
    "click",
    generatePookalam
);


replayBtn.addEventListener(
    "click",
    replayAnimation
);


generatePookalam();