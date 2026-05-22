const SHEETS = {
  appointments: "预约记录",
  members: "会员资料",
  config: "系统设置"
};

const APPOINTMENT_HEADERS = [
  "预约ID",
  "类型",
  "预约状态",
  "预约日期",
  "开始时间",
  "服务时长",
  "结束时间",
  "客户姓名",
  "手机号",
  "会员ID",
  "是否会员",
  "服务项目",
  "人员",
  "房间",
  "仪器",
  "备注",
  "登记人",
  "创建时间",
  "更新时间"
];

const MEMBER_HEADERS = [
  "会员ID",
  "客户姓名",
  "手机号",
  "会员等级",
  "开卡日期",
  "到期日期",
  "套餐项目",
  "剩余次数",
  "余额",
  "累计消费",
  "最近到店日期",
  "会员状态",
  "备注",
  "创建时间",
  "更新时间"
];

const CONFIG_HEADERS = ["配置项", "配置值"];

function doPost(event) {
  try {
    const body = JSON.parse(event.postData.contents || "{}");
    if (body.action === "getAll") {
      return jsonOutput({
        ok: true,
        config: readConfig(),
        appointments: readAppointments(),
        members: readMembers()
      });
    }

    if (body.action === "saveAll") {
      writeConfig(body.config || {});
      writeAppointments(body.appointments || []);
      writeMembers(body.members || []);
      return jsonOutput({ ok: true, message: "saved" });
    }

    return jsonOutput({ ok: false, message: "Unknown action" });
  } catch (error) {
    return jsonOutput({ ok: false, message: error.message });
  }
}

function setupSheets() {
  getSheet(SHEETS.appointments, APPOINTMENT_HEADERS);
  getSheet(SHEETS.members, MEMBER_HEADERS);
  getSheet(SHEETS.config, CONFIG_HEADERS);
}

function getSheet(name, headers) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(name);
  }

  const firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const needsHeaders = firstRow.every((cell) => !cell);
  if (needsHeaders) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function readConfig() {
  const sheet = getSheet(SHEETS.config, CONFIG_HEADERS);
  const rows = sheet.getDataRange().getValues().slice(1);
  const config = {};
  rows.forEach(([key, value]) => {
    if (!key) return;
    try {
      config[key] = JSON.parse(value);
    } catch (error) {
      config[key] = value;
    }
  });
  return config;
}

function writeConfig(config) {
  const sheet = getSheet(SHEETS.config, CONFIG_HEADERS);
  sheet.clearContents();
  sheet.getRange(1, 1, 1, CONFIG_HEADERS.length).setValues([CONFIG_HEADERS]);
  const rows = Object.keys(config).map((key) => [key, JSON.stringify(config[key])]);
  if (rows.length) {
    sheet.getRange(2, 1, rows.length, CONFIG_HEADERS.length).setValues(rows);
  }
}

function readAppointments() {
  const sheet = getSheet(SHEETS.appointments, APPOINTMENT_HEADERS);
  return sheetToObjects(sheet).map((row) => ({
    id: row["预约ID"],
    type: row["类型"],
    status: row["预约状态"],
    date: row["预约日期"],
    startTime: row["开始时间"],
    duration: Number(row["服务时长"] || 0),
    customer: row["客户姓名"],
    phone: row["手机号"],
    memberId: row["会员ID"],
    service: row["服务项目"],
    staff: row["人员"],
    room: row["房间"],
    instrument: row["仪器"],
    notes: row["备注"],
    createdBy: row["登记人"],
    createdAt: row["创建时间"],
    updatedAt: row["更新时间"]
  }));
}

function writeAppointments(appointments) {
  const sheet = getSheet(SHEETS.appointments, APPOINTMENT_HEADERS);
  sheet.clearContents();
  sheet.getRange(1, 1, 1, APPOINTMENT_HEADERS.length).setValues([APPOINTMENT_HEADERS]);
  const rows = appointments.map((item) => [
    item.id,
    item.type,
    item.status,
    item.date,
    item.startTime,
    item.duration,
    getEndTime(item.startTime, item.duration),
    item.customer,
    item.phone,
    item.memberId,
    item.memberId ? "是" : "否",
    item.service,
    item.staff,
    item.room,
    item.instrument,
    item.notes,
    item.createdBy,
    item.createdAt,
    item.updatedAt
  ]);
  if (rows.length) {
    sheet.getRange(2, 1, rows.length, APPOINTMENT_HEADERS.length).setValues(rows);
  }
}

function readMembers() {
  const sheet = getSheet(SHEETS.members, MEMBER_HEADERS);
  return sheetToObjects(sheet).map((row) => ({
    id: row["会员ID"],
    name: row["客户姓名"],
    phone: row["手机号"],
    level: row["会员等级"],
    openedAt: row["开卡日期"],
    expiresAt: row["到期日期"],
    packageName: row["套餐项目"],
    remainingTimes: row["剩余次数"],
    balance: row["余额"],
    totalSpend: row["累计消费"],
    lastVisitAt: row["最近到店日期"],
    status: row["会员状态"],
    notes: row["备注"],
    createdAt: row["创建时间"],
    updatedAt: row["更新时间"]
  }));
}

function writeMembers(members) {
  const sheet = getSheet(SHEETS.members, MEMBER_HEADERS);
  sheet.clearContents();
  sheet.getRange(1, 1, 1, MEMBER_HEADERS.length).setValues([MEMBER_HEADERS]);
  const rows = members.map((item) => [
    item.id,
    item.name,
    item.phone,
    item.level,
    item.openedAt,
    item.expiresAt,
    item.packageName,
    item.remainingTimes,
    item.balance,
    item.totalSpend,
    item.lastVisitAt,
    item.status,
    item.notes,
    item.createdAt,
    item.updatedAt
  ]);
  if (rows.length) {
    sheet.getRange(2, 1, rows.length, MEMBER_HEADERS.length).setValues(rows);
  }
}

function sheetToObjects(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  const headers = values[0];
  return values.slice(1).filter((row) => row.some(Boolean)).map((row) => {
    const object = {};
    headers.forEach((header, index) => {
      object[header] = normalizeCell(row[index]);
    });
    return object;
  });
}

function normalizeCell(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm");
  }
  return value;
}

function getEndTime(startTime, duration) {
  if (!startTime || !duration) return "";
  const parts = String(startTime).split(":").map(Number);
  const total = parts[0] * 60 + parts[1] + Number(duration);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function jsonOutput(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
