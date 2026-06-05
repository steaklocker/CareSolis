import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../config/roles';

/**
 * Copy/Paste Protection Component
 * Prevents unauthorized users from copying sensitive data
 */
export function CopyPasteProtection() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const canCopyPaste = hasPermission(user.role as any, 'copyPaste');

    if (!canCopyPaste) {
      // Prevent copy
      const preventCopy = (e: ClipboardEvent) => {
        e.preventDefault();
        console.warn('🔒 Copy action blocked - insufficient permissions');
        return false;
      };

      // Prevent cut
      const preventCut = (e: ClipboardEvent) => {
        e.preventDefault();
        console.warn('🔒 Cut action blocked - insufficient permissions');
        return false;
      };

      // Prevent paste
      const preventPaste = (e: ClipboardEvent) => {
        e.preventDefault();
        console.warn('🔒 Paste action blocked - insufficient permissions');
        return false;
      };

      // Prevent keyboard shortcuts
      const preventKeyboard = (e: KeyboardEvent) => {
        // Cmd/Ctrl + C (Copy)
        if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
          e.preventDefault();
          console.warn('🔒 Copy shortcut blocked');
          return false;
        }
        
        // Cmd/Ctrl + X (Cut)
        if ((e.metaKey || e.ctrlKey) && e.key === 'x') {
          e.preventDefault();
          console.warn('🔒 Cut shortcut blocked');
          return false;
        }
        
        // Cmd/Ctrl + V (Paste)
        if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
          e.preventDefault();
          console.warn('🔒 Paste shortcut blocked');
          return false;
        }
        
        // Cmd/Ctrl + A (Select All)
        if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
          e.preventDefault();
          console.warn('🔒 Select All blocked');
          return false;
        }
      };

      // Prevent right-click context menu
      const preventContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        console.warn('🔒 Right-click blocked');
        return false;
      };

      // Prevent text selection via CSS
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';

      // Add event listeners
      document.addEventListener('copy', preventCopy);
      document.addEventListener('cut', preventCut);
      document.addEventListener('paste', preventPaste);
      document.addEventListener('keydown', preventKeyboard);
      document.addEventListener('contextmenu', preventContextMenu);

      console.log('🔒 Copy/Paste protection enabled');

      // Cleanup
      return () => {
        document.removeEventListener('copy', preventCopy);
        document.removeEventListener('cut', preventCut);
        document.removeEventListener('paste', preventPaste);
        document.removeEventListener('keydown', preventKeyboard);
        document.removeEventListener('contextmenu', preventContextMenu);
        document.body.style.userSelect = '';
        document.body.style.webkitUserSelect = '';
        console.log('🔒 Copy/Paste protection disabled');
      };
    }
  }, [user]);

  return null; // This component doesn't render anything
}
