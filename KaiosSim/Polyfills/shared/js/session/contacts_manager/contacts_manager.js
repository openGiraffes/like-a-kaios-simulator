function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, e) { if ("object" != _typeof(t) || !t) return t; var r; if ("undefined" != typeof Symbol && void 0 !== (r = t[Symbol.toPrimitive])) { var i = r.call(t, e || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === e ? String : Number)(t); }
var ContactsManager = {
  connected: !1,
  initFlag: !1,
  safeChar: "",
  eventListenerInfo: {},
  onContactChangeCallback: null,
  onSpeedDialChangeCallback: null,
  onContactGroupChangeCallback: null,
  onBlockedNumberChangeCallback: null,
  EventMap: {
    BLOCKED_NUMBER_CHANGE: "blockChange",
    CONTACT_CHANGE: "contactChange",
    GROUP_CHANGE: "groupChange",
    SPEED_DIAL_CHANGE: "speedDialChange",
    SIM_LOADED_EVENT: "simLoadedEvent"
  },
  ChangeReason: {
    CREATE: 0,
    UPDATE: 1,
    REMOVE: 2
  },
  FilterByOption: {
    NAME: 0,
    GIVEN_NAME: 1,
    FAMILY_NAME: 2,
    TEL: 3,
    EMAIL: 4,
    CATEGORY: 5
  },
  FilterOption: {
    EQUALS: 0,
    CONTAINS: 1,
    MATCH: 2,
    STARTS_WITH: 3,
    FUZZY_MATCH: 4
  },
  Order: {
    ASCENDING: 0,
    DESCENDING: 1
  },
  SortOption: {
    GIVEN_NAME: 0,
    FAMILY_NAME: 1,
    NAME: 2
  },
  init: function init() {
    var _this = this;
    this.initFlag || (this.initFlag = !0, window.addEventListener("session-disconnected", function () {
      _this.connected = !1;
    }), window.addEventListener("services-load-observer", function () {
      var _window$api$contactsm, _window$lib_contacts;
      var e, t, a, r, n;
      _this.connected || (_this.connected = !0, _window$api$contactsm = window.api.contactsmanager, e = _window$api$contactsm.BLOCKEDNUMBER_CHANGE_EVENT, t = _window$api$contactsm.CONTACTS_CHANGE_EVENT, a = _window$api$contactsm.GROUP_CHANGE_EVENT, r = _window$api$contactsm.SPEEDDIAL_CHANGE_EVENT, n = _window$api$contactsm.SIM_CONTACT_LOADED_EVENT, Object.assign(_this.EventMap, _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty({}, _this.EventMap.BLOCKED_NUMBER_CHANGE, e), _this.EventMap.CONTACT_CHANGE, t), _this.EventMap.GROUP_CHANGE, a), _this.EventMap.SPEED_DIAL_CHANGE, r), _this.EventMap.SIM_LOADED_EVENT, n)), _window$lib_contacts = window.lib_contacts, e = _window$lib_contacts.ChangeReason, t = _window$lib_contacts.FilterByOption, a = _window$lib_contacts.FilterOption, r = _window$lib_contacts.Order, n = _window$lib_contacts.SortOption, _this.ChangeReason = e, _this.FilterByOption = t, _this.FilterOption = a, _this.Order = r, _this.SortOption = n), _this.recoverListener();
    }));
  },
  find: function find() {
    for (var _len = arguments.length, e = new Array(_len), _key = 0; _key < _len; _key++) {
      e[_key] = arguments[_key];
    }
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: "find",
      args: e
    });
  },
  getAll: function getAll() {
    for (var _len2 = arguments.length, e = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      e[_key2] = arguments[_key2];
    }
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: "getAll",
      args: e
    });
  },
  getContactByID: function getContactByID() {
    for (var _len3 = arguments.length, e = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      e[_key3] = arguments[_key3];
    }
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: "get",
      args: e
    });
  },
  remove: function remove() {
    for (var _len4 = arguments.length, e = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      e[_key4] = arguments[_key4];
    }
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: "remove",
      args: e
    });
  },
  save: function save(e) {
    for (var _len5 = arguments.length, t = new Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
      t[_key5 - 1] = arguments[_key5];
    }
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: e ? "add" : "update",
      args: t
    });
  },
  moveContactsToDevice: function moveContactsToDevice() {
    for (var _len6 = arguments.length, e = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
      e[_key6] = arguments[_key6];
    }
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: "moveContactsToDevice",
      args: e
    });
  },
  moveContactsToSim: function moveContactsToSim() {
    for (var _len7 = arguments.length, e = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
      e[_key7] = arguments[_key7];
    }
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: "moveContactsToSim",
      args: e
    });
  },
  clear: function clear() {
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: "clearContacts"
    });
  },
  getCount: function getCount() {
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: "getCount"
    });
  },
  getSpeedDials: function getSpeedDials() {
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: "getSpeedDials"
    });
  },
  removeSpeedDial: function removeSpeedDial() {
    for (var _len8 = arguments.length, e = new Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
      e[_key8] = arguments[_key8];
    }
    e = this.safeChar + e[0];
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: "removeSpeedDial",
      args: [e]
    });
  },
  setSpeedDial: function setSpeedDial(e, _ref) {
    var t = _ref.dialKey,
      a = _ref.tel,
      r = _ref.contactId;
    t = this.safeChar + t;
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: e ? "addSpeedDial" : "updateSpeedDial",
      args: [t, a, r]
    });
  },
  getAllICE: function getAllICE() {
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: "getAllIce"
    });
  },
  removeICE: function removeICE() {
    for (var _len9 = arguments.length, e = new Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
      e[_key9] = arguments[_key9];
    }
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: "removeIce",
      args: e
    });
  },
  setICE: function setICE() {
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: "setIce",
      args: [arguments.length <= 0 ? undefined : arguments[0], Number(arguments.length <= 1 ? undefined : arguments[1])]
    });
  },
  getAllGroups: function getAllGroups() {
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: "getAllGroups"
    });
  },
  saveGroup: function saveGroup(e, t) {
    var a = t.id ? this.safeChar + t.id : this.safeChar,
      t = this.safeChar + t.name;
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: e ? "addGroup" : "updateGroup",
      args: e ? [t] : [a, t]
    });
  },
  getContactIdsFromGroup: function getContactIdsFromGroup() {
    for (var _len0 = arguments.length, e = new Array(_len0), _key0 = 0; _key0 < _len0; _key0++) {
      e[_key0] = arguments[_key0];
    }
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: "getContactidsFromGroup",
      args: e
    });
  },
  removeGroup: function removeGroup() {
    for (var _len1 = arguments.length, e = new Array(_len1), _key1 = 0; _key1 < _len1; _key1++) {
      e[_key1] = arguments[_key1];
    }
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: "removeGroup",
      args: e
    });
  },
  getAllBlockedNumbers: function getAllBlockedNumbers() {
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: "getAllBlockedNumbers"
    });
  },
  findBlockedNumbers: function findBlockedNumbers() {
    for (var _len10 = arguments.length, e = new Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
      e[_key10] = arguments[_key10];
    }
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: "findBlockedNumbers",
      args: e
    });
  },
  addBlockedNumber: function addBlockedNumber() {
    for (var _len11 = arguments.length, e = new Array(_len11), _key11 = 0; _key11 < _len11; _key11++) {
      e[_key11] = arguments[_key11];
    }
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: "addBlockedNumber",
      args: e
    });
  },
  removeBlockedNumber: function removeBlockedNumber() {
    for (var _len12 = arguments.length, e = new Array(_len12), _key12 = 0; _key12 < _len12; _key12++) {
      e[_key12] = arguments[_key12];
    }
    return taskScheduler.request({
      serverName: taskScheduler.CONTACTS,
      funcName: "removeBlockedNumber",
      args: e
    });
  },
  addEventListener: function addEventListener(e, t) {
    Object.values(this.EventMap).includes(e) && (this.connected && window.api.contactsmanager.addEventListener(this.EventMap[e], t), this.eventListenerInfo[e] ? this.eventListenerInfo[e].push(t) : this.eventListenerInfo[e] = [t]);
  },
  removeEventListener: function removeEventListener(a, r) {
    var _this2 = this;
    Object.values(this.EventMap).includes(a) && (this.connected && window.api.contactsmanager.removeEventListener(this.EventMap[a], r), this.eventListenerInfo[a] && this.eventListenerInfo[a].forEach(function (e, t) {
      e === r && _this2.eventListenerInfo[a].splice(t, 1);
    }));
  },
  recoverListener: function recoverListener() {
    var _this3 = this;
    var _loop = function _loop() {
      var t = _this3.eventListenerInfo[e],
        a = _this3.EventMap[e];
      a && t.forEach(function (e) {
        window.api.contactsmanager.addEventListener(a, e);
      });
    };
    for (var e in this.eventListenerInfo) {
      _loop();
    }
    this.onContactChange(this.onContactChangeCallback), this.onSpeedDialChange(this.onSpeedDialChangeCallback), this.onContactGroupChange(this.onContactGroupChangeCallback), this.onBlockedNumberChange(this.onBlockedNumberChangeCallback);
  },
  onContactChange: function onContactChange(e) {
    this.onContactChangeCallback = e, this.connected && (window.api.contactsmanager.oncontactchange = e);
  },
  onSpeedDialChange: function onSpeedDialChange(e) {
    this.onSpeedDialChangeCallback = e, this.connected && (window.api.contactsmanager.onspeeddialchange = e);
  },
  onContactGroupChange: function onContactGroupChange(e) {
    this.onContactGroupChangeCallback = e, this.connected && (window.api.contactsmanager.oncontactgroupchange = e);
  },
  onBlockedNumberChange: function onBlockedNumberChange(e) {
    this.onBlockedNumberChangeCallback = e, this.connected && (window.api.contactsmanager.onblockednumberchange = e);
  }
};
ContactsManager.init(), window.ContactsManager = ContactsManager;
