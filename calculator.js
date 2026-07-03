"use strict";

(function () {
  const displayEl = document.getElementById("display");
  let expression = "";

  function render() {
    displayEl.textContent = expression || "0";
  }

  // Safe expression evaluator (shunting-yard -> RPN) for + - * / and parentheses.
  // Avoids eval/Function so no arbitrary code can run.
  function evaluate(expr) {
    const tokens = tokenize(expr);
    const rpn = toRPN(tokens);
    return evalRPN(rpn);
  }

  function tokenize(expr) {
    const tokens = [];
    let i = 0;
    while (i < expr.length) {
      const ch = expr[i];
      if (ch === " ") {
        i++;
      } else if ("+-*/()".includes(ch)) {
        tokens.push({ type: "op", value: ch });
        i++;
      } else if (/[0-9.]/.test(ch)) {
        let num = "";
        while (i < expr.length && /[0-9.]/.test(expr[i])) {
          num += expr[i];
          i++;
        }
        if ((num.match(/\./g) || []).length > 1) {
          throw new Error("Invalid number");
        }
        tokens.push({ type: "num", value: parseFloat(num) });
      } else {
        throw new Error("Invalid character");
      }
    }
    return tokens;
  }

  function toRPN(tokens) {
    const output = [];
    const ops = [];
    const prec = { "+": 1, "-": 1, "*": 2, "/": 2 };

    for (let idx = 0; idx < tokens.length; idx++) {
      const t = tokens[idx];
      if (t.type === "num") {
        output.push(t);
      } else if (t.value === "(") {
        ops.push(t);
      } else if (t.value === ")") {
        while (ops.length && ops[ops.length - 1].value !== "(") {
          output.push(ops.pop());
        }
        if (!ops.length) throw new Error("Mismatched parentheses");
        ops.pop(); // discard "("
      } else {
        // Handle unary minus/plus at start or after another operator/(
        const prev = tokens[idx - 1];
        const isUnary =
          (t.value === "-" || t.value === "+") &&
          (!prev || (prev.type === "op" && prev.value !== ")"));
        if (isUnary) {
          output.push({ type: "num", value: 0 });
        }
        while (
          ops.length &&
          ops[ops.length - 1].value !== "(" &&
          prec[ops[ops.length - 1].value] >= prec[t.value]
        ) {
          output.push(ops.pop());
        }
        ops.push(t);
      }
    }

    while (ops.length) {
      const op = ops.pop();
      if (op.value === "(") throw new Error("Mismatched parentheses");
      output.push(op);
    }
    return output;
  }

  function evalRPN(rpn) {
    const stack = [];
    for (const t of rpn) {
      if (t.type === "num") {
        stack.push(t.value);
      } else {
        const b = stack.pop();
        const a = stack.pop();
        if (a === undefined || b === undefined) {
          throw new Error("Invalid expression");
        }
        switch (t.value) {
          case "+": stack.push(a + b); break;
          case "-": stack.push(a - b); break;
          case "*": stack.push(a * b); break;
          case "/":
            if (b === 0) throw new Error("Divide by zero");
            stack.push(a / b);
            break;
        }
      }
    }
    if (stack.length !== 1 || !isFinite(stack[0])) {
      throw new Error("Invalid expression");
    }
    return stack[0];
  }

  function handleInput(value) {
    if (expression === "Error") expression = "";
    expression += value;
    render();
  }

  function handleClear() {
    expression = "";
    render();
  }

  function handleEquals() {
    try {
      const result = evaluate(expression);
      // Trim floating point noise, keep integers clean.
      expression = String(Number(result.toPrecision(12)));
    } catch (e) {
      expression = "Error";
    }
    render();
  }

  // Button clicks
  document.querySelector(".keys").addEventListener("click", function (e) {
    const btn = e.target.closest("button");
    if (!btn) return;
    const action = btn.dataset.action;
    if (action === "clear") handleClear();
    else if (action === "equals") handleEquals();
    else if (btn.dataset.value != null) handleInput(btn.dataset.value);
  });

  // Keyboard support
  document.addEventListener("keydown", function (e) {
    const key = e.key;
    if (/[0-9+\-*/().]/.test(key)) {
      handleInput(key);
    } else if (key === "Enter" || key === "=") {
      e.preventDefault();
      handleEquals();
    } else if (key === "Escape" || key.toLowerCase() === "c") {
      handleClear();
    } else if (key === "Backspace") {
      if (expression === "Error") expression = "";
      else expression = expression.slice(0, -1);
      render();
    }
  });

  render();
})();
