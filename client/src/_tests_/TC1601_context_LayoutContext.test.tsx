import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LayoutProvider, useLayout } from '../context/LayoutContext';

/**
 * Test Case ID: TC1601_context_LayoutContext
 * Test Summary: Tests the LayoutContext implementation, verifying that 
 * state is properly maintained and updates correctly with user interactions.
 */

// Test component to consume context
const TestComponent = () => {
  const { state, setLayoutType, registerPanel } = useLayout();
  
  return (
    <div>
      <div data-testid="layout-type">{state.layoutType}</div>
      <button 
        onClick={() => setLayoutType('dual')}
        data-testid="change-layout"
      >
        Change Layout
      </button>
      <button 
        onClick={() => registerPanel({
          id: 'test',
          contentType: 'map',
          title: 'Test Panel'
        })}
        data-testid="add-panel"
      >
        Add Panel
      </button>
      <div data-testid="panel-count">{Object.keys(state.panels).length}</div>
    </div>
  );
};

describe('TC1601_context_LayoutContext: Layout Context', () => {
  test('TC1601.1: Should provide initial layout state', () => {
    render(
      <LayoutProvider>
        <TestComponent />
      </LayoutProvider>
    );
    
    expect(screen.getByTestId('layout-type')).toHaveTextContent('single');
    expect(screen.getByTestId('panel-count')).toHaveTextContent('0');
  });
  
  test('TC1601.2: Should update layout type', () => {
    render(
      <LayoutProvider>
        <TestComponent />
      </LayoutProvider>
    );
    
    fireEvent.click(screen.getByTestId('change-layout'));
    
    expect(screen.getByTestId('layout-type')).toHaveTextContent('dual');
  });
  
  test('TC1601.3: Should register a panel', () => {
    render(
      <LayoutProvider>
        <TestComponent />
      </LayoutProvider>
    );
    
    fireEvent.click(screen.getByTestId('add-panel'));
    
    expect(screen.getByTestId('panel-count')).toHaveTextContent('1');
  });
}); 