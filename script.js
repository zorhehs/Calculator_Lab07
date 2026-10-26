var screenBox = document.getElementById("display");
var justDone = false;

function toggleMenu() {
    document.getElementById("submenu").classList.toggle("hidden");
}

function closeMenu() {
    document.getElementById("submenu").classList.add("hidden");
}

document.addEventListener("click", function(e) {
    if (!e.target.closest(".menu-wrap")) {
        closeMenu();
    }
});

function setMode(mode) {
    var names = {
        standard: "Standard Calculator",
        scientific: "Scientific Calculator",
        unit: "Unit Conversion",
        currency: "Currency Conversion"
    };

    var isCalc = (mode === "standard" || mode === "scientific");
    document.getElementById("calcPanel").classList.toggle("hidden", !isCalc);
    document.getElementById("sciKeys").classList.toggle("hidden", mode !== "scientific");
    document.getElementById("note").classList.toggle("hidden", mode !== "scientific");
    document.getElementById("unitPanel").classList.toggle("hidden", mode !== "unit");
    document.getElementById("currencyPanel").classList.toggle("hidden", mode !== "currency");
    document.getElementById("modeName").textContent = names[mode];

    var items = document.querySelectorAll(".submenu button");
    for (var i = 0; i < items.length; i++) {
        items[i].classList.toggle("active", items[i].dataset.mode === mode);
    }

    closeMenu();
}

function show(text) {
    screenBox.value = text;
}

function press(v) {
    var text = screenBox.value;
    var isNumber = "0123456789.".indexOf(v) !== -1;

    if (text === "Error") {
        text = "0";
    }
    if (justDone && isNumber) {
        text = "0";
    }
    justDone = false;

    if (v === "." ) {
        var lastNumber = text.split(/[+\-×÷^()]/).pop();
        if (lastNumber.indexOf(".") !== -1) {
            return;
        }
    }

    if (text === "0" && v !== ".") {
        show(v);
    } else {
        show(text + v);
    }
}

function clearAll() {
    justDone = false;
    show("0");
}

function backspace() {
    var text = screenBox.value;
    if (justDone || text === "Error" || text.length <= 1) {
        show("0");
        justDone = false;
    } else {
        show(text.slice(0, -1));
    }
}

function evaluate(text) {
    var e = text.replace(/×/g, "*").replace(/÷/g, "/");
    e = e.replace(/\^/g, "**").replace(/π/g, "(" + Math.PI + ")");
    if (!/^[0-9+\-*\/.() e]+$/.test(e)) {
        return NaN;
    }
    try {
        return Function("return " + e)();
    } catch (err) {
        return NaN;
    }
}

function clean(n) {
    return parseFloat(n.toPrecision(12));
}

function calculate() {
    var result = evaluate(screenBox.value);
    if (typeof result !== "number" || !isFinite(result)) {
        show("Error");
    } else {
        show(clean(result));
    }
    justDone = true;
}

function func(name) {
    var v = evaluate(screenBox.value);
    var r;

    if (isNaN(v) || !isFinite(v)) {
        show("Error");
        justDone = true;
        return;
    }

    var rad = v * Math.PI / 180;

    switch (name) {
        case "sin":
            r = Math.round(Math.sin(rad) * 1e10) / 1e10;
            break;
        case "cos":
            r = Math.round(Math.cos(rad) * 1e10) / 1e10;
            break;
        case "tan":
            r = (Math.abs(v % 180) === 90) ? NaN : Math.round(Math.tan(rad) * 1e10) / 1e10;
            break;
        case "log":
            r = v > 0 ? Math.log10(v) : NaN;
            break;
        case "ln":
            r = v > 0 ? Math.log(v) : NaN;
            break;
        case "sqrt":
            r = v >= 0 ? Math.sqrt(v) : NaN;
            break;
        case "square":
            r = v * v;
            break;
        case "percent":
            r = v / 100;
            break;
        case "fact":
            r = factorial(v);
            break;
    }

    if (isNaN(r) || !isFinite(r)) {
        show("Error");
    } else {
        show(clean(r));
    }
    justDone = true;
}

