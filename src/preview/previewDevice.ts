const KEY = '1pay_preview_device_v1';

export type PreviewDevice = 'desktop' | 'mobile';

export function readPreviewDevice(): PreviewDevice {
  try {
    const v = sessionStorage.getItem(KEY);
    if (v === 'mobile' || v === 'desktop') return v;
  } catch {
    /* ignore */
  }
  return 'mobile';
}

export function writePreviewDevice(d: PreviewDevice) {
  try {
    sessionStorage.setItem(KEY, d);
  } catch {
    /* ignore */
  }
}
