import { render, screen } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ScheduleGrid from '../ScheduleGrid';

const mockTeachers = [
  {
    _id: '1',
    name: 'Test Teacher',
    subjects: ['Math'],
    branch: 'CS',
    availability: [{ day: 'Mon', slot: '08:30-11:30' }]
  }
];

const mockSchedule = [];

const TestWrapper = ({ children }) => (
  <DndProvider backend={HTML5Backend}>
    {children}
  </DndProvider>
);

describe('ScheduleGrid', () => {
  it('renders schedule grid', () => {
    render(
      <TestWrapper>
        <ScheduleGrid
          teachers={mockTeachers}
          schedule={mockSchedule}
          weekStart={new Date()}
          onDrop={() => {}}
          onRemoveBatch={() => {}}
          onMoveSchedule={() => {}}
          onScheduleEdit={() => {}}
          onEditTeacher={() => {}}
          onDeleteTeacher={() => {}}
          onAssignBatch={() => {}}
          loading={false}
          branch=""
          configUpdated={0}
          onEditAvailability={() => {}}
          user={{ role: 'admin' }}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Teacher')).toBeInTheDocument();
    expect(screen.getByText('Mon')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(
      <TestWrapper>
        <ScheduleGrid
          teachers={mockTeachers}
          schedule={mockSchedule}
          weekStart={new Date()}
          onDrop={() => {}}
          onRemoveBatch={() => {}}
          onMoveSchedule={() => {}}
          onScheduleEdit={() => {}}
          onEditTeacher={() => {}}
          onDeleteTeacher={() => {}}
          onAssignBatch={() => {}}
          loading={true}
          branch=""
          configUpdated={0}
          onEditAvailability={() => {}}
          user={{ role: 'admin' }}
        />
      </TestWrapper>
    );

    // Check for loading spinner (might need to adjust based on actual implementation)
    const loadingElement = document.querySelector('.animate-spin');
    expect(loadingElement).toBeInTheDocument();
  });
});






