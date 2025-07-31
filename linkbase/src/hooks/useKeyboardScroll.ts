import { useRef, useCallback } from "react";
import { ScrollView } from "react-native";

/**
 * Hook that provides keyboard scrolling functionality for forms
 * 
 * @returns {Object} An object containing:
 *   - scrollViewRef: Ref to attach to your ScrollView
 *   - scrollToFocusedInput: Function to call when inputs are focused
 * 
 * @example
 * ```tsx
 * const { scrollViewRef, scrollToFocusedInput } = useKeyboardScroll();
 * 
 * return (
 *   <ScrollView ref={scrollViewRef}>
 *     <Input onFocus={scrollToFocusedInput} />
 *   </ScrollView>
 * );
 * ```
 */
export const useKeyboardScroll = () => {
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToFocusedInput = useCallback(() => {
    if (scrollViewRef.current) {
      // Scroll to end when any input is focused to ensure it's visible
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, []);

  return {
    scrollViewRef,
    scrollToFocusedInput,
  };
}; 