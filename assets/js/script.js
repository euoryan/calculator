// Elementos DOM
const valueDisplay = document.getElementById('value');
const historyDisplay = document.getElementById('history');
const buttons = document.querySelectorAll('.btn');
const clearBtn = document.getElementById('clear');
const equalBtn = document.getElementById('equal');
const backspaceBtn = document.getElementById('backspace');
const themeToggle = document.querySelector('.theme-toggle');

// Variáveis para armazenar os valores e o estado da calculadora
let currentValue = '0';
let formula = '';
let calculationDone = false;
let operatorJustEntered = false;

// Efeito de inicialização
window.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loaded');
  
  // Animação sutil dos botões ao carregar
  setTimeout(() => {
    buttons.forEach((btn, index) => {
      setTimeout(() => {
        btn.style.opacity = '1';
        btn.style.transform = 'translateY(0)';
      }, index * 30);
    });
  }, 300);
});

// Função para atualizar o display
function updateDisplay() {
  valueDisplay.textContent = currentValue;
}

// Função para atualizar o histórico
function updateHistory(text) {
  historyDisplay.textContent = text;
}

// Processar clique nos botões
buttons.forEach(button => {
  // Inicialmente definir os botões com opacidade 0
  button.style.opacity = '0';
  button.style.transform = 'translateY(10px)';

  button.addEventListener('click', () => {
    // Adicionar efeito visual ao clicar
    button.classList.add('clicked');
    setTimeout(() => button.classList.remove('clicked'), 150);
    
    const buttonValue = button.textContent;
    
    // Se um cálculo foi concluído e um número é pressionado, reinicie
    if (calculationDone && !isOperator(buttonValue) && buttonValue !== '=' && !isFunctionKey(buttonValue)) {
      currentValue = buttonValue === '.' ? '0.' : buttonValue;
      formula = currentValue;
      calculationDone = false;
      updateDisplay();
      updateHistory('');
      return;
    }
    
    // Tratamento baseado no tipo de botão
    if (buttonValue === 'AC') {
      clear();
    } else if (buttonValue === '⌫') {
      backspace();
    } else if (buttonValue === '=') {
      calculate();
    } else if (buttonValue === '%') {
      handlePercent();
    } else if (isOperator(buttonValue)) {
      handleOperator(buttonValue);
    } else {
      handleNumber(buttonValue);
    }
    
    // Efeito de pulso no display
    valueDisplay.classList.add('pulse');
    setTimeout(() => valueDisplay.classList.remove('pulse'), 200);
  });
});

// Verificar se é um operador
function isOperator(value) {
  return ['+', '-', '×', '/'].includes(value);
}

// Verificar se é uma tecla de função
function isFunctionKey(value) {
  return ['AC', '⌫', '%'].includes(value);
}

// Lidar com entrada de números e ponto decimal
function handleNumber(value) {
  if (operatorJustEntered) {
    currentValue = value === '.' ? '0.' : value;
    operatorJustEntered = false;
  } else {
    // Evitar múltiplos zeros à esquerda
    if (currentValue === '0' && value !== '.') {
      currentValue = value;
    } 
    // Evitar múltiplos pontos decimais
    else if (value === '.' && currentValue.includes('.')) {
      return;
    } 
    // Adicionar ponto com zero à esquerda se necessário
    else if (value === '.' && currentValue === '') {
      currentValue = '0.';
    } 
    // Caso normal: anexar o dígito
    else {
      currentValue += value;
    }
  }
  
  // Atualizar a fórmula
  if (calculationDone) {
    formula = currentValue;
    calculationDone = false;
  } else {
    if (formula === '0' && value !== '.') {
      formula = value;
    } else {
      formula += value;
    }
  }
  
  updateDisplay();
}

// Lidar com operadores
function handleOperator(value) {
  // Substituir o operador × pelo * para a avaliação
  const operatorForEval = value === '×' ? '*' : value;
  
  // Se um operador acabou de ser inserido, substitua-o
  if (operatorJustEntered) {
    formula = formula.slice(0, -1) + operatorForEval;
  } else {
    // Se um cálculo foi concluído, continue com o resultado
    if (calculationDone) {
      formula = currentValue;
      calculationDone = false;
    }
    
    formula += operatorForEval;
    operatorJustEntered = true;
  }
  
  updateHistory(formula);
}

// Lidar com porcentagem
function handlePercent() {
  if (currentValue !== '') {
    // Converter para porcentagem (dividir por 100)
    const percentValue = parseFloat(currentValue) / 100;
    currentValue = percentValue.toString();
    
    // Atualizar a última parte da fórmula
    if (formula.includes('+') || formula.includes('-') || 
        formula.includes('*') || formula.includes('/')) {
      
      // Encontrar o último operador
      const lastOperatorIndex = Math.max(
        formula.lastIndexOf('+'),
        formula.lastIndexOf('-'),
        formula.lastIndexOf('*'),
        formula.lastIndexOf('/')
      );
      
      if (lastOperatorIndex !== -1) {
        // Substituir o número após o último operador
        formula = formula.substring(0, lastOperatorIndex + 1) + percentValue;
      } else {
        formula = percentValue.toString();
      }
    } else {
      formula = percentValue.toString();
    }
    
    updateDisplay();
    updateHistory(formula);
  }
}

