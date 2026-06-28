import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ValidationFeedback from './ValidationFeedback';

describe('ValidationFeedback Component', () => {
  it('should not render anything when field is not touched', () => {
    const { container } = render(
      <ValidationFeedback isValid={true} isTouched={false} hasError={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render error icon when field has error and is touched', () => {
    const { container } = render(
      <ValidationFeedback isValid={false} isTouched={true} hasError={true} />
    );
    const errorIcon = container.querySelector('svg');
    expect(errorIcon).toBeTruthy();
    expect(container.textContent).toContain('');
  });

  it('should render green checkmark when field is valid and touched', () => {
    const { container } = render(
      <ValidationFeedback isValid={true} isTouched={true} hasError={false} />
    );
    const checkIcon = container.querySelector('svg');
    expect(checkIcon).toBeTruthy();
    expect(checkIcon?.classList.contains('text-green-500')).toBe(true);
  });

  it('should not render anything when field is touched but not valid and has no error', () => {
    const { container } = render(
      <ValidationFeedback isValid={false} isTouched={true} hasError={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should prioritize error state over valid state', () => {
    const { container } = render(
      <ValidationFeedback isValid={true} isTouched={true} hasError={true} />
    );
    const errorIcon = container.querySelector('svg');
    expect(errorIcon?.classList.contains('text-red-500')).toBe(true);
  });
});
