/**
 * Safe Expression Evaluator for Salary Formula Rules
 * Supports variables (BASIC, GROSS, WAGE, WORKED_DAYS, UNPAID_DAYS, etc.)
 * and operators +, -, *, /, (, ).
 * NO eval() or Function() constructor used!
 */

function evaluateFormula(expression, context) {
  if (!expression || typeof expression !== 'string') return 0;

  // Replace variable names in formula with numeric values from context
  let tokenized = expression;

  // Sort variable keys by length descending to prevent partial variable replacements (e.g., BASIC before BASIC_SALARY)
  const keys = Object.keys(context).sort((a, b) => b.length - a.length);

  for (const key of keys) {
    const val = context[key] !== undefined ? context[key] : 0;
    // Replace standalone word matched key
    const regex = new RegExp(`\\b${key}\\b`, 'g');
    tokenized = tokenized.replace(regex, val.toString());
  }

  // Remove any remaining invalid characters (only allow digits, decimals, +, -, *, /, (, ), space)
  const sanitized = tokenized.replace(/[^0-9.\-+\/*()\s]/g, '');

  try {
    const result = parseMathExpression(sanitized);
    return isNaN(result) || !isFinite(result) ? 0 : Math.round(result * 100) / 100;
  } catch (err) {
    console.error(`[ExpressionParser Error]: ${expression} -> ${sanitized}`, err.message);
    return 0;
  }
}

// Simple arithmetic parser using Shunting-yard algorithm & RPN evaluation
function parseMathExpression(expr) {
  const tokens = tokenize(expr);
  const rpn = toRPN(tokens);
  return evaluateRPN(rpn);
}

function tokenize(expr) {
  const tokens = [];
  let numberBuffer = '';

  for (let i = 0; i < expr.length; i++) {
    const char = expr[i];

    if (/\s/.test(char)) continue;

    if (/[0-9.]/.test(char)) {
      numberBuffer += char;
    } else {
      if (numberBuffer) {
        tokens.push(parseFloat(numberBuffer));
        numberBuffer = '';
      }
      if (['+', '-', '*', '/', '(', ')'].includes(char)) {
        // Handle unary minus
        if (char === '-' && (tokens.length === 0 || tokens[tokens.length - 1] === '(' || ['+', '-', '*', '/'].includes(tokens[tokens.length - 1]))) {
          numberBuffer += char;
        } else {
          tokens.push(char);
        }
      }
    }
  }

  if (numberBuffer) {
    tokens.push(parseFloat(numberBuffer));
  }

  return tokens;
}

function toRPN(tokens) {
  const outputQueue = [];
  const operatorStack = [];
  const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 };

  tokens.forEach((token) => {
    if (typeof token === 'number') {
      outputQueue.push(token);
    } else if (['+', '-', '*', '/'].includes(token)) {
      while (
        operatorStack.length > 0 &&
        operatorStack[operatorStack.length - 1] !== '(' &&
        precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]
      ) {
        outputQueue.push(operatorStack.pop());
      }
      operatorStack.push(token);
    } else if (token === '(') {
      operatorStack.push(token);
    } else if (token === ')') {
      while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
        outputQueue.push(operatorStack.pop());
      }
      operatorStack.pop(); // pop '('
    }
  });

  while (operatorStack.length > 0) {
    outputQueue.push(operatorStack.pop());
  }

  return outputQueue;
}

function evaluateRPN(rpn) {
  const stack = [];

  rpn.forEach((token) => {
    if (typeof token === 'number') {
      stack.push(token);
    } else {
      const b = stack.pop() || 0;
      const a = stack.pop() || 0;

      switch (token) {
        case '+':
          stack.push(a + b);
          break;
        case '-':
          stack.push(a - b);
          break;
        case '*':
          stack.push(a * b);
          break;
        case '/':
          stack.push(b !== 0 ? a / b : 0);
          break;
      }
    }
  });

  return stack.length > 0 ? stack[0] : 0;
}

module.exports = { evaluateFormula };
