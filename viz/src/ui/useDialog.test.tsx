import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';
import { useDialog } from './useDialog';

afterEach(() => {
  cleanup();
});

const TestDialog: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const dialogRef = useDialog(open, onClose);
  return <dialog ref={dialogRef} />;
};

describe('useDialog', () => {
  it('opens the dialog when open becomes true, closes it when open becomes false', async () => {
    const { rerender } = render(<TestDialog open={false} onClose={() => {}} />);
    const dialog = document.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.open).toBe(false);

    rerender(<TestDialog open={true} onClose={() => {}} />);
    await waitFor(() => expect(dialog.open).toBe(true));

    rerender(<TestDialog open={false} onClose={() => {}} />);
    await waitFor(() => expect(dialog.open).toBe(false));
  });

  it('calls onClose when the dialog fires a native close event', async () => {
    const onClose = vi.fn();
    render(<TestDialog open={true} onClose={onClose} />);
    const dialog = document.querySelector('dialog') as HTMLDialogElement;
    await waitFor(() => expect(dialog.open).toBe(true));

    dialog.close();

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes the dialog on a backdrop click (click target === dialog)', async () => {
    render(<TestDialog open={true} onClose={() => {}} />);
    const dialog = document.querySelector('dialog') as HTMLDialogElement;
    await waitFor(() => expect(dialog.open).toBe(true));

    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(dialog.open).toBe(false);
  });
});
