'use client';

import { useEffect } from 'react';

/**
 * Polyfill for ReactDOM.findDOMNode to support react-quill with React 18+
 * This patches ReactDOM at the module level before react-quill loads
 */
export default function ReactQuillPolyfill() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Patch ReactDOM.findDOMNode immediately
      const patchFindDOMNode = async () => {
        try {
          const ReactDOM = await import('react-dom');
          
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
            }
            // If it's a React component instance, try to get the DOM node
            if (node && typeof node === 'object') {
              // Try React 18+ fiber structure
              let fiber = (node as any)._reactInternalFiber || (node as any)._reactInternalInstance;
              while (fiber) {
                if (fiber.stateNode) {
                  const stateNode = fiber.stateNode;
                  if (stateNode.nodeType === 1 || stateNode.nodeType === 3) {
                    return stateNode;
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
          if (typeof window !== 'undefined') {
            (window as any).__REACT_DOM_FIND_DOM_NODE__ = findDOMNodePolyfill;
          }
        } catch (error) {
          console.warn('Failed to patch ReactDOM.findDOMNode:', error);
        }
      };
      
      patchFindDOMNode();
    }
  }, []);

  return null;
}

