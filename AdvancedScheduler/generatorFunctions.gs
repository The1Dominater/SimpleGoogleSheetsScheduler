/** generatTemplate()
 * This function makes a simple example of the 
 * acceptable template that can be handled by the 
 * assignShifts function
 * 
 * Input: none
 * Output: Table - an example template
 */
function generateTemplate() {
  // Setup initial variables
  const today = new Date();

  // Check to see if the sheet is empty
  var sheet = spreadsheet.getActiveSheet();
  
  if (!(isSheetEmpty(sheet))) {
    time  = Utilities.formatDate(today, timezone, "HH:mm:ss");
    sheet = spreadsheet.insertSheet("Scheduler Template(" + time + ")");
  }

  // Style the first row differently
  var headerRange = sheet.getRange(1, 1, 1, columnLabels.length);
  headerRange.setFontWeight("bold");
  headerRange.setFontColor("#FFFFFF");
  headerRange.setHorizontalAlignment('center');

  headerRange = sheet.getRange(1,1,2,numShiftInfoLabels);
  headerRange.setBackground("#274e13");
  headerRange.setValue(categoryLabels[0]);
  headerRange.setFontSize(20);
  headerRange.merge();

  headerRange = sheet.getRange(1,numShiftInfoLabels + 1,1,staffNames.length);
  headerRange.setBackground("#1c4587");
  headerRange.setValue(categoryLabels[1]);
  headerRange.mergeAcross();

  // Style second row differently
  headerRange = sheet.getRange(2,numShiftInfoLabels + 1,1, staffNames.length);
  headerRange.setFontWeight("bold");
  headerRange.setHorizontalAlignment('center');
  headerRange.setValues([staffNames]);

  // Setup third row to contain desired number of shifts
  headerRange = sheet.getRange(3,1,1, numShiftInfoLabels);
  headerRange.setValue("Desired Number of Shifts");
  headerRange.setHorizontalAlignment('center');
  headerRange.setFontWeight("bold");
  headerRange.mergeAcross();

  headerRange = sheet.getRange(3,numShiftInfoLabels + 1,1, staffNames.length);
  headerRange.setValue(1);

  // Setup forth row
  headerRange = sheet.getRange(4,1,1, columnLabels.length);
  headerRange.setBackground("#292626");
  headerRange.setFontColor("#FFFFFF");
  headerRange.setFontWeight("bold");
  headerRange.setHorizontalAlignment('center');

  headerRange = sheet.getRange(4,1,1, numShiftInfoLabels);
  headerRange.setValues([shiftInfoLabels]);

  // Setup example rows
  const template = [];
  var date = new Date(today);
  const firstDay = Utilities.formatDate(date, timezone, "MM/dd/yyyy");
  date.setDate(date.getDate() + 3);
  const lastDay = Utilities.formatDate(date, timezone, "MM/dd/yyyy");
  const shiftDates = calculateShiftDates(firstDay, lastDay)
  const openingTime = "8:00AM";
  const closingTime = "8:00PM";
  const shiftLength = 4;
  const shiftTimes = calculateShiftTimes(openingTime, closingTime, shiftLength);

  for (let i = 0; i < shiftDates.length; i++) {
    // Set date obj
    date = shiftDates[i]
    // Set the date as a weekday string
    weekday = Utilities.formatDate(date, timezone, "EEEE");
    // Set the date as a number string
    numday = Utilities.formatDate(date, timezone, "MM/dd/yyyy");

    for (let j = 0; j < shiftTimes.length; j++) {
      // Set shift time interval
      shift = shiftTimes[j];
      startTime = shift["start_time"];
      endTime = shift["end_time"]
      // Set the number of staff needed
      numStaff = 1

      // Set values for example shifts
      shiftInfo =[weekday, numday, startTime, endTime, numStaff];
      template.push(shiftInfo);

      // Change background for example availability
      row = (header.length + 1 + (i * shiftTimes.length)) + j ;
      for (let col = shiftInfo.length + 1; col <= columnLabels.length; col++) {
        cell = sheet.getRange(row,col)
        if ( (row % 2) == 0) {
          cell.setBackground("#ff0000");
        }
        else {
          cell.setBackground("#00ff00");
        }
      }
    }
  }

  // Insert the example values
  examplesRange = sheet.getRange((header.length + 1),1,template.length,template[0].length);
  examplesRange.setValues(template);
}

