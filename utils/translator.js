const https = require('https');

/**
 * Translates a single text string from Vietnamese (vi) to target language.
 * Uses the free Google Translate single API.
 */
async function translateText(text, targetLang) {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return '';
  }

  // If target is Vietnamese, return as-is
  if (targetLang === 'vi') return text;

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=vi&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed && parsed[0] && Array.isArray(parsed[0])) {
            const translated = parsed[0].map(segment => segment[0] || '').join('');
            resolve(translated || text);
          } else {
            resolve(text); // Fallback to original text on unexpected structure
          }
        } catch (err) {
          console.error(`Error parsing translation response for ${targetLang}:`, err.message);
          resolve(text); // Fallback to original text on JSON parse failure
        }
      });
    }).on('error', (err) => {
      console.error(`Translation request error for ${targetLang}:`, err.message);
      resolve(text); // Fallback to original text on request error
    });
  });
}

/**
 * Automatically translates empty fields in a multilingual Map/Object.
 * Input: e.g. { vi: 'Xin chào', en: '', ja: '', ko: '', zh: '' }
 * Output: same object with empty translations populated.
 */
async function translateMap(map, oldMap) {
  if (!map) return map;

  const isMongooseMap = typeof map.get === 'function' && typeof map.set === 'function';
  const getVal = (m, key) => (isMongooseMap ? m.get(key) : m[key]);
  const setVal = (m, key, val) => (isMongooseMap ? m.set(key, val) : (m[key] = val));

  const viText = getVal(map, 'vi');
  if (!viText || viText.trim() === '') {
    return map;
  }

  const oldViText = oldMap ? getVal(oldMap, 'vi') : null;
  const viTextChanged = oldViText !== viText;

  const languages = ['en', 'ja', 'ko', 'zh'];
  
  if (isMongooseMap) {
    for (const lang of languages) {
      const val = map.get(lang);
      const oldVal = oldMap ? oldMap.get(lang) : null;

      const isEmpty = !val || val.trim() === '';
      const isUntranslated = val === viText;
      const isOldTranslationUnchanged = viTextChanged && oldVal !== null && val === oldVal;

      if (isEmpty || isUntranslated || isOldTranslationUnchanged) {
        try {
          const translated = await translateText(viText, lang);
          map.set(lang, translated);
        } catch (err) {
          console.error(`Auto-translate failed for ${lang}:`, err.message);
          map.set(lang, viText);
        }
      }
    }
    return map;
  }

  // If it's a plain object
  const result = { ...map };
  result.vi = viText;
  for (const lang of languages) {
    const val = result[lang];
    const oldVal = oldMap ? oldMap[lang] : null;

    const isEmpty = !val || val.trim() === '';
    const isUntranslated = val === viText;
    const isOldTranslationUnchanged = viTextChanged && oldVal !== null && val === oldVal;

    if (isEmpty || isUntranslated || isOldTranslationUnchanged) {
      try {
        result[lang] = await translateText(viText, lang);
      } catch (err) {
        console.error(`Auto-translate failed for ${lang}:`, err.message);
        result[lang] = viText;
      }
    }
  }
  return result;
}

module.exports = {
  translateText,
  translateMap
};
