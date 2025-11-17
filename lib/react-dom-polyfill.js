/**
 * Polyfill for react-dom to add findDOMNode support for react-quill
 * This wraps the react-dom module to add the missing findDOMNode function
 * 
 * IMPORTANT: This file must be a CommonJS module to work with webpack aliasing
 */

// Import the actual react-dom - use static require to avoid webpack warnings
// Webpack will resolve this at build time, and the NormalModuleReplacementPlugin
// will intercept it for react-quill imports to prevent circular dependencies
const originalReactDOM = require('react-dom');

// Create findDOMNode polyfill
function findDOMNode(node) {
  if (node == null) {
    return null;
  }
  
  // If it's already a DOM node, return it
  if (node.nodeType === 1 || node.nodeType === 3) {
    return node;
  }
  
  // If it's a ref object, return the current value
  if (typeof node === 'object' && node.current != null) {
    const current = node.current;
    if (current && (current.nodeType === 1 || current.nodeType === 3)) {
      return current;
    }
    // Recursively try to find DOM node from ref
    return findDOMNode(current);
  }
  
  // If it's a React component instance, try to get the DOM node
  if (node && typeof node === 'object') {
    // Try React 18+ fiber structure
    let fiber = node._reactInternalFiber || node._reactInternalInstance;
    
    // Try alternative fiber access methods
    if (!fiber) {
      // Try accessing through React internals
      const keys = Object.keys(node);
      for (const key of keys) {
        if (key.includes('fiber') || key.includes('Fiber') || key.includes('internal')) {
          fiber = node[key];
          if (fiber && (fiber.stateNode || fiber.return)) {
            break;
          }
        }
      }
    }
    
    while (fiber) {
      if (fiber.stateNode) {
        const stateNode = fiber.stateNode;
        if (stateNode && (stateNode.nodeType === 1 || stateNode.nodeType === 3)) {
          return stateNode;
        }
        // If stateNode is a component, recurse
        if (stateNode && typeof stateNode === 'object' && !stateNode.nodeType) {
          const result = findDOMNode(stateNode);
          if (result) return result;
        }
      }
      fiber = fiber.return;
    }
  }
  
  return null;
}

// Create a new object that includes all original exports plus findDOMNode
const ReactDOMWithPolyfill = { ...originalReactDOM };

// Add findDOMNode
ReactDOMWithPolyfill.findDOMNode = findDOMNode;

// Handle default export
if (originalReactDOM.default) {
  ReactDOMWithPolyfill.default = { ...originalReactDOM.default };
  ReactDOMWithPolyfill.default.findDOMNode = findDOMNode;
} else {
  // If no default, create one
  ReactDOMWithPolyfill.default = { ...ReactDOMWithPolyfill };
}

// Export everything
module.exports = ReactDOMWithPolyfill;
