import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('useLocalStorage read error:', error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error('useLocalStorage write error:', error);
      if (
        error?.name === 'QuotaExceededError' ||
        error?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        error?.code === 22 ||
        error?.code === 1014
      ) {
        alert(
          '⚠️ พื้นที่จัดเก็บข้อมูลบนเบราว์เซอร์เต็มแล้ว!\n\n' +
          'กรุณากดปุ่ม "Export JSON" เพื่อสำรองข้อมูลเก็บไว้ในเครื่อง และลบรูปภาพบางส่วนออกเพื่อให้บันทึกต่อได้'
        );
      }
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
