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
async function translateMap(map) {
  if (!map) return map;

  // If it's a Mongoose Map
  if (typeof map.get === 'function' && typeof map.set === 'function') {
    const viText = map.get('vi');
    if (!viText || viText.trim() === '') {
      return map;
    }
    const languages = ['en', 'ja', 'ko', 'zh'];
    for (const lang of languages) {
      const val = map.get(lang);
      if (!val || val.trim() === '' || val === viText) {
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
  const viText = map.vi;
  if (!viText || viText.trim() === '') {
    return map;
  }
  const languages = ['en', 'ja', 'ko', 'zh'];
  const result = { ...map };
  result.vi = viText;
  for (const lang of languages) {
    const val = result[lang];
    if (!val || val.trim() === '' || val === viText) {
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
