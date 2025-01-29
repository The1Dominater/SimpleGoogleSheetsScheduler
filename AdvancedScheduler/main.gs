// Global variables
const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
const timezone = Session.getScriptTimeZone();

// Definitions
const REQUIRE_CONSECUTIVE_SHIFTS = true;
const MAX_SHIFT_TIME = 10.0; //Maximum shift time in hours

// Setup header
var staffNames = ["Jake E", "Jeff F", "Jiang G", "Joseph H",	"Joni I",	"Jojo J",	"Jack K",	"Joel L"]
const shiftInfoLabels = ["Day", "Date", "Start Time", "End Time", "Staff Needed"]
const categoryLabels = ["Shift Information", "Staff Names"]
const columnLabels = []
columnLabels.push(...shiftInfoLabels);
columnLabels.push(...staffNames);
const header = [categoryLabels, columnLabels, ["Desired Number of Shifts"], shiftInfoLabels];

const dayCol = shiftInfoLabels.indexOf("Day") + 1;
const dateCol = shiftInfoLabels.indexOf("Date") + 1;
const startIndex = shiftInfoLabels.indexOf("Start Time") + 1;
const endIndex = shiftInfoLabels.indexOf("End Time") + 1;
const staffNeededIndex = shiftInfoLabels.indexOf("Staff Needed");
const numHeaderRows = header.length;
const numShiftInfoLabels = shiftInfoLabels.length

/**
 * When the spreadsheet opens add the functions to the menu options
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("Scheduling")
    .addItem("Make schedule template", "generateTemplate")
    .addItem("Assign shifts", "generateShiftAssignments")
    .addToUi();
}

// Test the helper functions
function testHelpers() {
  const sheet = spreadsheet.getActiveSheet();
  if (!isSheetEmpty(sheet)) {
    Logger.log("Sheet is not empty");
  }

  const firstShift = ["01/27/2025", "09:00AM", "5:00PM"];
  const secondShift = ["01/27/2025", "06:00PM", "10:00PM"];
  // Get first shift's start time as a date obj
  const firstDate = firstShift[0]
  const firstStart = firstShift[1];
  const firstEnd = firstShift[0];
  const firstStartTime = parseDateTime(firstDate, firstStart);
  const firstEndTime = parseDateTime(firstDate, firstEnd);
  // Get second shift's end time as a date obj
  const secondDate = secondShift[0];
  const secondStart = secondShift[1];
  const secondEnd = secondShift[2];
  const secondStartTime = parseDateTime(secondDate, secondStart);
  const secondEndTime = parseDateTime(secondDate, secondEnd);
  if (firstStartTime instanceof Date) {
    Logger.log("Date/Time parsed successfully as: " + firstStartTime);
  }
  if (areShiftsConsecutive(firstEndTime, secondStartTime)) {
    Logger.log("Shifts are consecutive");
  }
  if (exceedsMaxShiftTime(firstStartTime,secondEndTime)) {
    Logger.log("Exceeds maximum shift time.");
  }
}

//Test the template generatorFunctions
function testGeneratorFunctions() {
  generateTemplate()

  const spreadSheet.getActiveSheet();
  generateAssignmentSheet(sheet)
}

//Test the shift schedulerFunctions
function testSchedulerFunctions() {
  generateShiftAssignments();
}
