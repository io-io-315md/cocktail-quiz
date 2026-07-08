const SHEET_NAME = "recipes";
const PASSWORD = "kirameki";

function doGet(e) {
  const csvText = getRecipeCsvText_();
  const callback = e && e.parameter ? e.parameter.callback : "";

  if (callback) {
    return ContentService
      .createTextOutput(`${callback}(${JSON.stringify({ ok: true, csvText })});`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(csvText)
    .setMimeType(ContentService.MimeType.CSV);
}

function doPost(e) {
  try {
    const payloadText = e.parameter && e.parameter.payload
      ? e.parameter.payload
      : e.postData.contents;
    const payload = JSON.parse(payloadText);

    if (payload.password !== PASSWORD) {
      return createJsonOutput_({ ok: false, message: "Invalid password" });
    }

    const csvText = String(payload.csvText || "").replace(/^\uFEFF/, "");
    const rows = Utilities.parseCsv(csvText);
    const headerRowIndex = findHeaderRowIndex_(rows);

    if (headerRowIndex < 0) {
      return createJsonOutput_({ ok: false, message: "Invalid CSV header" });
    }

    const recipeRows = rows.slice(headerRowIndex);
    const sheet = getRecipeSheet_();
    const maxColumns = recipeRows.reduce((max, row) => Math.max(max, row.length), 0);
    const normalizedRows = recipeRows.map(row => {
      while (row.length < maxColumns) {
        row.push("");
      }

      return row;
    });

    sheet.clearContents();
    sheet.getRange(1, 1, normalizedRows.length, maxColumns).setValues(normalizedRows);
    PropertiesService.getScriptProperties().setProperty("UPDATED_AT", new Date().toISOString());

    return createJsonOutput_({
      ok: true,
      rowCount: Math.max(normalizedRows.length - 1, 0)
    });
  } catch (error) {
    return createJsonOutput_({
      ok: false,
      message: error.message
    });
  }
}

function getRecipeSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  return spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
}

function getRecipeCsvText_() {
  const sheet = getRecipeSheet_();
  const range = sheet.getDataRange();
  const values = range.getDisplayValues();
  const headerRowIndex = findHeaderRowIndex_(values);

  if (headerRowIndex < 0) {
    return "";
  }

  return "\uFEFF" + values.slice(headerRowIndex).map(row => row.map(escapeCsvCell_).join(",")).join("\r\n") + "\r\n";
}

function findHeaderRowIndex_(rows) {
  return rows.findIndex(row => {
    const firstCell = row && row[0] ? String(row[0]).replace(/^\uFEFF/, "").trim() : "";
    return firstCell === "name";
  });
}

function escapeCsvCell_(value) {
  const text = String(value == null ? "" : value);

  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function createJsonOutput_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
