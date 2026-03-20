/**
 * @fileoverview Code Parsing Handler
 * Uses AST (Abstract Syntax Tree) traversal to analyze source code structure.
 */

const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

class CodeParsingHandler {
  /**
   * @param {Object} options 
   * @param {string} [options.sourceType='module'] - Script or Module
   */
  constructor(options = {}) {
    this.sourceType = options.sourceType || 'module';
    this.plugins = ['typescript', 'jsx', 'classProperties'];
  }

  /**
   * Main execution: Converts raw code into a structured report.
   * @param {string} code - Raw source code string.
   */
  async execute(code) {
    try {
      console.info('Initiating Code Parsing...');

      if (!await this.validate(code)) {
        throw new Error('Invalid code input: Code is either empty or too large for parsing.');
      }

      // 1. Generate the AST
      const ast = this.parseToAST(code);

      // 2. Analyze the tree
      const analysis = this.analyzeStructure(ast);

      return {
        success: true,
        data: analysis,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return this.handleError(error);
    }
  }

  async validate(code) {
    return typeof code === 'string' && code.trim().length > 0 && code.length < 1000000;
  }

  parseToAST(code) {
    try {
      return parser.parse(code, {
        sourceType: this.sourceType,
        plugins: this.plugins
      });
    } catch (err) {
      throw new Error(`Syntax Error at line ${err.loc?.line}: ${err.message}`);
    }
  }

  analyzeStructure(ast) {
    const report = {
      functions: [],
      imports: [],
      hasPotentialEval: false
    };

    traverse(ast, {
      // Find all function declarations
      FunctionDeclaration(path) {
        report.functions.push(path.node.id.name);
      },
      // Find all imports
      ImportDeclaration(path) {
        report.imports.push(path.node.source.value);
      },
      // Security Check: Look for 'eval()'
      CallExpression(path) {
        if (path.node.callee.name === 'eval') {
          report.hasPotentialEval = true;
        }
      }
    });

    return report;
  }

  handleError(err) {
    console.error(`[Parsing Error]: ${err.message}`);
    return { success: false, error: err.message };
  }
}

module.exports = CodeParsingHandler;