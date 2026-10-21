!function (t) {
  var i = function i() {
    this.t9Enabled = null, this.wordSuggestion = null, this.layouts = null, this.activeLayout = null, this.activeMode = null, this.defaultLayout = null, this.initSettings = !1;
  };
  i.DICT_DELIMITER = "|", i.prototype.DISPLAY_LANGUAGES = {
    english: "English",
    english_us: "English(US)",
    spanish_us: "Español(US)",
    french_ca: "Français(CA)",
    hindi: "हिन्दी",
    assamese: "অসমীয়া",
    bengali: "বাংলা(IN)",
    gujarati: "ગુજરાતી",
    marathi: "मराठी",
    telugu: "తెలుగు",
    tamil: "தமிழ்",
    malayalam: "മലയാളം",
    punjabi: "ਪੰਜਾਬੀ",
    odia: "ଓଡ଼ିଆ",
    kannada: "ಕನ್ನಡ",
    nepali: "नेपाली",
    konkani: "कोंकणी",
    maithili: "मैथिली",
    dogri: "डोगरी",
    sindhi: "सिन्धी",
    sanskrit: "संस्कृत",
    manipuri: "মণিপুরী",
    bodo: "बोड़ो",
    santali: "ᱥᱟᱱᱛᱟᱞᱤ",
    urdu: "اُردُو",
    kashmiri: "کأشُر",
    portuguese_br: "Português(BR)",
    afrikaans: "Afrikaans",
    arabic: "العربية",
    chinese_cn: "中文(拼音)",
    dutch: "Nederlands",
    english_gb: "English(GB)",
    french_fr: "Français(FR)",
    german: "Deutsch",
    hungarian: "Magyar",
    indonesian: "Bahasa Indonesia",
    italian: "Italiano",
    malay: "Bahasa Melayu",
    persian: "فارسی",
    polish: "Polski",
    portuguese_pt: "Português(PT)",
    romanian: "Română",
    russian: "Русский",
    spanish_es: "Español(ES)",
    swahili: "Kiswahili",
    thai: "ไทย",
    turkish: "Türkçe",
    vietnamese: "Tiếng Việt",
    zulu: "isiZulu",
    bengali_bd: "বাংলা(BD)",
    bulgarian: "Български",
    croatian: "Hrvatski",
    czech: "Česky",
    finnish: "Suomi",
    greek: "Ελληνικά",
    kazakh: "Қазақша",
    khmer: "ភាសាខ្មែរ",
    macedonian: "Македонски",
    serbian: "Српски",
    sinhala: "සිංහල",
    slovak: "Slovenčina",
    slovenian: "Slovenščina",
    swedish: "Svenska",
    tagalog: "Tagalog",
    ukrainian: "Українська",
    xhosa: "isiXhosa",
    albanian: "Shqip",
    armenian: "Հայերեն",
    azerbaijani: "Azərbaycan",
    belarusian: "Беларуская",
    bosnian_latin: "Bosanski(latin)",
    chinese_hk: "中文(筆劃)",
    chinese_tw: "中文(注音)",
    danish: "Dansk",
    estonian: "Eesti",
    georgian: "ქართული",
    hebrew: "עברית",
    icelandic: "Íslenska",
    lao: "ລາວ",
    latvian: "Latviešu",
    lithuanian: "Lietuvių",
    norwegian: "Norsk (bokmål)",
    uzbek_cyrillic: "O'zbek",
    korean: "한국어(대한민국)",
    galician: "Galego",
    basque: "Euskara",
    catalan: "Català",
    spanish_mx: "Español(MX)",
    burmese: "မြန်မာဘာသာ",
    french_af: "Français(AF)",
    portuguese_af: "Português(AF)",
    spanish_ar: "Español(AR)",
    bosnian_cyrillic: "Bosanski(ćirilicom)",
    russian_blr: "Русский(Беларусь)",
    english_gl: "English(general)"
  }, i.prototype.LANGUAGES_ICON_TEXT = {
    hindi: "हि",
    assamese: "অস",
    bengali: "বাং",
    gujarati: "ક",
    marathi: "ळ",
    telugu: "కే",
    tamil: "க",
    malayalam: "ക",
    punjabi: "ਕ",
    odia: "କ",
    kannada: "ಕೆ",
    nepali: "नेपा",
    konkani: "कों",
    maithili: "मैथ",
    dogri: "डो",
    sindhi: "सि",
    sanskrit: "संस",
    manipuri: "মণি",
    bodo: "बर",
    santali: "ᱟ",
    urdu: "اُردُو",
    kashmiri: "کأ",
    arabic: "Ar",
    chinese_cn: "拼",
    persian: "Pe",
    thai: "Th",
    bengali_bd: "বাং",
    khmer: "Km",
    sinhala: "Si",
    chinese_hk: "筆",
    chinese_tw: "注",
    georgian: "Ka",
    hebrew: "He",
    lao: "Lo",
    korean: "가",
    burmese: "ဗမာ"
  }, i.prototype.SETTINGS_KEYS = {
    T9_ENABLED: "keypad.t9-enabled",
    WORD_SUGGESTION: "keypad.wordsuggestion",
    KEYPAD_LAYOUTS: "keypad.layouts",
    DEFAULT_LAYOUT: "keypad.layouts.default",
    ACTIVE_LAYOUT: "keypad.active-layout",
    ACTIVE_MODE: "keypad.active-mode",
    DICT_CHANGE: "keypad.dict-change"
  }, i.prototype.getDisplayLanguageName = function (t) {
    return this.DISPLAY_LANGUAGES[t];
  }, i.prototype.start = function () {
    this.initSettings || this._startComponents();
  }, i.prototype._startComponents = function () {
    this.initSettings = !0, this._observeSettings();
  }, i.prototype._observeSettings = function () {
    var _this = this;
    for (var a in this.SETTINGS_KEYS) {
      var t = this.SETTINGS_KEYS[a];
      SettingsObserver.observe(t, "", function (t, a) {
        _this._stashSettings(a, t, {
          notify: !0
        });
      }, !0);
    }
  }, i.prototype.getSettings = function () {
    var _this2 = this;
    return new Promise(function (a, e) {
      var t = Object.values(_this2.SETTINGS_KEYS);
      SettingsObserver.getBatch(t).then(function (t) {
        t.forEach(function (t) {
          void 0 !== t.value && _this2._stashSettings(t.name, t.value);
        });
        t = {
          t9Enabled: _this2.t9Enabled,
          wordSuggestion: _this2.wordSuggestion,
          layouts: _this2.layouts,
          activeLayout: _this2.activeLayout,
          activeMode: _this2.activeMode
        };
        a(t);
      }).catch(function (t) {
        e(t);
      });
    });
  }, i.prototype._stashSettings = function (t, a, e) {
    if ("" !== a) {
      switch (t) {
        case this.SETTINGS_KEYS.T9_ENABLED:
          this.t9Enabled = a, e && e.notify && this.t9ChangedCallback && this.t9ChangedCallback(a);
          break;
        case this.SETTINGS_KEYS.WORD_SUGGESTION:
          this.wordSuggestion = a, e && e.notify && this.wordSuggestionChangedCallback && this.wordSuggestionChangedCallback(a);
          break;
        case this.SETTINGS_KEYS.KEYPAD_LAYOUTS:
          this.layouts = a, e && e.notify && this.layoutsChangedCallback && this.layoutsChangedCallback(this.layouts);
          break;
        case this.SETTINGS_KEYS.ACTIVE_LAYOUT:
          this.activeLayout = a, e && e.notify && this.activeLayoutChangedCallback && this.activeLayoutChangedCallback(a);
          break;
        case this.SETTINGS_KEYS.ACTIVE_MODE:
          this.activeMode = a, e && e.notify && this.activeModeChangedCallback && this.activeModeChangedCallback(a);
          break;
        case this.SETTINGS_KEYS.DEFAULT_LAYOUT:
          this.defaultLayout = a;
          break;
        case this.SETTINGS_KEYS.DICT_CHANGE:
          e && e.notify && this.dictChangedCallback && this.dictChangedCallback(a);
      }
      e && e.save && this._saveSettings(t, a);
    }
  }, i.prototype._saveSettings = function (t, a) {
    SettingsObserver.setValue([{
      name: t,
      value: a
    }]);
  }, i.prototype.setT9Enabled = function (t) {
    this._stashSettings(this.SETTINGS_KEYS.T9_ENABLED, t, {
      save: !0
    });
  }, i.prototype.setWordSuggestion = function (t) {
    this._stashSettings(this.SETTINGS_KEYS.WORD_SUGGESTION, t, {
      save: !0
    });
  }, i.prototype.setActiveLayout = function (t) {
    this._stashSettings(this.SETTINGS_KEYS.ACTIVE_LAYOUT, t, {
      save: !0
    });
  }, i.prototype.setActiveMode = function (t) {
    this._stashSettings(this.SETTINGS_KEYS.ACTIVE_MODE, t, {
      save: !0
    });
  }, i.prototype.setDefaultLayout = function () {
    for (var _t in this.layouts) this.layouts[_t] = _t === this.defaultLayout;
    this._stashSettings(this.SETTINGS_KEYS.KEYPAD_LAYOUTS, this.layouts, {
      save: !0
    });
  }, i.prototype.setLayouts = function (t) {
    this._stashSettings(this.SETTINGS_KEYS.KEYPAD_LAYOUTS, t, {
      save: !0
    });
  }, i.prototype.getT9Enabled = function () {
    var _this3 = this;
    return new Promise(function (a) {
      null === _this3.t9Enabled ? _this3.getSettings().then(function (t) {
        a(t.t9Enabled);
      }) : a(_this3.t9Enabled);
    });
  }, i.prototype.getWordSuggestion = function () {
    var _this4 = this;
    return new Promise(function (a) {
      null === _this4.wordSuggestion ? _this4.getSettings().then(function (t) {
        a(t.wordSuggestion);
      }) : a(_this4.wordSuggestion);
    });
  }, i.prototype.getLayouts = function () {
    var _this5 = this;
    return new Promise(function (a) {
      _this5.getSettings().then(function (t) {
        a(t.layouts);
      });
    });
  }, i.prototype.getActiveLayout = function () {
    var _this6 = this;
    return new Promise(function (a) {
      null === _this6.activeLayout ? _this6.getSettings().then(function (t) {
        a(t.activeLayout);
      }) : a(_this6.activeLayout);
    });
  }, i.prototype.getActiveMode = function () {
    var _this7 = this;
    return new Promise(function (a) {
      null === _this7.activeMode ? _this7.getSettings().then(function (t) {
        a(t.activeMode);
      }) : a(_this7.activeMode);
    });
  }, i.prototype.getUserWordList = function (t) {
    var _this8 = this;
    return new Promise(function (e, a) {
      _this8.getDictBlobByLang(t).then(function (t) {
        var a = new FileReader();
        a.onload = function (t) {
          var a = t.target.result;
          e(a.split(i.DICT_DELIMITER).slice(0, -1));
        }, a.readAsText(t);
      }, function (t) {
        a(t);
      });
    });
  }, i.prototype.putUserWordList = function (t, a) {
    var e = "";
    return Array.from(a).forEach(function (t) {
      e = e + t + i.DICT_DELIMITER;
    }), this.putDictBlobByLang(t, new Blob([e]));
  }, i.prototype.getDictBlobByLang = function (s) {
    return new Promise(function (e, a) {
      var t = navigator.b2g.getDeviceStorage("sdcard");
      var i = t.get(".dictionary/".concat(s, ".dic"));
      i.onsuccess = function (t) {
        var a = new FileReader();
        a.onload = function (t) {
          t = t.target.result;
          e(new Blob([t]));
        }, a.readAsText(t.target.result);
      }, i.onerror = function (t) {
        a(t);
      };
    });
  }, i.prototype.putDictBlobByLang = function (n, o) {
    var _this9 = this;
    return new Promise(function (a, e) {
      var i = navigator.b2g.getDeviceStorage("sdcard"),
        s = ".dictionary/".concat(n, ".dic"),
        t = i.delete(s);
      t.onsuccess = t.onerror = function () {
        var t = i.addNamed(o, s);
        t.onsuccess = function (t) {
          _this9._stashSettings(_this9.SETTINGS_KEYS.DICT_CHANGE, {
            lang: n,
            changeTime: Date.now()
          }, {
            save: !0
          }), a(t);
        }, t.onerror = function (t) {
          e(t);
        };
      };
    });
  }, i.prototype.setT9ChangedCallback = function (t) {
    this.t9ChangedCallback = t;
  }, i.prototype.setWordSuggestionChangedCallback = function (t) {
    this.wordSuggestionChangedCallback = t;
  }, i.prototype.setLayoutsChangedCallback = function (t) {
    this.layoutsChangedCallback = t;
  }, i.prototype.setActiveLayoutChangedCallback = function (t) {
    this.activeLayoutChangedCallback = t;
  }, i.prototype.setActiveModeChangedCallback = function (t) {
    this.activeModeChangedCallback = t;
  }, i.prototype.setDictChangedCallback = function (t) {
    this.dictChangedCallback = t;
  }, t.KeypadHelper = i;
}(window);
