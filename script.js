const displayEl = document.getElementById("display");
const exprEl = document.getElementById("expr");

function formatNumber(n) {
  if (!Number.isFinite(n)) return "Error";
  const abs = Math.abs(n);
  if (abs >= 1e12 || (abs > 0 && abs < 1e-6)) {
    return n.toExponential(8).replace(/0+e/, "e");
  }
  return String(parseFloat(n.toFixed(10)));
}

//test
let current = "0"; // string being edited
let a = null; // number
let op = null; // "+", "-", "*", "/", "%"
let justEvaluated = false;

function updateUI() {
  if (!displayEl || !exprEl) return;
  displayEl.textContent = current;
  const aText = a === null ? "" : formatNumber(a);
  const opText = op ? ` ${op} ` : "";
  exprEl.textContent = (aText + opText).trim();
}

function setCurrent(next) {
  current = next;
  updateUI();
}

function inputDigit(d) {
  if (justEvaluated && op === null) {
    a = null;
    justEvaluated = false;
    setCurrent(d);
    return;
  }

  if (current === "0") {
    setCurrent(d);
    return;
  }
  if (current === "-0") {
    setCurrent("-" + d);
    return;
  }
  setCurrent(current + d);
}

function inputDecimal() {
  if (justEvaluated && op === null) {
    a = null;
    justEvaluated = false;
    setCurrent("0.");
    return;
  }
  if (current.includes(".")) return;
  setCurrent(current + ".");
}

function clearAll() {
  current = "0";
  a = null;
  op = null;
  justEvaluated = false;
  updateUI();
}

function backspace() {
  if (justEvaluated) justEvaluated = false;
  if (current.length <= 1) {
    setCurrent("0");
    return;
  }
  const next = current.slice(0, -1);
  if (next === "-" || next === "-0") {
    setCurrent("0");
    return;
  }
  setCurrent(next);
}

function compute(left, operator, right) {
  switch (operator) {
    case "+":
      return left + right;
    case "-":
      return left - right;
    case "*":
      return left * right;
    case "/":
      return right === 0 ? NaN : left / right;
    case "%":
      return left * (right / 100);
    default:
      return NaN;
  }
}

function chooseOperator(nextOp) {
  const currentNum = Number(current);
  if (!Number.isFinite(currentNum)) {
    clearAll();
    return;
  }

  if (a === null) {
    a = currentNum;
    op = nextOp;
    justEvaluated = false;
    setCurrent("0");
    return;
  }

  if (op === null) {
    op = nextOp;
    justEvaluated = false;
    updateUI();
    return;
  }

  if (justEvaluated) {
    op = nextOp;
    justEvaluated = false;
    updateUI();
    return;
  }

  const result = compute(a, op, currentNum);
  a = result;
  op = nextOp;
  justEvaluated = false;
  setCurrent("0");
  updateUI();
}

function equals() {
  if (a === null || op === null) return;
  const b = Number(current);
  const result = compute(a, op, b);
  current = formatNumber(result);
  a = result;
  op = null;
  justEvaluated = true;
  updateUI();
}

function onInput(action, value) {
  switch (action) {
    case "digit":
      inputDigit(value);
      break;
    case "decimal":
      inputDecimal();
      break;
    case "operator":
      chooseOperator(value);
      break;
    case "equals":
      equals();
      break;
    case "clear":
      clearAll();
      break;
    case "backspace":
      backspace();
      break;
    default:
      break;
  }
}

document.addEventListener("click", (e) => {
  const btn = e.target instanceof Element ? e.target.closest("button[data-action]") : null;
  if (!btn) return;
  const action = btn.getAttribute("data-action");
  const value = btn.getAttribute("data-value") || "";
  if (!action) return;
  onInput(action, value);
});

document.addEventListener("keydown", (e) => {
  const k = e.key;

  if (k >= "0" && k <= "9") {
    onInput("digit", k);
    return;
  }
  if (k === ".") {
    onInput("decimal", ".");
    return;
  }
  if (k === "+" || k === "-" || k === "*" || k === "/") {
    onInput("operator", k);
    return;
  }
  if (k === "%") {
    onInput("operator", "%");
    return;
  }
  if (k === "Enter" || k === "=") {
    e.preventDefault();
    onInput("equals", "");
    return;
  }
  if (k === "Backspace") {
    onInput("backspace", "");
    return;
  }
  if (k === "Escape") {
    onInput("clear", "");
    return;
  }
});

updateUI();
