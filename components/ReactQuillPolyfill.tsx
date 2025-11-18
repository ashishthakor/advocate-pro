'use client';

/**
 * Polyfill for ReactDOM.findDOMNode to support react-quill with React 18+
 * This patches ReactDOM synchronously at module load time
 */

// Patch ReactDOM.findDOMNode immediately when this module loads (client-side only)
if (typeof window !== 'undefined') {
  try {
    // Use dynamic import but patch synchronously
    import('react-dom').then((ReactDOM) => {
      // Create a polyfill function
      const findDOMNodePolyfill = function(node: any): Element | Text | null {
        if (node == null) {
          return null;
        }
        // If it's already a DOM node, return it
        if (node.nodeType === 1 || node.nodeType === 3) {
          return node;
        }
        // If it's a ref object, return the current value
        if (typeof node === 'object' && 'current' in node) {
          const current = node.current;
          if (current && (current.nodeType === 1 || current.nodeType === 3)) {
            return current;
          }
          // Recursively try to find DOM node from ref
          return findDOMNodePolyfill(current);
        }
        // If it's a React component instance, try to get the DOM node
        if (node && typeof node === 'object') {
          // Try React 18+ fiber structure
          let fiber = (node as any)._reactInternalFiber || (node as any)._reactInternalInstance;
          
          // Try alternative fiber access methods
          if (!fiber) {
            const keys = Object.keys(node);
            for (const key of keys) {
              if (key.includes('fiber') || key.includes('Fiber') || key.includes('internal')) {
                fiber = (node as any)[key];
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
                const result = findDOMNodePolyfill(stateNode);
                if (result) return result;
              }
            }
            fiber = fiber.return;
          }
        }
        return null;
      };

      // Patch both default export and named export
      if (ReactDOM.default && !ReactDOM.default.findDOMNode) {
        (ReactDOM.default as any).findDOMNode = findDOMNodePolyfill;
      }
      if (!ReactDOM.findDOMNode) {
        (ReactDOM as any).findDOMNode = findDOMNodePolyfill;
      }
      
      // Also patch on the window object for global access
      (window as any).__REACT_DOM_FIND_DOM_NODE__ = findDOMNodePolyfill;
    }).catch((error) => {
      console.warn('Failed to patch ReactDOM.findDOMNode:', error);
    });
  } catch (error) {
    console.warn('Failed to initialize ReactDOM.findDOMNode polyfill:', error);
  }
}

// Export a component that does nothing (for compatibility)
export default function ReactQuillPolyfill() {
  return null;
}