// Função para calcular o resultado
function calculate() {
  if (formula) {
    try {
      // Substituir × por * para avaliação
      let evalFormula = formula.replace(/×/g, '*');
      
      // Remover operador no final, se houver
      if (isOperator(evalFormula.slice(-1)) || evalFormula.slice(-1) === '*') {
        evalFormula = evalFormula.slice(0, -1);
      }
      
      // Calcular e formatar o resultado
      let result = eval(evalFormula);
      
      // Formatar o resultado para evitar números muito grandes
      if (result.toString().includes('e')) {
        // Notação científica
        result = result.toPrecision(6);
      } else if (result.toString().includes('.')) {
        // Limitar casas decimais
        const decimalCount = result.toString().split('.')[1].length;
        if (decimalCount > 8) {
          result = result.toFixed(8);
        }
      }
      
      // Atualizar displays
      updateHistory(formula + ' =');
      currentValue = result.toString();
      formula = result.toString();
      calculationDone = true;
      operatorJustEntered = false;
      updateDisplay();
    } catch (error) {
      currentValue = 'Erro';
      updateDisplay();
      setTimeout(clear, 1000);
    }
  }
}

// Função de limpar (AC)
function clear() {
  currentValue = '0';
  formula = '';
  calculationDone = false;
  operatorJustEntered = false;
  updateDisplay();
  updateHistory('');
}

// Função de backspace (⌫)
function backspace() {
  if (currentValue.length > 0 && currentValue !== '0') {
    currentValue = currentValue.slice(0, -1);
    if (currentValue === '' || currentValue === '-') {
      currentValue = '0';
    }
    
    // Atualizar também a fórmula
    if (formula.length > 0) {
      formula = formula.slice(0, -1);
      if (formula === '') {
        formula = '0';
      }
    }
    
    updateDisplay();
    updateHistory(formula);
  }
}

// Alternar entre os temas
themeToggle.addEventListener('click', () => {
  const body = document.body;
  const toggleIcon = document.querySelector('.toggle-icon');
  
  // Adicionar efeito de transição
  toggleIcon.style.transition = 'transform 0.3s ease';
  
  if (body.classList.contains('dark')) {
    body.classList.remove('dark');
    toggleIcon.style.transform = 'translateX(0)';
    document.documentElement.style.setProperty('--calculator-dark', '#f0f2f5');
    document.documentElement.style.setProperty('--bg-dark', '#e4e6e9');
    document.documentElement.style.setProperty('--button-dark', '#ffffff');
    document.documentElement.style.setProperty('--button-hover', '#f5f5f5');
    document.documentElement.style.setProperty('--text-primary', '#24292e');
    document.documentElement.style.setProperty('--text-secondary', '#586069');
    document.documentElement.style.setProperty('--border-color', '#d0d7de');
    document.documentElement.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.1)');
  } else {
    body.classList.add('dark');
    toggleIcon.style.transform = 'translateX(25px)';
    document.documentElement.style.setProperty('--calculator-dark', '#161b22');
    document.documentElement.style.setProperty('--bg-dark', '#0d1117');
    document.documentElement.style.setProperty('--button-dark', '#21262d');
    document.documentElement.style.setProperty('--button-hover', '#30363d');
    document.documentElement.style.setProperty('--text-primary', '#e6edf3');
    document.documentElement.style.setProperty('--text-secondary', '#8b949e');
    document.documentElement.style.setProperty('--border-color', '#30363d');
    document.documentElement.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.5)');
  }
});

// Suporte a teclado
document.addEventListener('keydown', (event) => {
  const key = event.key;
  
  // Mapear teclas para botões
  if (/^[0-9.]$/.test(key)) {
    // Números e ponto decimal
    simulateButtonClick(key);
  } else if (['+', '-'].includes(key)) {
    // Operadores diretos
    simulateButtonClick(key);
  } else if (key === '*') {
    // Multiplicação (× na UI)
    simulateButtonClick('×');
  } else if (key === '/') {
    // Divisão
    simulateButtonClick('/');
  } else if (key === 'Enter' || key === '=') {
    // Igual
    simulateButtonClick('=');
  } else if (key === 'Escape') {
    // Limpar
    simulateButtonClick('AC');
  } else if (key === 'Backspace') {
    // Apagar
    simulateButtonClick('⌫');
  } else if (key === '%') {
    // Porcentagem
    simulateButtonClick('%');
  }
});

// Simular clique no botão
function simulateButtonClick(value) {
  const button = Array.from(buttons).find(btn => btn.textContent === value);
  if (button) {
    button.click();
  }
}

// Inicializar o display
updateDisplay();