function factorial(n) {
    if (n < 0 || n > 170 || n !== Math.floor(n)) {
        return NaN;
    }
    var f = 1;
    for (var i = 2; i <= n; i++) {
        f = f * i;
    }
    return f;
}

document.addEventListener("keydown", function(e) {
    if (document.getElementById("calcPanel").classList.contains("hidden")) {
        return;
    }
    if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") {
        return;
    }
    var k = e.key;
    if ("0123456789.+-()".indexOf(k) !== -1) {
        press(k);
    } else if (k === "*") {
        press("×");
    } else if (k === "/") {
        e.preventDefault();
        press("÷");
    } else if (k === "Enter" || k === "=") {
        calculate();
    } else if (k === "Backspace") {
        backspace();
    } else if (k === "Escape") {
        clearAll();
    }
});

var unitData = {
    length: { Meter: 1, Kilometer: 1000, Centimeter: 0.01, Millimeter: 0.001,
              Mile: 1609.344, Foot: 0.3048, Inch: 0.0254 },
    weight: { Kilogram: 1, Gram: 0.001, Milligram: 0.000001,
              Pound: 0.45359237, Ounce: 0.028349523125 },
    temperature: { Celsius: 1, Fahrenheit: 1, Kelvin: 1 }
};

function fillBoxes(fromId, toId, names, fromDefault, toDefault) {
    var from = document.getElementById(fromId);
    var to = document.getElementById(toId);
    from.innerHTML = "";
    to.innerHTML = "";
    for (var i = 0; i < names.length; i++) {
        from.add(new Option(names[i], names[i]));
        to.add(new Option(names[i], names[i]));
    }
    from.value = fromDefault;
    to.value = toDefault;
}

function fillUnits() {
    var type = document.getElementById("unitType").value;
    var names = Object.keys(unitData[type]);
    fillBoxes("unitFrom", "unitTo", names, names[0], names[1]);
    convertUnit();
}

function toCelsius(value, unit) {
    if (unit === "Fahrenheit") {
        return (value - 32) * 5 / 9;
    }
    if (unit === "Kelvin") {
        return value - 273.15;
    }
    return value;
}

function fromCelsius(value, unit) {
    if (unit === "Fahrenheit") {
        return value * 9 / 5 + 32;
    }
    if (unit === "Kelvin") {
        return value + 273.15;
    }
    return value;
}

function convertUnit() {
    var type = document.getElementById("unitType").value;
    var value = parseFloat(document.getElementById("unitInput").value);
    var from = document.getElementById("unitFrom").value;
    var to = document.getElementById("unitTo").value;
    var out = document.getElementById("unitResult");

    if (isNaN(value)) {
        out.textContent = "Enter a number";
        return;
    }

    var answer;
    if (type === "temperature") {
        answer = fromCelsius(toCelsius(value, from), to);
    } else {
        answer = value * unitData[type][from] / unitData[type][to];
    }

    out.textContent = value + " " + from + " = " + parseFloat(answer.toPrecision(8)) + " " + to;
}

var rates = { USD: 1, PKR: 280, EUR: 0.92, GBP: 0.79, AED: 3.67, SAR: 3.75, INR: 83, JPY: 150 };

function convertCurrency() {
    var amount = parseFloat(document.getElementById("curInput").value);
    var from = document.getElementById("curFrom").value;
    var to = document.getElementById("curTo").value;
    var out = document.getElementById("curResult");

    if (isNaN(amount)) {
        out.textContent = "Enter a number";
        return;
    }

    var answer = amount / rates[from] * rates[to];
    out.textContent = amount + " " + from + " = " + answer.toFixed(2) + " " + to;
}

fillBoxes("curFrom", "curTo", Object.keys(rates), "USD", "PKR");
fillUnits();
convertCurrency();
setMode("standard");
