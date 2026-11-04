import { useCallback, useEffect, useRef } from "react";
import axios from "axios";

/**
 * Checks whether an error was thrown due to an aborted or cancelled request.
 */
export function isAbortError(error: unknown): boolean {
  if (axios.isCancel(error)) return true;
  if (error instanceof DOMException && error.name === "AbortError") return true;
  if (
    error instanceof Error &&
    (error.name === "AbortError" || error.name === "CanceledError")
  ) {
    return true;
  }
  return false;
}

/**
 * Manages AbortController instances with automatic cleanup on unmount
 * and cancellation of previous in-flight requests.
 */
export function useAbortController() {
  const controllerRef = useRef<AbortController | null>(null);

  /**
   * Generates a fresh AbortSignal and aborts any active pending request.
   */
  const getSignal = useCallback((): AbortSignal => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    const newController = new AbortController();
    controllerRef.current = newController;
    return newController.signal;
  }, []);

  /**
   * Manually aborts the active request.
   */
  const abort = useCallback((reason?: unknown) => {
    if (controllerRef.current) {
      controllerRef.current.abort(reason);
      controllerRef.current = null;
    }
  }, []);

  /**
   * Returns whether the active controller has been aborted.
   */
  const isAborted = useCallback((): boolean => {
    return controllerRef.current?.signal.aborted ?? false;
  }, []);

  // Cleanup: Abort active request on component unmount
  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
      controllerRef.current = null;
    };
  }, []);

  return {
    getSignal,
    abort,
    isAborted,
  };
}

export default useAbortController;
