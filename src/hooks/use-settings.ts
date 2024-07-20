import { useEffect, useState } from 'preact/hooks';
import { ISettings } from '../common/types';
import { getSettings } from '../common/utils';

export function useSettings() {
  const [settings, setSettings] = useState<ISettings>({
    urlList: [],
  });

  useEffect(() => {
    (async () => {
      const settings = await getSettings();
      setSettings(settings);
    })();
  }, []);

  return {
    settings,
    setSettings,
  };
}
