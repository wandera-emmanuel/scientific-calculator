import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import {
  Calculator as CalculatorIcon,
  Plus,
  Minus,
  X,
  Divide,
  Equal,
  Percent,
  ArrowLeft,
  Trash2,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Square, // Replaced CircleSquare with Square
} from 'lucide-react';

const Calculator = () => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [memory, setMemory] = useState<number | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showScientific, setShowScientific] = useState(false);
  const { toast } = useToast();

  const clearDisplay = () => {
    setDisplay('0');
    setExpression('');
  };

  const handleNumberInput = (num: string) => {
    setDisplay((prev) => {
      if (prev === '0' || prev === 'Error') {
        return num;
      }
      return prev + num;
    });
    setExpression((prev) => prev + num);
  };

  const handleDecimal = () => {
    if (!display.includes('.')) {
      setDisplay((prev) => prev + '.');
      setExpression((prev) => prev + '.');
    }
  };

  const handleOperator = (operator: string) => {
    if (display === 'Error') return;
    
    // Map operators to their mathematical symbols
    const operatorMap: Record<string, string> = {
      '+': '+',
      '-': '-',
      '*': '×',
      '/': '÷',
      '^': '^',
    };
    
    const displayOperator = operatorMap[operator] || operator;
    
    setExpression((prev) => prev + operator);
    setDisplay('0');
  };

  const handleEquals = () => {
    try {
      // Replace mathematical operations for evaluation
      let expressionToEvaluate = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/\^/g, '**');
      
      // eslint-disable-next-line no-eval
      const result = eval(expressionToEvaluate);
      
      if (!isFinite(result)) {
        throw new Error('Invalid calculation');
      }
      
      const formattedResult = parseFloat(result.toFixed(10)).toString();
      setDisplay(formattedResult);
      
      // Add to history
      setHistory((prev) => [`${expression} = ${formattedResult}`, ...prev.slice(0, 9)]);
      
      setExpression(formattedResult);
    } catch (error) {
      setDisplay('Error');
      toast({
        title: "Calculation Error",
        description: "Invalid mathematical expression",
        variant: "destructive",
      });
    }
  };

  const handleDelete = () => {
    if (display === 'Error') {
      clearDisplay();
      return;
    }
    
    setDisplay((prev) => {
      if (prev.length === 1) return '0';
      return prev.slice(0, -1);
    });
    
    setExpression((prev) => prev.slice(0, -1));
  };

  const handleScientificFunction = (func: string) => {
    if (display === 'Error') return;
    
    switch (func) {
      case 'sin':
      case 'cos':
      case 'tan':
      case 'log':
      case 'ln':
      case 'sqrt':
        setExpression((prev) => prev + `${func}(`);
        setDisplay('0');
        break;
      case 'square':
        setExpression((prev) => prev + '^2');
        break;
      case 'cube':
        setExpression((prev) => prev + '^3');
        break;
      case 'pi':
        setExpression((prev) => prev + 'Math.PI');
        setDisplay('π');
        break;
      case 'e':
        setExpression((prev) => prev + 'Math.E');
        setDisplay('e');
        break;
      default:
        break;
    }
  };

  const handleParenthesis = (paren: '(' | ')') => {
    setExpression((prev) => prev + paren);
    setDisplay('0');
  };

  const handleMemory = (action: string) => {
    switch (action) {
      case 'MS': // Memory Store
        try {
          const value = parseFloat(display);
          setMemory(value);
          toast({
            title: "Memory Stored",
            description: `Value ${value} stored in memory`,
          });
        } catch (error) {
          toast({
            title: "Memory Error",
            description: "Could not store value in memory",
            variant: "destructive",
          });
        }
        break;
      case 'MR': // Memory Recall
        if (memory !== null) {
          setDisplay(memory.toString());
          setExpression((prev) => prev + memory.toString());
        } else {
          toast({
            title: "Memory Empty",
            description: "No value stored in memory",
          });
        }
        break;
      case 'MC': // Memory Clear
        setMemory(null);
        toast({
          title: "Memory Cleared",
          description: "Memory has been cleared",
        });
        break;
      case 'M+': // Memory Add
        if (memory !== null) {
          try {
            const newMemory = memory + parseFloat(display);
            setMemory(newMemory);
            toast({
              title: "Memory Updated",
              description: `Added ${display} to memory`,
            });
          } catch (error) {
            toast({
              title: "Memory Error",
              description: "Could not add to memory",
              variant: "destructive",
            });
          }
        } else {
          // If memory is empty, just store the current value
          handleMemory('MS');
        }
        break;
      case 'M-': // Memory Subtract
        if (memory !== null) {
          try {
            const newMemory = memory - parseFloat(display);
            setMemory(newMemory);
            toast({
              title: "Memory Updated",
              description: `Subtracted ${display} from memory`,
            });
          } catch (error) {
            toast({
              title: "Memory Error",
              description: "Could not subtract from memory",
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Memory Empty",
            description: "No value stored in memory",
          });
        }
        break;
      default:
        break;
    }
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (/^[0-9]$/.test(event.key)) {
      handleNumberInput(event.key);
    } else if (event.key === '.') {
      handleDecimal();
    } else if (['+', '-', '*', '/'].includes(event.key)) {
      handleOperator(event.key);
    } else if (event.key === 'Enter' || event.key === '=') {
      handleEquals();
    } else if (event.key === 'Backspace') {
      handleDelete();
    } else if (event.key === 'Escape') {
      clearDisplay();
    } else if (event.key === '(' || event.key === ')') {
      handleParenthesis(event.key as '(' | ')');
    }
  }, [display, expression]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleHistoryClick = (historyItem: string) => {
    const parts = historyItem.split(' = ');
    if (parts.length === 2) {
      setExpression(parts[1]);
      setDisplay(parts[1]);
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <Card className="w-full max-w-md bg-calculator-bg rounded-xl shadow-lg overflow-hidden">
        <div className="flex justify-between items-center px-4 py-2 bg-calculator-primary/20">
          <div className="flex items-center space-x-2">
            <CalculatorIcon className="h-5 w-5 text-calculator-primary" />
            <h2 className="text-lg font-semibold text-white">Scientific Calculator</h2>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="text-white hover:bg-calculator-primary/20"
            >
              {showHistory ? <ChevronDown /> : <ChevronUp />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowScientific(!showScientific)}
              className="text-white hover:bg-calculator-primary/20"
            >
              {showScientific ? <ChevronLeft /> : <ArrowLeft />}
            </Button>
          </div>
        </div>

        {showHistory && (
          <div className="max-h-40 overflow-y-auto bg-calculator-display/70 p-2">
            {history.length > 0 ? (
              <ul className="text-right divide-y divide-gray-700">
                {history.map((item, index) => (
                  <li 
                    key={index} 
                    className="py-1 px-2 text-white cursor-pointer hover:bg-calculator-primary/20"
                    onClick={() => handleHistoryClick(item)}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-400 py-2">No calculation history</p>
            )}
          </div>
        )}

        <div className="p-4 bg-calculator-display text-right">
          <div className="text-sm text-gray-400 h-5 overflow-hidden">
            {expression || '0'}
          </div>
          <div className="text-3xl font-bold text-white overflow-hidden text-ellipsis h-12 flex items-center justify-end">
            {display}
          </div>
          {memory !== null && (
            <div className="text-xs text-calculator-primary mt-1">
              M: {memory}
            </div>
          )}
        </div>

        <div className="p-3 grid grid-cols-4 gap-2 bg-calculator-bg">
          {/* Memory Buttons */}
          <div className="col-span-4 grid grid-cols-5 gap-2 mb-2">
            <Button 
              variant="outline" 
              className="bg-calculator-memory text-white border-none hover:bg-calculator-memory/80"
              onClick={() => handleMemory('MC')}
            >
              MC
            </Button>
            <Button 
              variant="outline" 
              className="bg-calculator-memory text-white border-none hover:bg-calculator-memory/80"
              onClick={() => handleMemory('MR')}
            >
              MR
            </Button>
            <Button 
              variant="outline" 
              className="bg-calculator-memory text-white border-none hover:bg-calculator-memory/80"
              onClick={() => handleMemory('MS')}
            >
              MS
            </Button>
            <Button 
              variant="outline" 
              className="bg-calculator-memory text-white border-none hover:bg-calculator-memory/80"
              onClick={() => handleMemory('M+')}
            >
              M+
            </Button>
            <Button 
              variant="outline" 
              className="bg-calculator-memory text-white border-none hover:bg-calculator-memory/80"
              onClick={() => handleMemory('M-')}
            >
              M-
            </Button>
          </div>

          {/* Scientific Functions (Conditional Rendering) */}
          {showScientific && (
            <div className="col-span-4 grid grid-cols-4 gap-2 mb-2">
              <Button 
                variant="outline" 
                className="bg-calculator-function text-white border-none hover:bg-calculator-function/80"
                onClick={() => handleScientificFunction('sin')}
              >
                sin
              </Button>
              <Button 
                variant="outline" 
                className="bg-calculator-function text-white border-none hover:bg-calculator-function/80"
                onClick={() => handleScientificFunction('cos')}
              >
                cos
              </Button>
              <Button 
                variant="outline" 
                className="bg-calculator-function text-white border-none hover:bg-calculator-function/80"
                onClick={() => handleScientificFunction('tan')}
              >
                tan
              </Button>
              <Button 
                variant="outline" 
                className="bg-calculator-function text-white border-none hover:bg-calculator-function/80"
                onClick={() => handleScientificFunction('pi')}
              >
                π
              </Button>
              <Button 
                variant="outline" 
                className="bg-calculator-function text-white border-none hover:bg-calculator-function/80"
                onClick={() => handleScientificFunction('log')}
              >
                log
              </Button>
              <Button 
                variant="outline" 
                className="bg-calculator-function text-white border-none hover:bg-calculator-function/80"
                onClick={() => handleScientificFunction('ln')}
              >
                ln
              </Button>
              <Button 
                variant="outline" 
                className="bg-calculator-function text-white border-none hover:bg-calculator-function/80"
                onClick={() => handleScientificFunction('e')}
              >
                e
              </Button>
              <Button 
                variant="outline" 
                className="bg-calculator-function text-white border-none hover:bg-calculator-function/80"
                onClick={() => handleScientificFunction('sqrt')}
              >
                <Square className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                className="bg-calculator-function text-white border-none hover:bg-calculator-function/80"
                onClick={() => handleScientificFunction('square')}
              >
                x²
              </Button>
              <Button 
                variant="outline" 
                className="bg-calculator-function text-white border-none hover:bg-calculator-function/80"
                onClick={() => handleScientificFunction('cube')}
              >
                x³
              </Button>
              <Button 
                variant="outline" 
                className="bg-calculator-function text-white border-none hover:bg-calculator-function/80"
                onClick={() => handleOperator('^')}
              >
                x^y
              </Button>
              <Button 
                variant="outline" 
                className="bg-calculator-function text-white border-none hover:bg-calculator-function/80"
                onClick={() => handleParenthesis('(')}
              >
                (
              </Button>
              <Button 
                variant="outline" 
                className="bg-calculator-function text-white border-none hover:bg-calculator-function/80"
                onClick={() => handleParenthesis(')')}
              >
                )
              </Button>
              <Button 
                variant="outline" 
                className="bg-calculator-function text-white border-none hover:bg-calculator-function/80"
                onClick={() => handleOperator('%')}
              >
                <Percent className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                className="bg-calculator-function text-white border-none hover:bg-calculator-function/80"
                onClick={() => {
                  setDisplay((prev) => {
                    if (prev === '0' || prev === 'Error') return '0';
                    return (parseFloat(prev) * -1).toString();
                  });
                  setExpression((prev) => `(${prev}) * -1`);
                }}
              >
                ±
              </Button>
            </div>
          )}

          {/* Clear, Delete, and Basic Operators */}
          <Button 
            variant="outline" 
            className="bg-calculator-operator text-white border-none hover:bg-calculator-operator/80"
            onClick={clearDisplay}
          >
            C
          </Button>
          <Button 
            variant="outline" 
            className="bg-calculator-operator text-white border-none hover:bg-calculator-operator/80"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            className="bg-calculator-operator text-white border-none hover:bg-calculator-operator/80"
            onClick={() => handleOperator('%')}
          >
            <Percent className="h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            className="bg-calculator-operator text-white border-none hover:bg-calculator-operator/80"
            onClick={() => handleOperator('/')}
          >
            <Divide className="h-5 w-5" />
          </Button>

          {/* Number Buttons */}
          <Button 
            variant="outline" 
            className="bg-calculator-secondary text-white border-none hover:bg-calculator-secondary/80"
            onClick={() => handleNumberInput('7')}
          >
            7
          </Button>
          <Button 
            variant="outline" 
            className="bg-calculator-secondary text-white border-none hover:bg-calculator-secondary/80"
            onClick={() => handleNumberInput('8')}
          >
            8
          </Button>
          <Button 
            variant="outline" 
            className="bg-calculator-secondary text-white border-none hover:bg-calculator-secondary/80"
            onClick={() => handleNumberInput('9')}
          >
            9
          </Button>
          <Button 
            variant="outline" 
            className="bg-calculator-operator text-white border-none hover:bg-calculator-operator/80"
            onClick={() => handleOperator('*')}
          >
            <X className="h-5 w-5" />
          </Button>

          <Button 
            variant="outline" 
            className="bg-calculator-secondary text-white border-none hover:bg-calculator-secondary/80"
            onClick={() => handleNumberInput('4')}
          >
            4
          </Button>
          <Button 
            variant="outline" 
            className="bg-calculator-secondary text-white border-none hover:bg-calculator-secondary/80"
            onClick={() => handleNumberInput('5')}
          >
            5
          </Button>
          <Button 
            variant="outline" 
            className="bg-calculator-secondary text-white border-none hover:bg-calculator-secondary/80"
            onClick={() => handleNumberInput('6')}
          >
            6
          </Button>
          <Button 
            variant="outline" 
            className="bg-calculator-operator text-white border-none hover:bg-calculator-operator/80"
            onClick={() => handleOperator('-')}
          >
            <Minus className="h-5 w-5" />
          </Button>

          <Button 
            variant="outline" 
            className="bg-calculator-secondary text-white border-none hover:bg-calculator-secondary/80"
            onClick={() => handleNumberInput('1')}
          >
            1
          </Button>
          <Button 
            variant="outline" 
            className="bg-calculator-secondary text-white border-none hover:bg-calculator-secondary/80"
            onClick={() => handleNumberInput('2')}
          >
            2
          </Button>
          <Button 
            variant="outline" 
            className="bg-calculator-secondary text-white border-none hover:bg-calculator-secondary/80"
            onClick={() => handleNumberInput('3')}
          >
            3
          </Button>
          <Button 
            variant="outline" 
            className="bg-calculator-operator text-white border-none hover:bg-calculator-operator/80"
            onClick={() => handleOperator('+')}
          >
            <Plus className="h-5 w-5" />
          </Button>

          <Button 
            variant="outline" 
            className="bg-calculator-secondary text-white border-none hover:bg-calculator-secondary/80 col-span-2"
            onClick={() => handleNumberInput('0')}
          >
            0
          </Button>
          <Button 
            variant="outline" 
            className="bg-calculator-secondary text-white border-none hover:bg-calculator-secondary/80"
            onClick={handleDecimal}
          >
            .
          </Button>
          <Button 
            variant="outline" 
            className="bg-calculator-equals text-white border-none hover:bg-calculator-equals/80"
            onClick={handleEquals}
          >
            <Equal className="h-5 w-5" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Calculator;
