import { render, screen } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import BatchCard from '../BatchCard';

const mockBatch = {
  _id: '1',
  name: 'Test Batch',
  size: 30,
  subjects: ['Math', 'Physics'],
  branch: 'CS'
};

const TestWrapper = ({ children }) => (
  <DndProvider backend={HTML5Backend}>
    {children}
  </DndProvider>
);

describe('BatchCard', () => {
  it('renders batch information', () => {
    render(
      <TestWrapper>
        <BatchCard batch={mockBatch} isSelected={false} onToggle={() => {}} />
      </TestWrapper>
    );

    expect(screen.getByText('Test Batch')).toBeInTheDocument();
    expect(screen.getByText('30 students')).toBeInTheDocument();
    expect(screen.getByText('CS')).toBeInTheDocument();
  });

  it('shows selected state', () => {
    render(
      <TestWrapper>
        <BatchCard batch={mockBatch} isSelected={true} onToggle={() => {}} />
      </TestWrapper>
    );

    const checkmark = screen.getByText('✓');
    expect(checkmark).toBeInTheDocument();
  });

  it('displays subjects', () => {
    render(
      <TestWrapper>
        <BatchCard batch={mockBatch} isSelected={false} onToggle={() => {}} />
      </TestWrapper>
    );

    expect(screen.getByText('Math')).toBeInTheDocument();
  });
});