function generateAssignmentSheet(sheet) {
  const sheetName = sheet.getName();
  
  // Check to see if the sheet is empty
  if (isSheetEmpty(sheet)) {
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert(
      "No Availability Data!",
      "The sheet " + sheetName + " does not contain data. Do you want to generate a new availability template?",
      ui.ButtonSet.OK_CANCEL
    );

    if (response == ui.Button.OK) {
      generateTemplate();
      ui.alert("Generated Template.");
    }
    else {
      // If the user chooses "Cancel," exit the function
      ui.alert("Operation canceled.");
    }

    return;
  }

  // Prevent duplicating assigned schedules
  var assignmentSheetName = sheetName;
  if (!(sheetName.includes("Schedule For"))) {
    assignmentSheetName = "Schedule For " + assignmentSheetName;
  }

  // Setup the output sheet for holding shift assignments
  var assignmentSheet = spreadsheet.getSheetByName(assignmentSheetName);
  if (!assignmentSheet) {
    // Create a new sheet if it doesn't exist already
    assignmentSheet = spreadsheet.insertSheet(assignmentSheetName);
  }
  else {
    // Check if the output sheet already contains data
    if (!(isSheetEmpty(assignmentSheet))) {
      // const ui = SpreadsheetApp.getUi();
      // const response = ui.alert(
      //   "Data Exists",
      //   "The shift assignment sheet " + assignmentSheet + " already contains data. Do you want to override it?",
      //   ui.ButtonSet.OK_CANCEL
      // );

      // if (response != ui.Button.OK) {
      //   // If the user chooses "Cancel," exit the function
      //   ui.alert("Operation canceled.");
      //   return;
      // }
    }
  }

  // Style the header row differently
  const assingmentHeader = assignmentSheet.getRange(1, 1, 1, sheet.getLastColumn());
  assingmentHeader.setFontWeight("bold");
  assingmentHeader.setFontColor("#FFFFFF");
  assingmentHeader.setHorizontalAlignment("center");

  // Setup shift info labels
  const shiftHeader = assignmentSheet.getRange(1, 1, 1, numShiftInfoLabels);
  shiftHeader.setFontWeight("bold");
  shiftHeader.setFontColor("#FFFFFF");
  shiftHeader.setBackground("#4B4B4B");
  shiftHeader.setHorizontalAlignment("center");
  assignmentSheet.getRange(1,1,1,numShiftInfoLabels).setValues([shiftInfoLabels]);

  const lastRow = sheet.getLastRow()
  const formulas = [];

  // Duplicate shift data
  for (let i = numHeaderRows + 1; i <= lastRow; i++) {
      formulas.push(['=\'' + sheetName + '\'!A' + i,
                     '=TEXT(\'' + sheetName + '\'!B' + i + ', "MM/DD/yyyy")',
                     '=TEXT(\'' + sheetName + '\'!C' + i + ', "hh:mm:ss AM/PM")',
                     '=TEXT(\'' + sheetName + '\'!D' + i + ', "hh:mm:ss AM/PM")',
                     '=INT(\'' + sheetName + '\'!E' + i + ')']);
  }
  
  assignmentSheet.getRange(2,dayCol,(lastRow - numHeaderRows),numShiftInfoLabels).setFormulas(formulas);

  // Set up staff names
  const staffHeader = assignmentSheet.getRange(1, numShiftInfoLabels + 1, 1,  sheet.getLastColumn() - numShiftInfoLabels);
  staffHeader.setFontWeight("bold");
  staffHeader.setFontColor("#FFFFFF");
  staffHeader.setBackground("#1c4587");
  staffHeader.setHorizontalAlignment("center")
  const currentNameValues = sheet.getRange(2,numShiftInfoLabels + 1, 1, sheet.getLastColumn() - numShiftInfoLabels).getValues();
  staffHeader.setValues(currentNameValues);
  // Update existing list of staff names to make new list of staff names
  staffNames = currentNameValues[0];

  return assignmentSheet;
}
