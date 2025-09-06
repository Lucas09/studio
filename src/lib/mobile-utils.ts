// Mobile-specific utilities for iPhone app

export class MobileUtils {
  /**
   * Check if running on iOS
   */
  static isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  /**
   * Check if running on mobile device
   */
  static isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Get viewport height accounting for mobile browser UI
   */
  static getViewportHeight(): number {
    return window.innerHeight;
  }

  /**
   * Get safe area insets for iPhone X and newer
   */
  static getSafeAreaInsets(): {
    top: number;
    bottom: number;
    left: number;
    right: number;
  } {
    const style = getComputedStyle(document.documentElement);
    return {
      top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
      bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
      left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0'),
      right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
    };
  }

  /**
   * Prevent zoom on input focus (iOS Safari)
   */
  static preventZoomOnFocus(): void {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      );
    }
  }

  /**
   * Add touch feedback to element
   */
  static addTouchFeedback(element: HTMLElement): void {
    element.addEventListener('touchstart', () => {
      element.classList.add('active');
    });

    element.addEventListener('touchend', () => {
      setTimeout(() => {
        element.classList.remove('active');
      }, 150);
    });
  }

  /**
   * Vibrate device (if supported)
   */
  static vibrate(pattern: number | number[] = 50): void {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  /**
   * Get device pixel ratio
   */
  static getPixelRatio(): number {
    return window.devicePixelRatio || 1;
  }

  /**
   * Check if device supports haptic feedback
   */
  static supportsHaptics(): boolean {
    return 'vibrate' in navigator;
  }

  /**
   * Add haptic feedback for button presses
   */
  static hapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light'): void {
    if (!this.supportsHaptics()) return;

    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
    };

    this.vibrate(patterns[type]);
  }

  /**
   * Optimize for mobile performance
   */
  static optimizeForMobile(): void {
    // Prevent zoom on input focus
    this.preventZoomOnFocus();

    // Add touch-action CSS for better touch handling
    document.body.style.touchAction = 'manipulation';

    // Add iOS-specific meta tags
    if (this.isIOS()) {
      const meta = document.createElement('meta');
      meta.name = 'apple-mobile-web-app-capable';
      meta.content = 'yes';
      document.head.appendChild(meta);

      const statusBar = document.createElement('meta');
      statusBar.name = 'apple-mobile-web-app-status-bar-style';
      statusBar.content = 'default';
      document.head.appendChild(statusBar);
    }
  }

  /**
   * Get optimal font size for mobile
   */
  static getOptimalFontSize(baseSize: number = 16): number {
    const pixelRatio = this.getPixelRatio();
    return Math.max(baseSize, baseSize * pixelRatio);
  }

  /**
   * Check if device is in landscape mode
   */
  static isLandscape(): boolean {
    return window.innerWidth > window.innerHeight;
  }

  /**
   * Add orientation change listener
   */
  static onOrientationChange(callback: (isLandscape: boolean) => void): () => void {
    const handleOrientationChange = () => {
      callback(this.isLandscape());
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }

  /**
   * Get optimal button size for touch
   */
  static getOptimalButtonSize(): number {
    return Math.max(44, 44 * this.getPixelRatio()); // iOS minimum touch target
  }

  /**
   * Add pull-to-refresh prevention
   */
  static preventPullToRefresh(): void {
    let startY = 0;
    let isAtTop = false;

    document.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
      isAtTop = window.scrollY === 0;
    });

    document.addEventListener('touchmove', (e) => {
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;

      if (isAtTop && deltaY > 0) {
        e.preventDefault();
      }
    });
  }
}
